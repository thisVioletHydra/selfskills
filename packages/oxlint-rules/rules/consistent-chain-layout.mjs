import {
  collectChainExpressions,
  getChainLinkRange,
  walkMemberChain,
} from '../utils/chain.mjs';
import { getLineIndent, isTokenOnSameLine } from '../utils/function-params.mjs';

/** @param {import('estree').Node} node */
function visitChainNodes(node, checkChain) {
  for (const expression of collectChainExpressions(node)) {
    checkChain(expression);
  }
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'layout',
    docs: {
      description:
        'Keep call chains inline, or multiline when the first link starts on its own line.',
    },
    fixable: 'whitespace',
    messages: {
      collapseChain: 'Call chain should stay on one line.',
      expandChain: 'Multiline call chain must place each link on its own line.',
      normalizeChainSpacing: 'Normalize spacing inside this call chain.',
    },
    schema: [],
  },
  create(context) {
    const sourceCode = context.sourceCode;

    function normalizeGap(node, rangeStart, rangeEnd, expectedText, messageId) {
      const actualText = sourceCode.text.slice(rangeStart, rangeEnd);
      if (actualText === expectedText) {
        return;
      }

      context.report({
        node,
        messageId,
        fix(fixer) {
          return fixer.replaceTextRange([rangeStart, rangeEnd], expectedText);
        },
      });
    }

    function checkChain(expression) {
      const links = [];
      walkMemberChain(expression, (objectNode, memberNode) => {
        links.push({ objectNode, memberNode });
      });

      if (links.length === 0) {
        return;
      }

      const firstLink = links[0];
      const firstRange = getChainLinkRange(
        sourceCode,
        firstLink.objectNode,
        firstLink.memberNode,
      );
      if (!firstRange) {
        return;
      }

      const baseIndent = getLineIndent(
        sourceCode,
        firstLink.objectNode.loc.start.line,
      );
      const chainIndent = `${baseIndent}  `;
      const multilineIntent = !isTokenOnSameLine(
        sourceCode,
        firstRange.linkStart,
        firstRange.linkEnd,
      );

      if (!multilineIntent) {
        for (const link of links) {
          const range = getChainLinkRange(
            sourceCode,
            link.objectNode,
            link.memberNode,
          );
          if (!range) {
            continue;
          }

          const gapText = sourceCode.text.slice(
            range.linkStart.range[1],
            range.linkEnd.range[0],
          );
          if (/\n/.test(gapText)) {
            context.report({
              node: link.memberNode,
              messageId: 'collapseChain',
              fix(fixer) {
                return fixer.replaceTextRange(
                  [range.linkStart.range[1], range.linkEnd.range[0]],
                  '',
                );
              },
            });
          }
        }

        return;
      }

      for (const link of links) {
        const range = getChainLinkRange(
          sourceCode,
          link.objectNode,
          link.memberNode,
        );
        if (!range) {
          continue;
        }

        if (isTokenOnSameLine(sourceCode, range.linkStart, range.linkEnd)) {
          context.report({
            node: link.memberNode,
            messageId: 'expandChain',
            fix(fixer) {
              return fixer.insertTextBefore(
                range.linkEnd,
                `\n${chainIndent}`,
              );
            },
          });
          continue;
        }

        normalizeGap(
          link.memberNode,
          range.linkStart.range[1],
          range.linkEnd.range[0],
          `\n${chainIndent}`,
          'normalizeChainSpacing',
        );
      }
    }

    return {
      ExpressionStatement(node) {
        visitChainNodes(node, checkChain);
      },
      VariableDeclarator(node) {
        visitChainNodes(node, checkChain);
      },
      ReturnStatement(node) {
        visitChainNodes(node, checkChain);
      },
      ArrowFunctionExpression(node) {
        visitChainNodes(node, checkChain);
      },
    };
  },
};
