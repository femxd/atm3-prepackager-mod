var lodash = require('lodash')

var path = require('./path.js')
// var db = require('./low.js')()
var leancloud = require('./leancloud.js')
var dbhtml = lodash([])
var _ = fis.util

var confHash = {}

module.exports = function(ret, conf, settings, opt) {

    confHash.name = settings.name
    confHash.dist = settings.dist

    confHash.html = settings.html
    confHash.mod = settings.mod
    confHash.sub = settings.sub

    confHash.project = path.resolve(fis.project.getProjectPath())

    // 复制图片 包括子目录 sub-xxx/img/**
    // lodash.each(
    //     _.find(
    //         confHash.mod, // base
    //         'img/**', // include
    //         'publish/**' // exclude
    //     ),
    //     function(imgpath) {
    //         _.copy(imgpath, path.resolve(confHash.project, 'img', imgpath.split('/img/')[1]), '', '*.psd', true, false)
    //     }
    // )

    // 遍历 html
    // lodash(ret.src)
    lodash(_.find(
        confHash.project, // base
        confHash.html, // include
        'publish/**' // exclude
    ))
        .chain()
        // .keys()
        // .filter(function(v, k) {
        //     return _.glob('/' + confHash.html, v)
        // })
        .each(function(v, k) {
            // fis.log.info("file: ", v)
            var htmlcontent = _.read(v)
            // var htmlcontent = _.read(confHash.project + v)
            var modArray = []
            parseMod(modArray, htmlcontent)

            dbhtml = dbhtml.push({
                // html: v,
                html: v.split(confHash.project)[1],
                sub: parseProject(htmlcontent),
                mod: modArray,
            })
        })
        .run()

    // 生成数据
    var submod = makeSubMod()
    makeSCSS(submod)
    makeList()
    getDist()
}


