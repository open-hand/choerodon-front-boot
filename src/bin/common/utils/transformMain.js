function transformMain(main) {
  return main.replace(/lib/, 'react');
}

module.exports = transformMain;
