// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier');

module.exports = defineConfig([
  expoConfig,
  prettier,
  {
    ignores: ['dist/*', 'coverage/*', '.expo/*'],
  },
  {
    // Server code must never be imported from client code.
    files: ['src/app/**/*.tsx', 'src/features/**', 'src/ui/**', 'src/theme/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['@/server/*'], message: 'Server modules are API-route only.' }] },
      ],
    },
  },
]);
