module.exports = {
    env: {
      es6: true,
      node: true,
    },
    parserOptions: {
      ecmaVersion: 2018,
    },
    extends: [
      "eslint:recommended",
      "google",
    ],
    rules: {
      "object-curly-spacing": ["error", "never"], // No spaces inside curly braces
      "max-len": ["error", {code: 80}], // Max line length of 80 characters
      "comma-dangle": ["error", "always-multiline"], // Trailing comma in multiline
      "quotes": ["error", "double", {allowTemplateLiterals: true}], // Use double quotes
      "no-trailing-spaces": "error", // No trailing spaces
      "arrow-parens": ["error", "always"], // Parentheses around arrow function arguments
      "require-jsdoc": "off", // Disable JSDoc requirement if not needed
      "indent": ["error", 2], // Ensure consistent 2-space indentation
    },
    overrides: [
      {
        files: ["**/*.spec.*"],
        env: {
          mocha: true,
        },
        rules: {},
      },
    ],
  };
  