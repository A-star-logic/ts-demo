// @ts-check
import astarEslint from '@ansearch/config/linters/eslint.config.js';
import tseslint from 'typescript-eslint';
export default tseslint.config(
  ...astarEslint,
  {
    ignores: ['.prettierrc*'],
    rules: {
      'no-console': 0, // temporary until there pino is installed
      'no-undef': 0, // done with TS
    },
  },
  {
    files: ['**/browser/**/*.ts'],
    rules: {
      'unicorn/no-array-for-each': 0, // this is built in puppeteer
    },
  },
  {
    files: ['**/stores/**/*.ts'],
    rules: {
      'fp/no-this': 0, // This is mandatory with Pinia
    },
  },
  {
    files: ['**/app/src/server/**/*.ts'],
    rules: {
      'import-x/no-default-export': 0, // Default export is mandatory with h3
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      'no-console': 0,
    },
  },
);
