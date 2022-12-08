<template>
  <div class="title-bar">
    <text
      style="color:#cccccc; line-height: 35px; margin-left: 98px; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">{{
          appConfig.DB.companyName
      }}</text>
    <button @click="closeWindow" id="closeButton">
      <svg t="1669268402119" viewBox="0 0 1024 1024" version="1.1x" xmlns="http://www.w3.org/2000/svg" p-id="4170"
        style="width: 15px; height: 15px; padding: 8px 17px;">
        <path
          d="M548.992 503.744L885.44 167.328a31.968 31.968 0 1 0-45.248-45.248L503.744 458.496 167.328 122.08a31.968 31.968 0 1 0-45.248 45.248l336.416 336.416L122.08 840.16a31.968 31.968 0 1 0 45.248 45.248l336.416-336.416L840.16 885.44a31.968 31.968 0 1 0 45.248-45.248L548.992 503.744z"
          p-id="4171" fill="#bfbfbf"></path>
      </svg>
    </button>
    <button @click="minsizeWindow" id="minisizeButton">
      <svg t="1669268521908" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3405"
        style="width: 15px; height: 15px; padding: 8px 17px;">
        <path
          d="M863.7 552.5H160.3c-10.6 0-19.2-8.6-19.2-19.2v-41.7c0-10.6 8.6-19.2 19.2-19.2h703.3c10.6 0 19.2 8.6 19.2 19.2v41.7c0 10.6-8.5 19.2-19.1 19.2z"
          p-id="3406" fill="#bfbfbf"></path>
      </svg>
    </button>
  </div>
  <div v-if="hasConfig === 2" class="loading-page">
    <img :src="loadingImageSrc"/>
  </div>
  <terminalRemoteControl v-else-if="(hasConfig === 1)" />
  <div v-else-if="(hasConfig === 0)" class="demo-input-suffix" style="padding: 0 100px 0 100px; line-height: 30px">
    <h2 style="color: grey">基础配置</h2>
    <el-row>
      <span class="ml-3 w-35 text-gray-600 inline-flex items-center"
        style="color: cadetblue; font-weight: bold">数据库地址</span>
      <el-input v-model="input1" width="120px" class="w-50 m-2" placeholder="如果是本机可填 localhost" clearable />
      <span class="ml-3 w-35 text-gray-600 inline-flex items-center"
        style="color: cadetblue; font-weight: bold">数据库账号</span>
      <el-input v-model="input2" class="w-50 m-2" placeholder="一般为 sa" clearable />
      <span class="ml-3 w-35 text-gray-600 inline-flex items-center"
        style="color: cadetblue; font-weight: bold">数据库密码</span>
      <el-input v-model="input3" class="w-50 m-2" clearable @keyup.enter="writeConfig" />
    </el-row>
    <el-button type="primary" size="large" plain style="margin-top: 50px" @click="writeConfig">确定</el-button>
    <el-button v-if="cancelButton" type="info" size="large" plain style="margin-top: 50px" @click="(hasConfig = 1)">取消
    </el-button>
  </div>
  <!-- 设置窗口区域 start -->
  <el-button style="position: fixed; bottom: 3px; left: 3px" type="info" plain @click="configDialogVisible = true">设置
  </el-button>
  <el-dialog v-model="configDialogVisible" title="设置" width="50%">
    <!-- <el-checkbox v-model="appConfig.appConfig.testDevicesPingState" label="持续 PING 设备是否在线" size="large" /> -->
    <el-tooltip :content="killAdbServerBeforeQuitTip" placement="bottom" effect="light">
      <el-checkbox v-model="appConfig.appConfig.killAdbServerBeforeQuit" label="关闭程序后终止 ADB 服务" size="large" />
    </el-tooltip>
    <el-checkbox v-model="appConfig.appConfig.sortByIP" label="默认以IP地址排序" size="large" />
    <template #footer>
      <span class="dialog-footer">
        <el-button v-if="hasConfig" type="primary" text
          @click="hasConfig = 0, configDialogVisible = false, cancelButton = true">进入配置页</el-button>
        <el-button type="primary" @click="configDialogVisible = false, saveAppConfig()">
          保存
        </el-button>
      </span>
    </template>
  </el-dialog>
  <el-button style="position: fixed; bottom: 22px; right: 2px" type="info" link
    @dblclick="versionDialogVisible = true">{{ appConfig.DB.tyVersion }}</el-button>
  <!-- 设置窗口区域 end -->
  <el-dialog v-model="versionDialogVisible" title="版本信息" width="50%" :modal="false" draggable>
    <div v-for="item in getVersion()">{{ item }}</div>
    <el-button type="info" link @click="(versionDialogVisible = false, openDev())">打开调试</el-button>
  </el-dialog>
  <el-popover effect="light" placement="top-start" title="微信公众号" trigger="hover" width="auto">
    <template #reference>
      <el-button style="position: fixed; bottom: 2px; right: 2px" type="info" link>@K米服务中心</el-button>
    </template>
    <div style="text-align: center">
      <img style="width: 100px; height: 100px" src="http://help.ktvme.com/upload/images/img20221111111011.jpg" />
    </div>
  </el-popover>

