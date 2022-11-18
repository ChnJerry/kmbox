<template>
  <el-table v-loading="loading" :data="tableData" stripe height="400px" style="width: 100%">
    <el-table-column prop="MachineName" label="终端名称" width="180" />
    <el-table-column prop="MachineIp" label="IP地址" width="140" />
    <el-table-column prop="DeviceID" label="MAC地址" />
    <el-table-column label="PING状态" width="100">
      <template #default="scope">
        <el-tag :type="scope.row.pingStatus === '在线' ? 'success' : 'info'" disable-transitions>{{
            scope.row.pingStatus ? scope.row.pingStatus : '离线'
        }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column label="ADB状态" width="100">
      <template #default="scope">
        <el-tag :type="scope.row.adbStatus === '已连接' ? 'success' : 'info'" disable-transitions>{{ scope.row.adbStatus ?
            scope.row.adbStatus : '未连接'
        }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="操作" fixed="right" width="200px">
      <template #default="scope">
        <el-button size="small" type="primary" plain @click="connectToTerminal(scope.$index, scope.row.MachineIp)">连接
        </el-button>
        <el-button size="small" :disabled="scope.row.adbStatus === '未连接' || !scope.row.adbStatus ? true : false"
          @click="disconnectTerminal(scope.$index, scope.row.MachineIp)">断开</el-button>
        <el-button size="small" type="success" plain
          :disabled="scope.row.adbStatus === '未连接' || !scope.row.adbStatus ? true : false"
          @click="dialogVisible = true, targetIP = scope.row.MachineIp, targetName = scope.row.MachineName">重启
        </el-button>

      </template>
    </el-table-column>
  </el-table>
  <!-- 重启确认对话框区域 -->
  <el-dialog v-model="dialogVisible" title="提示" width="30%" align-center center>
    <span>确认重启利云终端 <text style="color: cornflowerblue">{{ targetName }}</text> 吗？</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="rebootTerminal(), dialogVisible = false">
          确认
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { ElLoading, ElMessage } from 'element-plus'

let loading
const disconnectTerminal = (index: number, row: string) => {
  try {
    loading = ElLoading.service({
      lock: true,
      text: '正在断开',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    console.log('断开第 ' + index + ' 台设备, IP 为 ' + row)
    runExec('adb disconnect ' + row, false)
    intervalADBState() // 断开后马上进行一次ADB状态检测
  } catch (err) {
    loading.close()
  }
}

const connectToTerminal = (index: number, row: string) => {
  try {
    loading = ElLoading.service({
      lock: true,
      text: '正在连接',
      background: 'rgba(0, 0, 0, 0.7)',
    })
    console.log(index, row)
    targetIP = row
    runExec('adb connect ' + row, true)
  } catch (err) {
    loading.close()
  }
}
// 重启终端
var dialogVisible = ref(false)
var targetIP = ''
var targetName = ''
function rebootTerminal() {
  try {
    runExec('adb -s ' + targetIP + ' reboot', false)
    ElMessage.success('已发送命令')
  } catch (err) {
    loading.close()
  }
}
const tableData = reactive([
  {
    MachineName: '前台收银1',
    MachineIp: '172.16.0.201',
    DeviceID: '2875D8A4496F',
    pingStatus: '离线',
    adbStatus: '已连接'
  }
])
// 读取配置
const fs = require('fs')
const ini = require('ini')
const file = process.cwd() + '/config.ini' // 文件路径
const config = ini.parse(fs.readFileSync(file, 'utf-8'))
console.log(config)
// 读取数据库
const dbConfig = {
  user: config.DB.DBUser,
  password: config.DB.DBPassword,
  server: config.DB.serverIP,
  database: 'eVideoBill_ET',
  options: {
    encrypt: false, //使用windows azure，需要设置次配置。
    trustServerCertificate: true
  }
}
const sql = require('mssql') //声明插件
sql
  .connect(dbConfig)
  .then(() => {
    loading = ElLoading.service({
      lock: true,
      text: '正在连接数据库',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    return sql.query`SELECT [MachineID], [MachineName], [MachineIp], [DeviceType], [DeviceID] FROM [eVideoBill_ET].[dbo].[BL_TBL_MachineUse] WHERE DeviceType=4`
  })
  .then((result) => {
    result.recordset.forEach((item, index) => {
      tableData[index] = item
    })
    intervalADBState()
    intervalPingState()
    loading.close()
  })
  .catch((err) => {
    ElMessage.error('连接数据库失败，您可以点击 设置 变更数据库地址及密码 ' + err)
    loading.close()
  })
sql.on('error', (err) => {
  console.log(err)
})

const exec = require('child_process').exec
// 本地需要启动的后台服务名称
// let cmdStr = 'adb connect 192.168.0.100'
// let cmdPath = 'D:'
let workerProcess
// 执行命令行，如果命令不需要路径，或就是项目根目录，则不需要cwd参数：
// workerProcess = exec(cmdStr, {cwd: cmdPath})

const runExec = (cmdStr: string, isScrcpyCommand: boolean) => new Promise((resolve) => {
  // 不受child_process默认的缓冲区大小的使用方法，没参数也要写上{}：workerProcess = exec(cmdStr, {})
  workerProcess = exec(cmdStr, { cwd: process.cwd() + '/resources/scrcpy' })
  // 打印正常的后台可执行程序输出
  workerProcess.stdout.on('data', function (data) {
    console.log('stdout: ' + data)
    if (data.includes('失败') || data.includes('无法')) {
      ElMessage.error('连接失败：' + data)
    } else if (data.includes('error') && !data.includes('more than')) {
      ElMessage.error(data)
    } else if (data.includes('connected') && isScrcpyCommand) {
      runExec('scrcpy -s ' + targetIP, false)
    }
  })

  // 打印错误的后台可执行程序输出
  workerProcess.stderr.on('data', function (data) {
    console.log('stderr: ' + data)
    if (data.includes('失败') || data.includes('无法')) {
      ElMessage.error('连接失败：' + data)
      return
    } else if (data.includes('error') && !data.includes('more than')) {
      ElMessage.error(data)
    }
  })

  // 退出之后的输出
  workerProcess.on('close', function (code) {
    console.log('out code:' + code)
    if (loading) loading.close()
    return resolve(true)
  })
})

function intervalPingState() {
  tableData.forEach((item) => {
    exec('ping ' + item.MachineIp + ' -n 1', (error, stdout, stderr) => {
      if (error || stderr) {
        item.pingStatus = '离线'
      } else if (stdout.includes('ms')) {
        item.pingStatus = '在线'
      } else {
        item.pingStatus = '离线'
      }
    })
  })
}
function intervalADBState() {
  exec('adb devices', { cwd: process.cwd() + '/resources/scrcpy' }, (error, stdout) => {
    if (error) console.log(error)
    else if (stdout) {
      tableData.forEach((item0) => {
        if (!stdout.includes(item0.MachineIp + ':5555')) {
          item0.adbStatus = '未连接'
        }
      })
      const stdoutArray: string[] = stdout.trim().split(/\n/)
      stdoutArray.forEach((item1) => {
        tableData.forEach((item2) => {
          if (item1.includes(item2.MachineIp + ':5555')) {
            if (item1.includes('device')) item2.adbStatus = '已连接'
            else if (item1.includes('offline')) item2.adbStatus = '未连接'
          }
        })
      })
    }
  })
}
setInterval(intervalPingState, 8000)
setInterval(intervalADBState, 8000)

const { ipcRenderer } = require("electron")
ipcRenderer.on("close", () => {
  const config = ini.parse(fs.readFileSync(file, 'utf-8'))
  if (config.appConfig.killAdbServerBeforeQuit) {
    runExec('adb kill-server', false).then(result => {
      console.log(result)
      if (result) ipcRenderer.send('destroy')
    }).catch(err => {
      console.log('promise error' + err)
    })
  }
  else ipcRenderer.send('destroy')
})
</script>
