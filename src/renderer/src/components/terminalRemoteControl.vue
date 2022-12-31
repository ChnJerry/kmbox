<template>
  <el-table v-loading="loading" :element-loading-text="loadingText" :data="filterTableData" :max-height="450"
    style="width: 100%">
    <el-table-column label="终端名称" width="200px">
      <template #default="scope">
        <div style="display: flex; align-items: center">
          {{ scope.row.MachineName }}
          <el-tag style="margin-left: 2px;" class="ml-2" size="small"
            :style="scope.row.DeviceModel ? '' : 'display: none'" round>{{ scope.row.DeviceModel }}</el-tag>
          <!-- <el-tag style="margin-left: 2px;" class="ml-2" type="info" size="small" :style="scope.row.FirmWareVer ? '' : 'display: none'" round>{{ scope.row.FirmWareVer }}</el-tag> -->
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="MachineIp" label="IP地址" width="140" />
    <el-table-column prop="DeviceID" label="MAC地址" />
    <el-table-column label="PING状态" width="110" :filters="[{ text: '离线', value: '离线' }, { text: '在线', value: '在线' }]"
      :filter-method="filterPingTag" :filter-multiple=false>
      <template #default="scope">
        <el-tag :type="scope.row.pingStatus === '在线' ? 'success' : 'info'" disable-transitions>{{
            scope.row.pingStatus ? scope.row.pingStatus : '离线'
        }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column label="ADB状态" width="110" :filters="[{ text: '未连接', value: '未连接' }, { text: '已连接', value: '已连接' }]"
      :filter-method="filterADBTag" :filter-multiple=false>
      <template #default="scope">
        <el-tag :type="scope.row.adbStatus === '已连接' ? 'success' : 'info'" disable-transitions>{{ scope.row.adbStatus ?
            scope.row.adbStatus : '未连接'
        }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column fixed="right" align="right" width="200px">
      <template #header>
        <el-input v-model="searchMachine" size="small" placeholder="搜索终端" clearable />
      </template>
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
    <span style="display: flex; justify-content: center">确认重启利云终端 <text style="color: cornflowerblue">{{ targetName }}</text> 吗？</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="rebootTerminal(), dialogVisible = false">
          确认
        </el-button>
      </span>
    </template>
  </el-dialog>
  <el-button style="position: absolute; bottom: 22px; right: 2px" type="info" link
          >{{ config.DB.tyVersion }}</el-button>
</template>

<script lang="ts" setup>
import { reactive, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElNotification, ElTag } from 'element-plus'

let loading = ref(false)
let loadingText = ref('')
const disconnectTerminal = (index: number, row: string) => {
  try {
    loadingText.value = '正在断开'
    loading.value = true
    console.log('断开第 ' + index + ' 台设备, IP 为 ' + row)
    runExec('adb disconnect ' + row, false)
    intervalADBState() // 断开后马上进行一次ADB状态检测
  } catch (err) {
    loading.value = false
  }
}

const connectToTerminal = (index: number, row: string) => {
  try {
    loadingText.value = '正在连接'
    loading.value = true
    console.log(index, row)
    targetIP = row
    runExec('adb connect ' + row, true)
  } catch (err) {
    loading.value = false
  }
}
// 重启终端
var dialogVisible = ref(false)
var targetIP = ''
var targetName = ''
function rebootTerminal() {
  try {
    runExec('adb -s ' + targetIP + ' reboot', false)
    ElMessage.success({ message: '已发送命令', offset: 50 })
  } catch (err) {
    loading.value = false
  }
}
let tableData = reactive([
  {
    MachineName: '示例设备',
    MachineIp: '127.0.0.1',
    DeviceID: '2875D8A4496F',
    pingStatus: '离线',
    adbStatus: '已连接'
  }
])
// 读取配置
const fs = require('fs')
const ini = require('ini')
const file = process.env.APPDATA + '/kmservice/config.ini' // 文件路径
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
const searchMachineSQL = `SELECT a.[MachineID], a.[MachineName], a.[MachineIp], a.[DeviceType], a.[DeviceID], b.[DeviceType], b.[DeviceModel], b.[Mac], b.[IP], b.[SN], b.[FirmWare], b.[FirmWareVer], b.[MainAppVer] FROM [eVideoBill_ET].[dbo].[BL_TBL_MachineUse] a LEFT JOIN [eVideoBill_ET].[dbo].[BL_TBL_MachineInfoUploadTable] b ON a.MachineIp = b.IP WHERE a.DeviceType=4 AND a.Status=0 AND b.DeviceType='MIS-LY-CLIENT'`
const companyNameSQL = `SELECT [ParameterName],[ParameterValue] FROM [eVideoBill_ET].[dbo].[BL_TBL_SystemParameter] WHERE ParameterName = 'SystemVersion' OR ParameterName = 'UnitName'`
const sortByIPSQL = ` ORDER BY MachineIp`
// 剔除旧版本，目前发现有同个IP在 [BL_TBL_MachineInfoUploadTable] 表中对应两台终端的情况
const onlyLatestVersion = ` AND b.MainAppVer='${config.DB.tyVersion}'`
sql
  .connect(dbConfig)
  .then(async() => {
    loadingText.value = '正在连接数据库'
    loading.value = true
    let sqlResult
    let sqlResultCount: number = 0
    sqlResult = sql.query(searchMachineSQL + onlyLatestVersion + (config.appConfig.sortByIP ? sortByIPSQL : ''))
    await sqlResult.then((result) => {
      sqlResultCount = result.recordset.length
    })
    if (sqlResultCount === 0) return sql.query(searchMachineSQL + (config.appConfig.sortByIP ? sortByIPSQL : ''))
    else return sqlResult
  })
  .then((result) => {
    result.recordset.forEach((item, index) => {
      tableData[index] = item
    })
    intervalADBState()
    intervalPingState()
    loading.value = false
    return sql.query(companyNameSQL)
  })
  .then((result) => {
    result.recordset.forEach(element => {
      if (element.ParameterName == 'SystemVersion') config.DB.tyVersion = element.ParameterValue
      else if (element.ParameterName == 'UnitName') config.DB.companyName = element.ParameterValue
    });
    fs.writeFileSync(file, ini.stringify(config))
  })
  .catch((err) => {
    openNotification(`连接数据库失败，您可以点击 设置 变更数据库地址及密码 [${err}]`)
    loading.value = false
  })
sql.on('error', (err) => {
  console.log(err)
})

const openNotification = (errmsg) => {
  ElNotification({
    title: '错误',
    message: errmsg,
    duration: 10000,
    type: 'error',
    position: 'bottom-right',
  })
}
const exec = require('child_process').exec
// 本地需要启动的后台服务名称
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

function intervalPingState() {
  var ping = require('ping');
  tableData.forEach((item) => {
    ping.sys.probe(item.MachineIp, function (isAlive: boolean) {
      if(isAlive) item.pingStatus = '在线'
      else item.pingStatus = '离线'
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
const pingStatus = setInterval(intervalPingState, 8000)
const adbStatus = setInterval(intervalADBState, 8000)

const { ipcRenderer } = require("electron")
ipcRenderer.on("close", () => {
  sql.close()
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

// 搜索终端
const searchMachine = ref('')
const filterTableData = computed(() =>
  tableData.filter(
    (data) =>
      !searchMachine.value ||
      data.MachineName.toLowerCase().includes(searchMachine.value.toLowerCase())
  )
)

const filterPingTag = (value: string, row) => {
  return row.pingStatus === value
}
const filterADBTag = (value: string, row) => {
  return row.adbStatus === value
}

onMounted(() => {
  // window.addEventListener('resize', () => {
  //   maxHeight = window.innerHeight - 225
  // })
})
onBeforeUnmount(()=>{
  clearInterval(pingStatus)
  clearInterval(adbStatus)
})
</script>