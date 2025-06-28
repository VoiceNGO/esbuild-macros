import * as ts from 'typescript';

interface Macro {
  node: ts.FunctionDeclaration;
  parameterNames: string[];
}

export function transform(code: string): string {
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    code,
    ts.ScriptTarget.Latest,
    true
  );

  // First pass: find all macro definitions
  const macros = new Map<string, Macro>();
  let nextMacroId = 1;

  function findMacros(node: ts.Node) {
    if (
      ts.isFunctionDeclaration(node) &&
      node.name?.getText().startsWith('$')
    ) {
      const fullText = node.getFullText();
      if (fullText.includes('@macro')) {
        macros.set(node.name.getText(), {
          node,
          parameterNames: node.parameters.map((p) => p.name.getText()),
        });
      }
    }
    ts.forEachChild(node, findMacros);
  }

  findMacros(sourceFile);

  if (macros.size === 0) {
    return code;
  }

  const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
    return (sourceFile) => {
      const visit = (node: ts.Node): ts.Node | ts.Node[] => {
        // Remove macro definitions
        if (
          ts.isFunctionDeclaration(node) &&
          node.name &&
          macros.has(node.name.getText())
        ) {
          return ts.factory.createNotEmittedStatement(node);
        }

        // Handle statement macros: $macro();
        if (
          ts.isExpressionStatement(node) &&
          ts.isCallExpression(node.expression)
        ) {
          const macro = macros.get(node.expression.expression.getText());
          if (macro) {
            const expandedStatements = expandMacro(
              macro,
              node.expression,
              nextMacroId++
            );
            // For statement macros, filter out return statements
            const filteredStatements = expandedStatements.filter(
              (s) => !ts.isReturnStatement(s)
            );
            return filteredStatements;
          }
        }

        // Handle variable declarations with macro calls
        if (ts.isVariableStatement(node)) {
          const decl = node.declarationList.declarations[0];
          if (decl?.initializer && ts.isCallExpression(decl.initializer)) {
            const macroName = decl.initializer.expression.getText();
            const macro = macros.get(macroName);
            if (macro) {
              const currentMacroId = nextMacroId++;
              const expandedStatements = expandMacro(
                macro,
                decl.initializer,
                currentMacroId
              );
              const returnStmt = expandedStatements.find(ts.isReturnStatement);
              const otherStmts = expandedStatements.filter(
                (s) => !ts.isReturnStatement(s)
              );

              if (!returnStmt?.expression) {
                return otherStmts.length > 0
                  ? otherStmts
                  : ts.factory.createNotEmittedStatement(node);
              }

              // Handle destructuring
              if (
                ts.isArrayBindingPattern(decl.name) ||
                ts.isObjectBindingPattern(decl.name)
              ) {
                const newDeclarations = createDestructuringDeclarations(
                  decl.name,
                  returnStmt.expression,
                  context,
                  node.declarationList.flags,
                  currentMacroId
                );
                return [...otherStmts, ...newDeclarations];
              }

              // Handle simple assignment
              const newDecl = context.factory.updateVariableDeclaration(
                decl,
                decl.name,
                decl.exclamationToken,
                decl.type,
                returnStmt.expression
              );
              const newVarStmt = context.factory.updateVariableStatement(
                node,
                node.modifiers,
                context.factory.updateVariableDeclarationList(
                  node.declarationList,
                  [newDecl]
                )
              );
              return [...otherStmts, newVarStmt];
            }
          }
        }

        return ts.visitEachChild(node, visit, context);
      };

      return ts.visitNode(sourceFile, visit) as ts.SourceFile;
    };
  };

  const result = ts.transform(sourceFile, [transformer]);
  const printer = ts.createPrinter({ removeComments: false });
  return printer.printFile(result.transformed[0]);
}

