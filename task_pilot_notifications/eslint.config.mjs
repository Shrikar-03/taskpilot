import globals from 'globals';
import { ESLint } from 'eslint';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const angularEslintPlugin = require('@angular-eslint/eslint-plugin');

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: globals.browser,
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      '@angular-eslint': angularEslintPlugin,
    },
    rules: {
      'quotes': ['error', 'double'],
      'object-curly-spacing': ['error', 'always'],
      'max-len': ['error', { code: 80 }],
      'no-trailing-spaces': 'error',
      'comma-dangle': ['error', 'always-multiline'],
      // Add other rules based on your preference
    },
  },
  // Integrate recommended configs directly
  {
    plugins: {
      '@eslint/js': require('@eslint/js'),
      '@typescript-eslint': tseslint,
      '@angular-eslint': angularEslintPlugin,
    },
    extends: [
      '@eslint/js/recommended',
      '@typescript-eslint/recommended',
      '@angular-eslint/recommended',
    ],
  }
];
