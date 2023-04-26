module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
  },
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:import/recommended',
    'airbnb-base',
    'airbnb-typescript/base',
  ],
  rules: {
    strict: 'off',
    'lines-between-class-members': 'off',
    'comma-dangle': ['error', 'only-multiline'],
    'class-methods-use-this': 'off',
    'max-len': ['error', { code: 120 }],
    'arrow-body-style': 'off', // 箭头函数不强制以用块体（用花括号表示）
    'arrow-parens': [2, 'as-needed', { requireForBlockBody: true }],
    'no-restricted-syntax': 'off',
    'import/prefer-default-export': 'off',
    'import/order': 'off',
    'no-constructor-return': 'off',
    'consistent-return': 'off',
    'no-plusplus': 'off',
    'prefer-promise-reject-errors': 'off',
    'guard-for-in': 'off',
    'no-nested-ternary': 'warn',
    'no-bitwise': 'warn',
    'no-async-promise-executor': 'off',
    'prefer-destructuring': [
      'error',
      {
        object: true,
        array: false,
      },
    ],
    'no-underscore-dangle': 'off',
    'prefer-object-spread': 'off',
    'object-curly-newline': [
      'warn',
      {
        ObjectExpression: {
          consistent: true,
        },
        ObjectPattern: {
          consistent: true,
        },
        ImportDeclaration: {
          consistent: true,
        },
        ExportDeclaration: {
          consistent: true,
        },
      },
    ],
    'no-param-reassign': 'off', // 禁止对函数参数再赋值
    '@typescript-eslint/naming-convention': [
      'error',
      { selector: 'enum', format: ['UPPER_CASE'] },
      { selector: 'enumMember', format: ['UPPER_CASE'] },
    ],
    '@typescript-eslint/comma-dangle': ['error', 'only-multiline'],
    '@typescript-eslint/lines-between-class-members': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-throw-literal': 'off',
    'import/extensions': [
      'off',
      'always',
      {
        js: 'never',
        ts: 'never',
      },
    ],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
  },
  parserOptions: {
    project: './tsconfig.lint.json',
  },
};
