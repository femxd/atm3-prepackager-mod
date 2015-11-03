var path = require('./path.js')
var _ = fis.util



module.exports = function(ret, conf, settings, opt) {

    confHash.modhtml = settings.modhtml
    confHash.modpath = settings.modpath
    confHash.modignore = settings.ignore || ''
    confHash.modProject = path.resolve(fis.project.getProjectPath())
    confHash.modsub = settings.modsub


    _.each(_.find(confHash.modpath, 'img/**', 'publish/**'), function(imgpath) {
        // console.log(imgpath, 'e:/testtc/img/' + imgpath.split('/img/')[1])
        _.copy(imgpath, confHash.modProject + imgpath.split('/img/')[1], '', '*.psd', true, false)
    })
    parseDir(ret)

}
var confHash = {
    subData: {},
    htmlData: {},
}


var parseDir = function(ret) {
    console.log(confHash.modProject, confHash.modhtml)

    fis.util.map(ret.src, function(subpath, file){
        if (_.glob(confHash.modhtml, subpath)) {
            // fis.log.info("file: ", subpath)
            parseHtml(subpath, ret.src[subpath]._content)
        }
    })
    makeData()
    makeProject()

}


var parseHtml = function(htmlPath, htmlconent) {
    confHash.htmlData[htmlPath] = {
        modDep: [],
        modHash: {},
        modList: [],
    }
    parseProject(confHash.htmlData[htmlPath], htmlconent)
    parseMod(confHash.htmlData[htmlPath], htmlconent)
    confHash.htmlData[htmlPath].modHash = null
    // console.log(confHash.htmlData[htmlPath])
}

var parseProject = function(htmlHash, modSource) {
    // console.log(modSource, 123)
    var modRe = /<!--[\S\s]*?-->|<meta\s+name\s*=\s*(["'])sub\1\s+content\s*=\s*(["'])(.+?)\2>/g
    modSource.replace(modRe, function(m0, m1, m2, m3, m4, m5, m6) {
        // console.log(m3)
        // console.log(m3.split(/[,\s\xA0]+/g))
        if (m3) {
            // console.log(m3)
            htmlHash.modDep = m3.split(/[,\s\xA0]+/g)
        }

    })
}


var parseMod = function(htmlHash, modSource) {
    var modRe = /<!--[\S\s]*?-->|<component\s+is\s*=\s*(["'])(.+?)\1(\s*load\s*=\s*(["'])(.+?)\4)*/g
    modSource.replace(modRe, function(m0, m1, m2, m3, m4, m5, m6) {
        var modName = trimstr(m2 || '')
        if (modName === '') return false
        if (htmlHash.modHash[modName] === true) return false
        htmlHash.modHash[modName] = true
        htmlHash.modList.push(modName)

        var deppath = path.resolve(confHash.modpath, modName, 'index.html')

        if (_.exists(deppath)) {
            parseMod(htmlHash, _.read(deppath))
        } else {
            fis.log.info('mod not found', deppath)
        }
    })

}

var makeData = function() {
    // console.log(confHash.htmlData)
    _.each(confHash.htmlData, function(htmlHash, htmlPath) {
        // console.log(htmlHash, htmlPath)
        _.each(htmlHash.modDep, function(v, k) {
            confHash.subData[v] = confHash.subData[v] || []
            confHash.subData[v] = _.union(confHash.subData[v], htmlHash.modList)
        })
    })

    // fis.log.info(confHash.subData)
}

var makeProject = function() {
    _.each(confHash.subData, function(modAry, modName) {
        if ( _.contains(confHash.subData[modName], 'css-base') ) {
            confHash.subData[modName].push('css-base')
        }
        if ( _.contains(confHash.subData[modName], 'css-reset') ) {
            confHash.subData[modName].push('css-reset')
        }
        confHash.subData[modName].reverse()
    })

    fis.log.info(confHash.subData)

    _.each(confHash.subData, function(modAry, modName) {
        var result = []
        _.each(modAry, function(v, k) {
            var deppath = path.resolve(confHash.modpath, v, 'index.css')

            if (_.exists(deppath)) {
                result.push(_.read(deppath))
            } else {
                fis.log.info('mod not found', deppath)
            }
        })
        // fis.log.info(path.resolve(confHash.modProject, confHash.modsub[modName]))
        _.write(path.resolve(confHash.modProject, confHash.modsub[modName]), result.join('\n'))
    })
}

var trimstr = function(thestr) {
    return thestr.replace(/^[\s\uFEFF\xa0\u3000]+|[\uFEFF\xa0\u3000\s]+$/g, "")
}

var multistr = function(thestr, thetime) {
    thetime = (thetime >> 0)
    var t = (thetime > 1 ? multistr(thestr, thetime / 2) : '')
    return t + (thetime % 2? t + thestr: t)
}


        // m3.replace(/[^,\s\xA0]+/g, function(v) {
        //     // console.log(v)
        //     htmlHash.project = v
        // })

        // fis.log.info(result.join('\n'))


    // console.log(confHash)
    // console.log(_)
    // 复制图片
    // _.copy(path.resolve(confHash.modpath, 'img'), 'e:/testtc/img', '*.png', 'publish/**', true, false)
    // _.copy(path.resolve(confHash.modpath, 'sub-*/img'), 'e:/testtc/img', '*.png', 'publish/**', true, false)

// _.glob(path.resolve(confHash.modProject, confHash.modhtml), {
//     nodir: true,
//     ignore: path.resolve(confHash.modProject, confHash.modignore),
// }, function(err, list) {
//     console.log(list)
//     lodash.each(list, function(v, k) {
//         // console.log(v, k)
//         // console.log(fs.read(v), k)
//         parseHtml(v, _.read(v))
//     })


// })

// var htmls = []

// fis.util.map(ret.src, function(subpath, file){
//     fis.log.info("file: ", subpath, file)
// })
// fis.log.info("file: ", ret.src['/html/video/detail-content.html'])
// fis.log.info('confHash', confHash)
// fis.log.info('settings', settings)
// fis.log.info('opt', opt)

// _.each(confHash.subData, function(v, k) {
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
// console.log(path.resolve(confHash.modProject, confHash.html))
