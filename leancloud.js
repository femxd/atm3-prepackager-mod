var thehttp = require('http')
var fs = require('fs')

var put = function(id, data, cb) {
  var sendData = JSON.stringify(data)

  var options = {
    // hostname: '127.0.0.1',
    // port: 3000,
    hostname: 'feng.avosapps.com',
    port: 80,
    path: '/Atmmod/' + id,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    }
  }

  var req = thehttp.request(options, function(res) {
    console.log('STATUS put: ' + res.statusCode)
    // console.log('HEADERS: ' + JSON.stringify(res.headers))
    res.setEncoding('utf8')
    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk)
    })
    res.on('end', function() {
      // console.log('No more data in response.')
      cb()
    })
  })

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message)
  })

  req.write(sendData)
  req.end()
}

var get = function(cb) {

  var options = {
    // hostname: '127.0.0.1',
    // port: 3000,
    hostname: 'feng.avosapps.com',
    port: 80,
    path: '/Atmmod',
    method: 'GET',
  }

  var req = thehttp.request(options, function(res) {
    console.log('STATUS get: ' + res.statusCode)
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

  req.end()
}

exports.get = get
exports.put = put
