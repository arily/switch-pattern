module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: ['standard-with-typescript'],
  parserOptions: {
    project: './tsconfig.json'
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    'operator-linebreak': ['error', 'before']
  }
}
