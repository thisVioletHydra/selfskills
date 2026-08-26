import pluginPnpm from 'eslint-plugin-pnpm';
import * as jsoncParser from 'jsonc-eslint-parser';
import * as yamlParser from 'yaml-eslint-parser';

/**
 * Workspace / catalog lint. Oxlint stays for JS/TS apps.
 * No json-enforce-catalog until we introduce catalogs.
 */
export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**'],
  },
  {
    name: 'pnpm/package.json',
    files: ['package.json', '**/package.json'],
    languageOptions: {
      parser: jsoncParser,
    },
    plugins: {
      pnpm: pluginPnpm,
    },
    rules: {
      'pnpm/json-prefer-workspace-settings': 'error',
      'pnpm/json-valid-catalog': 'error',
    },
  },
  {
    name: 'pnpm/pnpm-workspace-yaml',
    files: ['pnpm-workspace.yaml'],
    languageOptions: {
      parser: yamlParser,
    },
    plugins: {
      pnpm: pluginPnpm,
    },
    rules: {
      'pnpm/yaml-valid-packages': 'error',
      'pnpm/yaml-no-duplicate-catalog-item': 'error',
      'pnpm/yaml-no-unused-catalog-item': 'error',
      'pnpm/yaml-enforce-settings': [
        'error',
        {
          settings: {
            shellEmulator: true,
            trustPolicy: 'no-downgrade',
          },
        },
      ],
    },
  },
];
