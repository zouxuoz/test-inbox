const fs = require('fs');
const path = require('path');

function resolvePath(relativePath) {
  return path.resolve(fs.realpathSync(process.cwd()), relativePath);
}

module.exports = {
  buildDir: resolvePath('lib'),
  jsPattern: resolvePath('src/**/*.js'),
  srcDir: resolvePath('src'),
};
