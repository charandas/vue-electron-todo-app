const path = require('path');

function addPaths (dirs, dir) {
  return dirs.concat([
    `${dir}${path.sep}secret`,
    dir
  ]);
}

export default function addSecretPaths (dirs) {
  return dirs.reduce(addPaths, []);
}
