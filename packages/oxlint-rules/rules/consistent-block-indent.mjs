/**
 * @param {string[]} lines
 * @param {number} lineNumber
 */
function getLineIndentFromLines(lines, lineNumber) {
  const line = lines[lineNumber - 1] ?? '';
  const match = /^[\t ]*/.exec(line);
  return match?.[0] ?? '';
}

/**
 * @param {import('eslint').SourceCode} sourceCode
 * @param {import('estree').Node} node
 * @param {Map<number, { type: 'program' } | { type: 'block', braceLine: number } | { type: 'case', caseLine: number }>} marks
 * @param {{ type: 'program' } | { type: 'block', braceLine: number } | { type: 'case', caseLine: number }} mark
 */
function markStatement(sourceCode, node, marks, mark) {
  const firstToken = sourceCode.getFirstToken(node);
  if (!firstToken) {
    return;
  }

  marks.set(firstToken.loc.start.line, mark);
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'layout',
    docs: {
      description:
        'Indent block bodies relative to `{`, plus trailing/blank whitespace cleanup.',
    },
    fixable: 'whitespace',
    messages: {
      badWhitespace: 'Fix indentation and messy whitespace.',
    },
    schema: [],
  },
  create(context) {
    const sourceCode = context.sourceCode;
    /** @type {Map<number, { type: 'program' } | { type: 'block', braceLine: number } | { type: 'case', caseLine: number }>} */
    const marks = new Map();

    function visitBlock(node) {
      const openBrace = sourceCode.getFirstToken(node);
      if (!openBrace || openBrace.value !== '{') {
        return;
      }

      const mark = {
        type: 'block',
        braceLine: openBrace.loc.start.line,
      };

      for (const statement of node.body) {
        markStatement(sourceCode, statement, marks, mark);
      }
    }

    return {
      Program(node) {
        const mark = { type: 'program' };
        for (const statement of node.body) {
          markStatement(sourceCode, statement, marks, mark);
        }
      },
      BlockStatement: visitBlock,
      StaticBlock: visitBlock,
      SwitchCase(node) {
        const caseToken = sourceCode.getFirstToken(node);
        if (!caseToken) {
          return;
        }

        const mark = {
          type: 'case',
          caseLine: caseToken.loc.start.line,
        };

        for (const statement of node.consequent) {
          if (statement.type === 'BlockStatement') {
            continue;
          }

          markStatement(sourceCode, statement, marks, mark);
        }
      },
      'Program:exit'(node) {
        const original = sourceCode.text;
        const hadFinalNewline = original.endsWith('\n');
        const lines = sourceCode.lines.slice();
        let changed = false;

        for (let index = 0; index < lines.length; index += 1) {
          let line = lines[index];
          const lineNumber = index + 1;
          const mark = marks.get(lineNumber);

          if (mark) {
            let expectedIndent = '';
            if (mark.type === 'block') {
              expectedIndent = `${getLineIndentFromLines(lines, mark.braceLine)}  `;
            } else if (mark.type === 'case') {
              expectedIndent = `${getLineIndentFromLines(lines, mark.caseLine)}  `;
            }

            const content = line.replace(/^[\t ]*/, '');
            const next = `${expectedIndent}${content}`;
            if (next !== line) {
              line = next;
              changed = true;
            }
          }

          const trimmed = line.replace(/[\t ]+$/, '');
          if (trimmed !== line) {
            line = trimmed;
            changed = true;
          }

          lines[index] = line;
        }

        let nextText = lines.join('\n');
        if (hadFinalNewline && !nextText.endsWith('\n')) {
          nextText += '\n';
        }

        const collapsed = nextText.replace(/\n{3,}/g, '\n\n');
        if (collapsed !== nextText) {
          nextText = collapsed;
          changed = true;
        }

        if (!changed || nextText === original) {
          return;
        }

        context.report({
          node,
          messageId: 'badWhitespace',
          fix(fixer) {
            return fixer.replaceTextRange([0, original.length], nextText);
          },
        });
      },
    };
  },
};
