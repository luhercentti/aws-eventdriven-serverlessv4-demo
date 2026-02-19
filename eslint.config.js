const eslint = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
const prettier = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');
const globals = require('globals');

module.exports = [
  {
    ignores: ['dist/**', 'cdk.out/**', 'node_modules/**', '**/*.js', '.serverless/**']
  },
  eslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json'
      },
      globals: {
        ...globals.node,
        ...globals.jest
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'prettier': prettierPlugin
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs['recommended-requiring-type-checking'].rules,
      ...prettier.rules,
      'prettier/prettier': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'warn',
      '@typescript-eslint/prefer-promise-reject-errors': 'off'
    }
  }
];
