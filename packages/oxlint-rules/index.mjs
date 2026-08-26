import preferProcessImport from './rules/prefer-process-import.mjs';

export default {
  meta: {
    name: 'selfskills',
  },
  rules: {
    'prefer-process-import': preferProcessImport,
  },
};
