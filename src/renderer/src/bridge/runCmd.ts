export const exec = require('child_process').exec
// 本地需要启动的后台服务名称
let workerProcess
// 执行命令行，如果命令不需要路径，或就是项目根目录，则不需要cwd参数：
// workerProcess = exec(cmdStr, {cwd: cmdPath})

export const runExec = (cmdStr: string, isScrcpyCommand: boolean) => new Promise((resolve) => {
  // 不受child_process默认的缓冲区大小的使用方法，没参数也要写上{}：workerProcess = exec(cmdStr, {})
  workerProcess = exec(cmdStr, { cwd: process.cwd() + '/resources/scrcpy' })
  // 打印正常的后台可执行程序输出
  workerProcess.stdout.on('data', function (data) {
    console.log('stdout: ' + data)
    if (data.includes('失败') || data.includes('无法')) {
      ElMessage.error({ message: '连接失败：' + data, offset: 50 })
    } else if (data.includes('error') && !data.includes('more than')) {
      ElMessage.error({ message: data, offset: 50 })
    } else if (data.includes('connected') && isScrcpyCommand) {
      runExec('scrcpy -s ' + targetIP, false)
    }
  })

  // 打印错误的后台可执行程序输出
  workerProcess.stderr.on('data', function (data) {
    console.log('stderr: ' + data)
    if (data.includes('失败') || data.includes('无法')) {
      ElMessage.error({ message: '连接失败：' + data, offset: 50 })
      return
    } else if (data.includes('error') && !data.includes('more than')) {
      ElMessage.error({ message: data, offset: 50 })
    }
  })

  // 退出之后的输出
  workerProcess.on('close', function (code) {
    console.log('out code:' + code)
    if (loading) loading.value = false
    return resolve(true)
  })
})
