const js = require("@eslint/js");

const nodeGlobals = {
  require: "readonly",
  module: "readonly",
  exports: "readonly",
  process: "readonly",
  __dirname: "readonly",
  __filename: "readonly",
  console: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly",
  setInterval: "readonly",
  clearInterval: "readonly",
  Buffer: "readonly",
  global: "readonly",
};

const jestGlobals = {
  describe: "readonly",
  it: "readonly",
  test: "readonly",
  expect: "readonly",
  beforeEach: "readonly",
  afterEach: "readonly",
  beforeAll: "readonly",
  afterAll: "readonly",
  jest: "readonly",
};

const commonRules = {
  "indent": ["error", 2],
  "quotes": ["error", "double"],
  "semi": ["error", "always"],
  "no-unused-vars": "warn",
  "no-console": "warn",
  "eqeqeq": ["error", "always"],
  "no-var": "error",
  "prefer-const": "error",
  "no-trailing-spaces": "error",
  "no-multiple-empty-lines": ["error", { "max": 1 }],
};

module.exports = [
  js.configs.recommended,
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: nodeGlobals,
    },
    rules: commonRules,
  },
  {
    files: ["tests/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: { ...nodeGlobals, ...jestGlobals },
    },
    rules: {
      ...commonRules,
      "no-console": "off",
    },
  },
];
