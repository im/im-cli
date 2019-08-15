const Metalsmith = require('metalsmith')
const inquirer = require('inquirer')
const chalk = require('chalk')
const path = require('path')
const ora = require('ora')
const transformIntoAbsolutePath = require('./local-path').transformIntoAbsolutePath

module.exports = (tmpPath, tmpName) => {
    const metalsmith = Metalsmith(tmpPath)
    inquirer.prompt([{
        type: 'input',
        name: 'name',
        message: '项目名称',
        default: `${tmpName}-project`
    }, {
        type: 'input',
        name: 'destination',
        message: '项目路径',
        default: process.cwd()
    }]).then(answer => {
        //项目生成路径
        const destination = path.join(transformIntoAbsolutePath(answer.destination), answer.name)
        console.log('当前项目路径: ', answer.destination);
        const spinner = ora('开始创建项目...').start()
        //加入新的全局变量
        Object.assign(metalsmith.metadata(), answer)

        spinner.start()

        metalsmith
            .source('.')
            .destination(destination)
            .clean(false)
            .build(function (err) {
                spinner.stop()
                if (err) throw err
                console.log()
                console.log(chalk.green('项目创建完成 ...'))
                console.log()
                console.log((`${chalk.green('请前往')} ${destination} ${chalk.green('开始代码编写')}`))
                console.log()
            })
    })
}

