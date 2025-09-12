export default {
  spec_dir: 'spec', // or 'tests' if your tests are there
  spec_files: ['**/*[sS]pec.{ts,js,mjs}'],
  helpers: ['helpers/**/*.{ts,js,mjs}'],
  env: {
    stopSpecOnExpectationFailure: false,
    random: true,
    forbidDuplicateNames: true,
  },
};
