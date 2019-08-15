const request = require('request')
const ora = require('ora')
const chalk = require('chalk')
const md = require('markdown-it')()
const rp = require('request-promise');


module.exports = (callback) => {
    const spinner = ora('fetching template list...')
    spinner.start()
    request({
        uri: 'https://api.github.com/repos/im/im-template/branches',
        timeout: 5000,
        headers: {
            'Cache-Control': 'no-cach',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'
        }
    }, (err, response, body) => {
        if (err) {
            spinner.fail(chalk.red('fetch template list unsuccessfully'))
        }
        if (response && response.statusCode === 200) {
            spinner.succeed(chalk.green('fetch template list successfully'))
            const branches = (JSON.parse(body) || []).filter(v => v.name !== 'master').map(v => v.name)
            getTemplateList(branches, callback)
        }
    })
}

function getTemplateList(branches, callback) {
    request({
        uri: `https://raw.githubusercontent.com/im/im-template/master/template-config.json`,
        timeout: 5000,
        headers: {
            'Cache-Control': 'no-cach',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'
        }
    }, (err, response, body) => {
        if (err) {
            spinner.fail(chalk.red('获取模板配置失败'))
        }
        if (response && response.statusCode === 200) {
            const telConfig = JSON.parse(body) || {}
            const templateList = []
            branches.forEach(branch => {
                templateList.push({
                    name: branch,
                    description: telConfig[branch] ? telConfig[branch].description : '',
                    url: `github:im/im-template#${branch}`
                })
                callback(templateList)
            })
        }
    })
}