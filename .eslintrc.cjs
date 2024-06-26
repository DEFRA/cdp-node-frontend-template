module.exports = {
  ignorePatterns: ['.server', '.public', 'src/__fixtures__', 'coverage'],
  overrides: [
    {
      extends: [
        'standard',
        'plugin:import/recommended',
        'plugin:n/recommended',
        'plugin:promise/recommended',
        'prettier'
      ],
      env: {
        browser: false
      },
      files: ['**/*.{cjs,js}'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest'
      },
      plugins: ['import', 'n', 'promise', 'prettier'],
      rules: {
        'prettier/prettier': [
          'error',
          {
            endOfLine: 'auto'
          }
        ],
        'no-console': 'error',

        // Check for mandatory file extensions
        // https://nodejs.org/api/esm.html#mandatory-file-extensions
        'import/extensions': ['error', 'always', { ignorePackages: true }],

        // Skip rules handled by TypeScript compiler
        'import/default': 'off',
        'import/namespace': 'off',
        'n/no-extraneous-require': 'off',
        'n/no-extraneous-import': 'off',
        'n/no-missing-require': 'off',
        'n/no-missing-import': 'off'
      },
      settings: {
        'import/resolver': {
          node: true,
          typescript: true
        }
      }
    },
    {
      files: ['**/*.js'],
      parserOptions: {
        sourceType: 'module'
      }
    },
    {
      env: {
        commonjs: true
      },
      files: ['**/*.cjs'],
      parserOptions: {
        sourceType: 'commonjs'
      }
    },
    {
      env: {
        browser: true,
        node: false
      },
      files: ['src/client/**/*.js']
    },
    {
      env: {
        'jest/globals': true
      },
      extends: [
        'plugin:jest/recommended',
        'plugin:jest-formatting/recommended'
      ],
      files: ['**/*.test.{cjs,js}'],
      plugins: ['jest']
    }
  ],
  root: true
}
