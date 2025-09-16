/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config& import('prettier-plugin-tailwindcss').PluginOptions}
 */
export default {
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  printWidth: 120,
  tabWidth: 2,
  plugins: ['prettier-plugin-tailwindcss'],
};
