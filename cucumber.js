module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: ['features/support/world.ts', 'features/support/hooks.ts', 'features/step-definitions/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      '@cucumber/pretty-formatter',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json',
    ],
    formatOptions: { snippetInterface: 'async-await' },
    worldParameters: {},
    parallel: 1,
  },
};
