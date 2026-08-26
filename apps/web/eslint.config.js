import * as parserPlain from 'eslint-parser-plain';
import prettier from 'eslint-plugin-prettier';

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    files: ['**/*.{svg,xml}'],
    languageOptions: {
      parser: parserPlain,
    },
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          parser: 'xml',
          plugins: ['@prettier/plugin-xml'],
          xmlWhitespaceSensitivity: 'ignore',
          printWidth: 100,
          semi: false,
        },
      ],
    },
  },
];