function expandMacro(
  macro: Macro,
  call: ts.CallExpression,
  macroId: number
): ts.Statement[] {
  if (!macro.node.body) return [];

  const declaredVars = new Map<string, string>();

  // Clone and transform the macro body
  const transformer: ts.TransformerFactory<ts.Node> = (context) => {
    return (rootNode) => {
      const visit = (node: ts.Node): ts.Node => {
        // Apply hygiene to variable declarations
        if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
          const oldName = node.name.text;
          const newName = `${oldName}$${macroId}`;
          declaredVars.set(oldName, newName);

          return context.factory.updateVariableDeclaration(
            node,
            context.factory.createIdentifier(newName),
            node.exclamationToken,
            node.type,
            node.initializer
              ? (ts.visitEachChild(
                  node.initializer,
                  visit,
                  context
                ) as ts.Expression)
              : undefined
          );
        }

        // Handle shorthand properties by converting them to full property assignments
        if (
          ts.isShorthandPropertyAssignment(node) &&
          ts.isIdentifier(node.name)
        ) {
          const originalName = node.name.text;
          if (declaredVars.has(originalName)) {
            const hygieneRenamedName = declaredVars.get(originalName)!;
            return context.factory.createPropertyAssignment(
              context.factory.createIdentifier(originalName),
              context.factory.createIdentifier(hygieneRenamedName)
            );
          } else {
            // Even if not hygiene-renamed, convert shorthand to full property assignment
            // to prevent parameter substitution from breaking the property structure
            return context.factory.createPropertyAssignment(
              context.factory.createIdentifier(originalName),
              ts.visitNode(node.name, visit) as ts.Expression
            );
          }
        }

        // Replace references to renamed variables
        if (ts.isIdentifier(node) && declaredVars.has(node.text)) {
          // Don't rename property names in object literals or property access
          if (
            ts.isPropertyAssignment(node.parent) &&
            node.parent.name === node
          ) {
            return node;
          }
          if (
            ts.isPropertyAccessExpression(node.parent) &&
            node.parent.name === node
          ) {
            return node;
          }
          return context.factory.createIdentifier(declaredVars.get(node.text)!);
        }

        // Substitute macro parameters with arguments
        if (ts.isIdentifier(node)) {
          const paramIndex = macro.parameterNames.indexOf(node.text);
          if (paramIndex >= 0 && call.arguments[paramIndex]) {
            // Don't substitute in variable declaration names
            if (
              ts.isVariableDeclaration(node.parent) &&
              node.parent.name === node
            ) {
              return node;
            }
            // Don't substitute property names in object literals
            if (
              ts.isPropertyAssignment(node.parent) &&
              node.parent.name === node
            ) {
              return node;
            }
            return call.arguments[paramIndex];
          }
        }

        return ts.visitEachChild(node, visit, context);
      };

      return ts.visitNode(rootNode, visit);
    };
  };

  const transformedBody = ts.transform(macro.node.body, [transformer]);
  const block = transformedBody.transformed[0] as ts.Block;
  return Array.from(block.statements);
}

function createDestructuringDeclarations(
  pattern: ts.ArrayBindingPattern | ts.ObjectBindingPattern,
  expression: ts.Expression,
  context: ts.TransformationContext,
  flags: ts.NodeFlags,
  macroId: number
): ts.VariableStatement[] {
  const declarations: ts.VariableStatement[] = [];

  if (ts.isArrayBindingPattern(pattern)) {
    // Only support direct array literal returns: return [...]
    if (ts.isArrayLiteralExpression(expression)) {
      const arrayExpr = expression as ts.ArrayLiteralExpression;
      pattern.elements.forEach((element, index) => {
        if (ts.isBindingElement(element) && ts.isIdentifier(element.name)) {
          const value = arrayExpr.elements[index];
          if (value) {
            const decl = context.factory.createVariableDeclaration(
              element.name,
              undefined,
              undefined,
              value
            );
            const stmt = context.factory.createVariableStatement(
              undefined,
              context.factory.createVariableDeclarationList([decl], flags)
            );
            declarations.push(stmt);
          }
        }
      });
    } else {
      // For non-literal arrays, access by index
      pattern.elements.forEach((element, index) => {
        if (ts.isBindingElement(element) && ts.isIdentifier(element.name)) {
          const arrayAccess = context.factory.createElementAccessExpression(
            expression,
            context.factory.createNumericLiteral(index)
          );
          const decl = context.factory.createVariableDeclaration(
            element.name,
            undefined,
            undefined,
            arrayAccess
          );
          const stmt = context.factory.createVariableStatement(
            undefined,
            context.factory.createVariableDeclarationList([decl], flags)
          );
          declarations.push(stmt);
        }
      });
    }
  } else if (ts.isObjectBindingPattern(pattern)) {
    // Handle object destructuring
    if (ts.isObjectLiteralExpression(expression)) {
      pattern.elements.forEach((element) => {
        if (ts.isBindingElement(element) && ts.isIdentifier(element.name)) {
          const propName =
            element.propertyName?.getText() ?? element.name.getText();

          // Find matching property by name, not position
          let foundValue: ts.Expression | undefined;

          for (const prop of expression.properties) {
            if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
              const nameText = prop.name.text || (prop.name as any).escapedText;
              if (nameText === propName) {
                foundValue = prop.initializer;
                break;
              }
            } else if (
              ts.isShorthandPropertyAssignment(prop) &&
              ts.isIdentifier(prop.name)
            ) {
              const originalName = prop.name.text;
              if (originalName === propName) {
                // For shorthand properties, map to hygiene-renamed variable
                if (originalName) {
                  const hygieneRenamedName = `${originalName}$${macroId}`;
                  foundValue =
                    context.factory.createIdentifier(hygieneRenamedName);
                } else {
                  foundValue = prop.name; // Fallback
                }
                break;
              }
            }
          }

          if (foundValue) {
            const decl = context.factory.createVariableDeclaration(
              element.name,
              undefined,
              undefined,
              foundValue
            );
            const stmt = context.factory.createVariableStatement(
              undefined,
              context.factory.createVariableDeclarationList([decl], flags)
            );
            declarations.push(stmt);
          }
        }
      });
    }
  }

  return declarations;
}
