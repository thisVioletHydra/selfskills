import consistentParameterLayout from './rules/consistent-parameter-layout.mjs';
import paddingLineBeforeDecorator from './rules/padding-line-before-decorator.mjs';
import preferProcessImport from './rules/prefer-process-import.mjs';

export default {
  meta: {
    name: 'selfskills',
  },
  rules: {
    'consistent-parameter-layout': consistentParameterLayout,
    'padding-line-before-decorator': paddingLineBeforeDecorator,
    'prefer-process-import': preferProcessImport,
  },
};
