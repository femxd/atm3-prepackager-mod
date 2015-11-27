var leancloud = require('./leancloud.js')
var lodash = require('lodash')
var fs = require('fs')

leancloud.post(function(data) {

    // fs.writeFileSync('./data.json', data, {
    //     encoding: 'utf8'
    // })
    // eval('var a = data')
    // var result = JSON.parse(data)
    // console.log(result.result[0])
    // console.log(JSON.parse(result))
    // console.log(data[1])
    // console.log(data[2])
    // console.log(data[3])
    // console.log(JSON.parse(eval(data).result))
    // var a = eval(data)

    var list = []
    var hash = {}

    lodash(JSON.parse(data).result)
        .chain()
        .each(function (v, k) {
            // console.log(v, k)
            lodash(v)
                .chain()
                .each(function(vv, kk) {
                    // console.log(vv)
                    if (hash[vv.html]) {
                        list[hash[vv.html]] = vv
                    }
                    else {
                        list.push(vv)
                        hash[vv.html] = kk
                    }
                })
                .run()
        })
        .run()

    // console.log(list)
    fs.writeFileSync(
        './list.result.html',
        fs.readFileSync(
            './list.html',
            {
                encoding: 'utf8'
            }
        )
            .split('__DATA__')
            .join(
                JSON.stringify( list )
            ),
        {
            encoding: 'utf8'
        }
    )
})


