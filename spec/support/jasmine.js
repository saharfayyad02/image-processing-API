module.exports = {
  spec_dir: 'spec',
  spec_files: ['**/*[sS]pec.ts'], // look for .spec.ts files
  helpers: ['helpers/**/*.ts'],
  env: {
    stopSpecOnExpectationFailure: false,
    random: true,
    forbidDuplicateNames: true,
  },
};
