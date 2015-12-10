var lodash = require('./lodash.min.js')

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
        if ( lodash.includes(subMod[k], 'css-base') ) {
            lodash.pull(subMod[k], 'css-base')
            subMod[k].push('css-base')
        }

        if ( lodash.includes(subMod[k], 'css-reset') ) {
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

var ary2obj = function(a) {
  var result = {}
  lodash.each(a, function(v, k) {
    result[v.html] = {
        sub: v.sub,
        mod: v.mod,
    }
  })
  return result
}

var makeList = function() {
    // console.log(typeof dbhtml.value())
    leancloud.put(confHash.name, ary2obj(dbhtml.value()), function(data) {
        if (data === 'put get noproject') {
            return false
        }
        // console.log(list)
        _.write(confHash.dist,
            _.read( path.resolve(__dirname, 'list.html') )
                .split('__DATA__')
                .join(data)
        )

        process.exit()
    })
}


