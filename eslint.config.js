// @ts-check
import astarEslint from '@ansearch/config/linters/eslint.config.js';
import tseslint from 'typescript-eslint';
export default tseslint.config(
  ...astarEslint,
  {
    ignores: ['.prettierrc*'],
    rules: {
      'no-console': 1, // temporary until there pino is installed
    },
  },
  {
    files: ['**/browser/**/*.ts'],
    rules: {
      'unicorn/no-array-for-each': 0, // this is built in puppeteer
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      'no-console': 0,
    },
  },
);
