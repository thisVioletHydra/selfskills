import consistentBlockIndent from './rules/consistent-block-indent.mjs';
import consistentChainLayout from './rules/consistent-chain-layout.mjs';
import consistentParameterLayout from './rules/consistent-parameter-layout.mjs';
import consistentPropertyIndent from './rules/consistent-property-indent.mjs';
import consistentTernaryLayout from './rules/consistent-ternary-layout.mjs';
import noBlankLinesInArrowExpression from './rules/no-blank-lines-in-arrow-expression.mjs';
import noBlankLinesInChain from './rules/no-blank-lines-in-chain.mjs';
import paddingLineBeforeDecorator from './rules/padding-line-before-decorator.mjs';
import preferProcessImport from './rules/prefer-process-import.mjs';

export default {
  meta: {
    name: 'selfskills',
  },
  rules: {
    'consistent-block-indent': consistentBlockIndent,
    'consistent-chain-layout': consistentChainLayout,
    'consistent-parameter-layout': consistentParameterLayout,
    'consistent-property-indent': consistentPropertyIndent,
    'consistent-ternary-layout': consistentTernaryLayout,
    'no-blank-lines-in-arrow-expression': noBlankLinesInArrowExpression,
    'no-blank-lines-in-chain': noBlankLinesInChain,
    'padding-line-before-decorator': paddingLineBeforeDecorator,
    'prefer-process-import': preferProcessImport,
  },
};