</template>

<script lang="ts">
import { ref } from 'vue'
import terminalRemoteControl from './components/terminalRemoteControl.vue'
import { ElButton, ElRow, ElInput, ElLoading, ElMessage, ElDialog, ElTooltip } from 'element-plus'

export default {
  name: 'App',
  components: {
    terminalRemoteControl,
    ElDialog
  },
  data() {
    return {
      close: 1,
      input1: ref(''),
      input2: ref(''),
      input3: ref(''),
      hasConfig: ref(2), // 0 无配置，1 有配置，2 加载中
      cancelButton: ref(false),
      startPageLoadingPercent: ref(50),
      companyName: '',
      appVersion: '',
      loadingImageSrc: process.cwd() + '/resources/img/logo.webp',
      killAdbServerBeforeQuitTip: "由于1台客户端只能同时被1台电脑连接，如果您想在关闭程序后继续使用另一台电脑连接，请勾选",
      // config.ini 默认配置
      defaultConfig: {
        DB: {
          DBUser: 'sa',
          serverIP: 'localhost',
          DBPassword: ''
        }
      },
      appConfig: {
        DB: {
          DBUser: 'sa',
          serverIP: 'localhost',
          DBPassword: '',
          companyName: '',
          tyVersion: ''
        },
        appConfig: {
          killAdbServerBeforeQuit: false,
          sortByIP: false
        }
      },
      configDialogVisible: ref(false),
      versionDialogVisible: ref(false)
    }
  },
  mounted() {
    this.checkIfHasConfig()
    const { ipcRenderer } = require("electron")
    ipcRenderer.on("close", () => {
      if (this.hasConfig === 0 || this.hasConfig === 2)
        ipcRenderer.send('destroy')
    })
    ipcRenderer.send('app_version')
    ipcRenderer.on('app_version', (event, arg) => {
      ipcRenderer.removeAllListeners('app_version')
      console.log(event)
      this.appVersion = arg.version
    });
    this.getVersion()
    const fs = require('fs')
    fs.exists(process.env.APPDATA + '/kmservice', (exists) => {
      if (!exists) fs.mkdir(process.env.APPDATA + '/kmservice', (err) => {
        if (err) console.log(err)
        else console.log("success create dir 'kmservice'")
      })
    })
  },
  methods: {
    checkIfHasConfig() {
      const fs = require('fs')
      const ini = require('ini')
      const file = process.env.APPDATA + '/kmservice/config.ini' // 文件路径
      fs.exists(file, (exists) => {
        if (exists) {
          this.hasConfig = 1
          this.appConfig = ini.parse(fs.readFileSync(file, 'utf-8'))
          this.transformCNameToHalfAngle()
          try {
            if (this.appConfig.DB.serverIP) {
              this.input1 = this.appConfig.DB.serverIP
              this.input2 = this.appConfig.DB.DBUser
              this.input3 = this.appConfig.DB.DBPassword
            }
          } catch (err) {
            ElMessage.error({ message: '读取配置文件失败', offset: 50 })
            console.log(err)
          }
          // 先判断配置中的 companyName 字段是否存在，再判断值是否为空。如果不存在或为空，均开启定时重新获取配置
          if (this.appConfig.DB.companyName) {
            if (this.appConfig.DB.companyName === '') setTimeout(this.intervalGetCNameFromConfig, 10000)
          } else setTimeout(this.intervalGetCNameFromConfig, 10000)
        } else {
          this.hasConfig = 0
          fs.exists('C:\\StartVOD.ini', (exists) => {
            if (exists) {
              const localSysConfig = ini.parse(fs.readFileSync('C:\\StartVOD.ini', 'utf-8'))
              console.log(localSysConfig)
              this.input1 = localSysConfig['BILL_ET DB']['Server IP']
              this.input2 = localSysConfig['BILL_ET DB']['Usr Name']
            }
          })
          setTimeout(this.intervalGetCNameFromConfig, 10000)
        }
      })
    },
    writeConfig() {
      const loading = ElLoading.service({
        lock: true,
        text: '正在连接数据库',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      const fs = require('fs')
      const ini = require('ini')
      const file = process.env.APPDATA + '/kmservice/config.ini' // 文件路径
      const sql = require('mssql') //声明插件
      const dbConfig = {
        user: this.input2,
        password: this.input3,
        server: this.input1,
        database: 'eVideoBill_ET',
        options: {
          encrypt: false, //使用windows azure，需要设置此配置。
          trustServerCertificate: true
        }
      }
      sql.close() // 先关闭连接再连接到数据库，防止用户更改数据库地址时，原连接没有关闭，导致无法建立新的连接
      sql
        .connect(dbConfig)
        .then(() => {
          return sql.query`SELECT [MachineID], [MachineName], [MachineIp], [DeviceType], [DeviceID] FROM [eVideoBill_ET].[dbo].[BL_TBL_MachineUse] WHERE DeviceType=4`
        })
        .then((result) => {
          ElMessage.success({ message: '连接数据库成功', offset: 50 })
          console.log(result)
          loading.close()
          // 连接成功才写入配置
          this.appConfig.DB.serverIP = this.input1
          this.appConfig.DB.DBUser = this.input2
          this.appConfig.DB.DBPassword = this.input3
          fs.writeFileSync(file, ini.stringify(this.appConfig))
          this.hasConfig = 1
        })
        .catch((err) => {
          ElMessage.error({ message: '连接失败：' + err, offset: 50 })
          loading.close()
        })
    },
    saveAppConfig() {
      const fs = require('fs')
      const ini = require('ini')
      fs.writeFileSync(process.env.APPDATA + '/kmservice/config.ini', ini.stringify(this.appConfig))
      ElMessage.success({ message: '保存成功', offset: 50 })

    },
    minsizeWindow() {
      const { ipcRenderer } = require("electron")
      ipcRenderer.send('window-min')
    },
    closeWindow() {
      const { ipcRenderer } = require("electron")
      ipcRenderer.send('close')
    },
    openDev() {
      const { ipcRenderer } = require("electron")
      ipcRenderer.send('openDev')
    },
    intervalGetCNameFromConfig() {
      const fs = require('fs')
      const ini = require('ini')
      const file = process.env.APPDATA + '/kmservice/config.ini'
      this.appConfig = ini.parse(fs.readFileSync(file, 'utf-8'))
      if (this.appConfig.DB.companyName) {
        if (this.appConfig.DB.companyName === '') {
          setTimeout(this.intervalGetCNameFromConfig, 5000)
        } else {
          this.transformCNameToHalfAngle()
        }
      }
      else if (!this.appConfig.DB.companyName) setTimeout(this.intervalGetCNameFromConfig, 5000)
    },
    transformCNameToHalfAngle() {
      // 全角转半角（因为有的场所名称带全角字符）
      var finalResult = ''
      for (var i = 0; i < this.appConfig.DB.companyName.length; i++) {
        if (this.appConfig.DB.companyName.charCodeAt(i) == 12288) {
          finalResult += String.fromCharCode(this.appConfig.DB.companyName.charCodeAt(i) - 12256)
          continue
        }
        if (this.appConfig.DB.companyName.charCodeAt(i) > 65280 && this.appConfig.DB.companyName.charCodeAt(i) < 65375) finalResult += String.fromCharCode(this.appConfig.DB.companyName.charCodeAt(i) - 65248)
        else finalResult += String.fromCharCode(this.appConfig.DB.companyName.charCodeAt(i))
      }
      this.appConfig.DB.companyName = finalResult
    },
    getVersion() {
      let result: string = ''
      result += '版本: ' + this.appVersion + '\n'
      result += 'Electron: ' + process.versions['electron'] + '\n'
      result += 'Node.js: ' + process.versions['node'] + '\n'
      result += 'V8: ' + process.versions['v8'] + '\n'
      result += 'Chromium: ' + process.versions['chrome'] + '\n'
      const os = require('os')
      result += '操作系统: ' + os.release() + '\n'
      var resultArray = result.split('\n')
      return resultArray
    }
  }
}
</script>

<style>
body {
  background-color: #141414;
  margin: 0;
}

#app {
  text-align: center;
}

.title-bar {
  width: 100%;
  height: 35px;
  -webkit-app-region: drag;
  background-color: #38383f;
}

.title-bar button {
  padding: 0;
  border: 0;
  float: right;
  background-color: #38383f;
  -webkit-app-region: no-drag;
  /* transition: all .3s; */
}

.title-bar button:hover {
  background-color: #4b4b52;
}

.title-bar button#closeButton:hover {
  background-color: #ef675e;
}
.loading-page {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
