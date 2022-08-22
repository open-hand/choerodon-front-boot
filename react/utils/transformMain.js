function transformMain(main) {
  if (main) {
    return main.replace(/lib/, 'react');
  }
  return '';
}

module.exports = transformMain;
