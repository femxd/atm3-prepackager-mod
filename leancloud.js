var thehttp = require('http')
var fs = require('fs')

var put = function(id, data) {
  var postData = JSON.stringify(data)
  // console.log(postData)

  var options = {
    hostname: 'feng.avosapps.com',
    port: 80,
    path: '/Atmmod/' + id,
    method: 'PUT',
    // headers: {
    //   'X-LC-Id': '9niyzjv2qwxx8b77e67bffy0h936f3hgc2gtnjdw44dh501w',
    //   'X-LC-Key': 'ff18me0vtyraa8yqtj08a3jmcdtdni655fvqys5sh755sz3z',
    //   'Content-Type': 'application/json',
    //   'Content-Length': postData.length
    // },
  }

  var req = thehttp.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode)
    // console.log('HEADERS: ' + JSON.stringify(res.headers))
    res.setEncoding('utf8')
    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk)
    })
    res.on('end', function() {
      // console.log('No more data in response.')
    })
  })

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message)
  })

  req.write(postData)
  req.end()
}

var get = function(cb) {
  // var postData = '{}'

  var options = {
    hostname: 'feng.avosapps.com',
    port: 80,
    path: '/Atmmod',
    method: 'GET',
    // headers: {
    //   'X-LC-Id': '9niyzjv2qwxx8b77e67bffy0h936f3hgc2gtnjdw44dh501w',
    //   'X-LC-Key': 'ff18me0vtyraa8yqtj08a3jmcdtdni655fvqys5sh755sz3z',
    //   'Content-Type': 'application/json',
    //   'Content-Length': postData.length,
    // },
  }

  var req = thehttp.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode)
    // console.log(res)
    // console.log('HEADERS: ' + JSON.stringify(res.headers))
    var result = []
    res.setEncoding('utf8')
    res.on('data', function (chunk) {
      // console.log('BODY: ' + chunk)
      result.push(chunk)

    })
    res.on('end', function() {
      // console.log('No more data in response.')
      cb(result.join(''))
    })
  })

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message)
  })

  // req.write(postData)
  req.end()
}

exports.get = get
exports.put = put

// post({
//  'html':'html',
//  'sub':'sub',
//  'mod':'mod'
// })
