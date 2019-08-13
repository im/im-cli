const request = require('request')
const semver = require('semver') // 语义化版本  https://semver.org/lang/zh-CN/
const chalk = require('chalk') // 用于高亮终端打印出来的信息
const packageConfig = require('../package.json')


/* 
1. 校验当前node版本是否达到 package 要求的版本
2. 校验当前项目是否是最新的版本， 如果不是最新的提醒更新
*/

module.exports = done => {
    // 判断当前的 node 版本是否满足项目要求
    if (packageConfig.engines && !semver.satisfies(process.version, packageConfig.engines.node)) {
        return console.log(chalk.red(
            ' You must upgrade node to >=' + packageConfig.engines.node + '.x to use vue-cli im-cli'
        ))
    }

    request({
        url: 'https://registry.npmjs.org/im-cli',
        timeout: 1000
    }, (err, res, body) => {
        if (!err && res.statusCode === 200) {
            const latestVersion = JSON.parse(body)['dist-tags'].latest
            console.log('latestVersion: ', latestVersion);
            const localVersion = packageConfig.version
            console.log('localVersion: ', localVersion);
            if (semver.lt(localVersion, latestVersion)) {
                console.log(chalk.yellow('  A newer version of im-cli is available.'))
                console.log()
                console.log('  latest:    ' + chalk.green(latestVersion))
                console.log('  installed: ' + chalk.red(localVersion))
                console.log()
            }
        }
        done()
    })
}