var parseProject = function(modSource) {
    var result = []
    // console.log(modSource, 123)
    var modRe = /<!--[\S\s]*?-->|<meta\s+name\s*=\s*(["'])sub\1\s+content\s*=\s*(["'])(.+?)\2\s*\/*>/g
    modSource.replace(modRe, function(m0, m1, m2, m3, m4, m5, m6) {
        // console.log(m3)
        // console.log(m3.split(/[,\s\xA0]+/g))
        if (m3) {
            // console.log(m3)
            result = lodash.uniq(m3.split(/[,\s\xA0]+/g))
        }

    })
    return result
}

var parseMod = function(modArray, modSource) {
    var modRe = /<!--[\S\s]*?-->|<component\s+is\s*=\s*(["'])(.+?)\1(\s*load\s*=\s*(["'])(.+?)\4)*/g
    modSource.replace(modRe, function(m0, m1, m2, m3, m4, m5, m6) {
        var modName = lodash.trim(m2 || '')
        if (modName === '') return false
        modArray.push(modName)

        var deppath = path.resolve(confHash.mod, modName, 'index.html')

        if (_.exists(deppath)) {
            parseMod(modArray, _.read(deppath))
        } else {
            fis.log.info('mod not found', deppath)
        }
    })

}

var makeSubMod = function() {

    var subMod = {}

    dbhtml
        .chain()
        .each(function(v,k) {
            // fis.log.info(v)
            lodash.each(v.sub, function(vv, kk) {
                subMod[vv] = subMod[vv] || []
                subMod[vv] = subMod[vv].concat(v.mod)
            })
        })
        .run();

    lodash.each(subMod, function(v, k) {

        if ( lodash.contains(subMod[k], 'css-base') ) {
            lodash.pull(subMod[k], 'css-base')
            subMod[k].push('css-base')
        }
        if ( lodash.contains(subMod[k], 'css-reset') ) {
            lodash.pull(subMod[k], 'css-reset')
            subMod[k].push('css-reset')
        }

        subMod[k].reverse()
        subMod[k] = lodash.uniq(subMod[k])
    })
    // fis.log.info(subMod)
    return subMod
}

var makeSCSS = function(submod) {
    // fis.log.info(submod)
    lodash.each(submod, function(v, k) {
        var result = []

        lodash.each(v, function(v, k) {
            // console.log(v, k)
            var deppath = path.resolve(
                confHash.mod,
                v,
                'index.scss'
            )

            if (_.exists(deppath)) {
                result.push(
                    '@import "'+ deppath +'";'
                )
            } else {
                fis.log.info('mod not found', deppath)
            }
        })

        if (confHash.sub[k]) {
            _.write(
                path.resolve(
                    confHash.project,
                    confHash.sub[k]
                ),
                result.join('\n')
            )
        }
    })
}

var makeList = function() {
    leancloud.put(confHash.name, {
        data: JSON.stringify( dbhtml.value() ),
        count: {
            "__op":"Increment",
            "amount":1
        },
    })
}

var getDist = function() {

    leancloud.get(function(data) {

        var list = []
        var hash = {}

        lodash(JSON.parse(data))
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
        _.write(confHash.dist,
            _.read('./list.html' )
                .split('__DATA__')
                .join(JSON.stringify( list ))
        )

        process.exit()
    })

}

// var confHash = {
//     subData: {},
//     htmlData: {},
// }

// var trimstr = function(thestr) {
//     return thestr.replace(/^[\s\uFEFF\xa0\u3000]+|[\uFEFF\xa0\u3000\s]+$/g, "")
// }

// var multistr = function(thestr, thetime) {
//     thetime = (thetime >> 0)
//     var t = (thetime > 1 ? multistr(thestr, thetime / 2) : '')
//     return t + (thetime % 2? t + thestr: t)
// }

        // if ()

        // console.log(htmlPath, htmlHash.modDep)

        // console.log(htmlPath, htmlHash.modList.join('\n'))


        // if (htmlHash.modHash[modName] === true) return false

        // htmlHash.modHash[modName] = true


            // htmlHash.modDep = m3.split(/[,\s\xA0]+/g)


            // parseProject(confHash.htmlData[htmlpath], htmlcontent)

            // parseMod(confHash.htmlData[htmlpath], htmlcontent)


// var parseHtml = function(htmlPath, htmlcontent) {

//     confHash.htmlData[htmlPath].modHash = null
//     console.log(confHash.htmlData[htmlPath])
// }

// var parseDir = function() {
//     console.log(confHash.project, confHash.html)



//     _.map(ret.src, function(subpath, file){
//         if (_.glob(confHash.html, subpath)) {
//             // fis.log.info("file: ", subpath)
//             parseHtml(subpath, ret.src[subpath]._content)
//         }
//     })

// }

        // m3.replace(/[^,\s\xA0]+/g, function(v) {
        //     // console.log(v)
        //     htmlHash.project = v
        // })

        // fis.log.info(result.join('\n'))


    // console.log(confHash)
    // console.log(_)
    // 复制图片
    // _.copy(path.resolve(confHash.mod, 'img'), 'e:/testtc/img', '*.png', 'publish/**', true, false)
    // _.copy(path.resolve(confHash.mod, 'sub-*/img'), 'e:/testtc/img', '*.png', 'publish/**', true, false)

// _.glob(path.resolve(confHash.project, confHash.html), {
//     nodir: true,
//     ignore: path.resolve(confHash.project, confHash.modignore),
// }, function(err, list) {
//     console.log(list)
//     lodash.each(list, function(v, k) {
//         // console.log(v, k)
//         // console.log(fs.read(v), k)
//         parseHtml(v, _.read(v))
//     })


// })

// var htmls = []

// _.map(ret.src, function(subpath, file){
//     fis.log.info("file: ", subpath, file)
// })
// fis.log.info("file: ", ret.src['/html/video/detail-content.html'])
// fis.log.info('confHash', confHash)
// fis.log.info('settings', settings)
// fis.log.info('opt', opt)

// lodash.each(confHash.subData, function(v, k) {
//     confHash.subData[k] = _.union.apply(null, v)
// })

// var db = (new require('lowdb'))()

// db('mod').pu
// sh({
//     a: 'a',
// })
// db('mod').push({
//     b: 'b',
// })

// console.log(db.object)
// console.log(path.resolve(confHash.project, confHash.html))
