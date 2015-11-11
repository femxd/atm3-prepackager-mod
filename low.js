var lodash = require('lodash')

// Returns a lodash chain that calls .value() and cb()
// automatically after the first .method()
//
// For example:
// lodashChain(array, cb).method()
//
// is the same as:
// _.chain(array).method().value(); cb()
function lowChain (_, array, cb) {
  var chain = _.chain(array)

  _.functions(chain)
    .forEach(function (method) {
      chain[method] = _.flow(chain[method], function (arg) {
        var res = arg.value ? arg.value() : arg
        cb()
        return res
      })
    })

  return chain
}

function low () {
  // Create a fresh copy of lodash
  var _ = lodash.runInContext()

  // Modify value function to call save before returning result
  var value = _.prototype.value
  _.prototype.value = function () {
    var res = value.apply(this, arguments)
    save()
    return res
  }

  // db.object checksum
  // var checksum

  function save () {}

  function db (key) {
    var array
    if (db.object[key]) {
      array = db.object[key]
    } else {
      array = db.object[key] = []
      save()
    }

    var short = lowChain(_, array, save)
    short.chain = function () {
      return _.chain(array)
    }
    return short
  }

  // Expose lodash instance
  db._ = _

  // Expose database object
  db.object = {}

  return db
}

module.exports = low
