const inquirer = require('inquirer')
const chalk = require('chalk')
const path = require('path')
const ora = require('ora')
const fs = require('fs')
const os = require('os')
const getGitUser = require('./getGitUser')
const packageConfig = require('../package.json')
const moment = require('moment');

module.exports = (tmpPath, tmpName) => {
    inquirer.prompt([{
        type: 'input',
        name: 'name',
        message: '需要创建的模板名称',
        default: `${tmpName}`
    }]).then().then(answer => {
        tmpName = answer.name
        inquirer.prompt([{
            type: 'input',
            name: 'destination',
            message: '生成路径',
            default: `${process.cwd()}`
        }
        ]).then(answer => {
            let destination = answer.destination
            if (destination != process.cwd()) {
                destination = path.join(process.cwd(), destination)
            }
            const distPath = path.join(destination, tmpName)
            if (fs.existsSync(distPath)) {
                inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'override',
                        message: chalk.red(`当前目录(${tmpName})已存在是否替换?`)
                    }
                ]).then(answer => {
                    if (answer.override) {
                        writeFiles(tmpPath, distPath, tmpName)
                    }
                });
            } else {
                mkdirsSync(distPath)
                writeFiles(tmpPath, distPath, tmpName)
            }
        });
    })
}

// 写入文件
function writeFiles(tmpPath, distPath, tmpName) {
    const spinner = ora('开始创建模板...').start()
    const userData = getUserData(tmpName)
    fs.readdir(tmpPath, 'utf-8', (err, files) => {
        if (err) {
            console.log(chalk.red(`创建模板失败`))
            return false
        }
        console.log()
        console.log('模板创建成功')
        files.forEach(filename => {
            const content = compile(path.join(tmpPath, filename), userData)
            const distFileName = tmpName + '.' + filename.split('.')[1]
            const filePath = path.join(distPath, distFileName)
            fs.writeFileSync(filePath, content, 'utf-8')
            console.log(chalk.green.underline(filePath))
        })
        console.log()
    })
    spinner.stop()
}

// 替换文件
function compile(tmpFile, data) {
    let content = fs.readFileSync(tmpFile, 'utf-8')
    return content.replace(/\${(\w+)}/gi, function (match, name) {
        return data[name] ? data[name] : ''
    })
}

// 获取用户信息
function getUserData(tmpName) {
    const name = tmpName;
    const username = getGitUser() || os.userInfo({ encoding: 'utf8' }).username
    const createDate = moment().format('YYYY-MM-DD hh:mm:ss')
    const version = packageConfig.version
    return {
        name,
        username,
        createDate,
        version
    }
}

// 同步递归创建文件夹
function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}

