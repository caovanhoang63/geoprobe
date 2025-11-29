function readPackage(pkg) {
  return pkg
}

module.exports = {
  hooks: {
    readPackage
  },
  allowBuild: {
    'better-sqlite3': true
  }
}
