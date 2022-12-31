<template>
  <el-container>
    <el-header>
      <div class="title-bar">
        <text
          style="color:#cccccc; line-height: 35px; margin-left: 98px; font-family:''Segoe UI', Tahoma, Geneva, Verdana, sans-serif';">{{
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
        <button @click="maxsizeWindow" id="maxsizeButton">
          <div v-html="buttonsSvg.maximize.maximized"></div>
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
    </el-header>
    <el-container>
      <el-aside width="200px">
        <!-- <div v-for="item in asideButtons" class="aside-buttons" @click.prevent="page = item.page"
          :style="item.page === page ? 'background-color: #3a3a3f' : ''">
          <div class="aside-button-icons" v-html="item.html" />
          {{ item.value }}
        </div> -->
        <el-menu default-active="0" class="el-menu-vertical-demo" background-color="#222226" text-color="#fff">
          <el-menu-item v-for="item in asideButtons" :index="item.page" :disabled="item.disabled" @click="page = item.page">
            <template #title>
              <el-icon>
                <div v-html="item.html" />
              </el-icon>
              <span>{{ item.value }}</span>
            </template>
          </el-menu-item>
          <el-menu-item @click="page = '-1'">
            <template #title>
              <el-icon>
                <setting />
              </el-icon>
              <span>设置</span>
            </template>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <KeepAlive>
          <fyManage v-if="page === '0'" @writeConfigEvent="writeConfigFromChild" :appConfig="appConfig"
            ref="childFyManage" />
        </KeepAlive>
        <fyFocusManage v-if="page === '1'" :fyIP="appConfig.appConfig.fyIP" />
        <div v-if="hasConfig === 2" class="loading-page">
          <img :src="loadingImageSrc" />
        </div>
        <terminalRemoteControl v-else-if="(hasConfig === 1 && page === '2')" :appConfig="appConfig" />
        <songInfo v-else-if="(hasConfig === 1 && page === '3')" :fyIP="appConfig.appConfig.fyIP"/>
        <settings v-else-if="page === '-1'" :appConfig="appConfig" @writeConfigEvent="writeConfigFromChild" />
        <div v-else-if="(hasConfig === 0)" class="demo-input-suffix"
          style="padding: 0 100px 0 100px; line-height: 30px">
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
          <el-button v-if="cancelButton" type="info" size="large" plain style="margin-top: 50px"
            @click="(hasConfig = 1)">取消
          </el-button>
        </div>
        <!-- 设置窗口区域 start -->
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
        
        <!-- 设置窗口区域 end -->
        <el-dialog v-model="versionDialogVisible" title="版本信息" width="50%" :modal="false" draggable>
          <div v-for="item in getVersion()">{{ item }}</div>
          <el-button type="info" link @click="(versionDialogVisible = false, openDev())">打开调试</el-button>
        </el-dialog>
        <el-popover effect="light" placement="top-start" title="微信公众号" trigger="hover" width="auto">
          <template #reference>
            <el-button style="position: fixed; bottom: 2px; right: 2px" type="info" link @dblclick="versionDialogVisible = true">@K米服务中心</el-button>
          </template>
          <div style="text-align: center">
            <img style="width: 100px; height: 100px" src="http://help.ktvme.com/upload/images/img20221111111011.jpg" />
          </div>
        </el-popover>

      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import { ref } from 'vue'
import terminalRemoteControl from './components/terminalRemoteControl.vue'
import fyManage from './components/fyManage.vue'
import fyFocusManage from './components/fyFocusManage.vue'
import songInfo from './components/songInfo.vue'
import settings from './components/settings.vue'
import { ElButton, ElRow, ElInput, ElLoading, ElMessage, ElDialog, ElTooltip, ElContainer, ElHeader, ElAside, ElMain } from 'element-plus'

export default {
  name: 'App',
  components: {
    terminalRemoteControl,
    ElDialog,
    fyManage,
    fyFocusManage,
    songInfo,
    settings
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
      buttonsSvg: {
        maximize:{
          maximized:`<svg t="1671786566862" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2741" style="width: 15px; height: 15px; padding: 8px 17px;"><path d="M812.3 959.4H213.7c-81.6 0-148-66.4-148-148V212.9c0-81.6 66.4-148 148-148h598.5c81.6 0 148 66.4 148 148v598.5C960.3 893 893.9 959.4 812.3 959.4zM213.7 120.9c-50.7 0-92 41.3-92 92v598.5c0 50.7 41.3 92 92 92h598.5c50.7 0 92-41.3 92-92V212.9c0-50.7-41.3-92-92-92H213.7z" fill="#bfbfbf" p-id="2742"></path></svg>`,
          un: `<svg t="1671786603937" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2936" style="width: 15px; height: 15px; padding: 8px 17px;"><path d="M812.2 65H351.6c-78.3 0-142.5 61.1-147.7 138.1-77 5.1-138.1 69.4-138.1 147.7v460.6c0 81.6 66.4 148 148 148h460.6c78.3 0 142.5-61.1 147.7-138.1 77-5.1 138.1-69.4 138.1-147.7V213c0-81.6-66.4-148-148-148z m-45.8 746.3c0 50.7-41.3 92-92 92H213.8c-50.7 0-92-41.3-92-92V350.7c0-50.7 41.3-92 92-92h460.6c50.7 0 92 41.3 92 92v460.6z m137.8-137.7c0 47.3-35.8 86.3-81.8 91.4V350.7c0-81.6-66.4-148-148-148H260.2c5.1-45.9 44.2-81.8 91.4-81.8h460.6c50.7 0 92 41.3 92 92v460.7z" fill="#bfbfbf" p-id="2937"></path></svg>`
        }
      },
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
          sortByIP: false,
          fyIP: ''
        },
      },
      configDialogVisible: ref(false),
      versionDialogVisible: ref(false),
      asideButtons: {
        home: {
          name: "home",
          value: "首页",
          page: '0',
          disabled: false,
          html: '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-029747aa=""><path fill="currentColor" d="M192 413.952V896h640V413.952L512 147.328 192 413.952zM139.52 374.4l352-293.312a32 32 0 0 1 40.96 0l352 293.312A32 32 0 0 1 896 398.976V928a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V398.976a32 32 0 0 1 11.52-24.576z"></path></svg>'
        },
        fyFocusManage: {
          name: 'fyFocusManage',
          value: '锋云服务管理',
          disabled: true,
          page: '1',
          html: '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-029747aa=""><path fill="currentColor" d="M544 768v128h192a32 32 0 1 1 0 64H288a32 32 0 1 1 0-64h192V768H192A128 128 0 0 1 64 640V256a128 128 0 0 1 128-128h640a128 128 0 0 1 128 128v384a128 128 0 0 1-128 128H544zM192 192a64 64 0 0 0-64 64v384a64 64 0 0 0 64 64h640a64 64 0 0 0 64-64V256a64 64 0 0 0-64-64H192z"></path></svg>'
        },
        songInfo: {
          name: 'songInfo',
          value: '歌曲信息查询',
          disabled: true,
          page: '3',
          html: '<svg t="1671245144769" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M875.52 433.152q-7.168-1.024-12.8-10.24t-8.704-33.792q-5.12-39.936-26.112-58.88t-65.024-27.136q-46.08-9.216-81.408-37.376t-58.88-52.736q-22.528-21.504-34.816-15.36t-12.288 22.528l0 44.032 0 96.256q0 57.344-0.512 123.904t-0.512 125.952l0 104.448 0 58.368q1.024 24.576-7.68 54.784t-32.768 56.832-64 45.568-99.328 22.016q-60.416 3.072-109.056-21.504t-75.264-61.952-26.112-81.92 38.4-83.456 81.92-54.272 84.992-16.896 73.216 5.632 47.616 13.312l0-289.792q0-120.832 1.024-272.384 0-29.696 15.36-48.64t40.96-22.016q21.504-3.072 35.328 8.704t28.16 32.768 35.328 47.616 56.832 52.224q30.72 23.552 53.76 33.792t43.008 18.944 39.424 20.992 43.008 39.936q23.552 26.624 28.672 55.296t0.512 52.224-14.848 38.4-17.408 13.824z" p-id="2724" fill="currentColor"></path></svg>'
        },
        lyClientManage: {
          name: "lyClientManage",
          value: "利云终端管理",
          disabled: false,
          page: '2',
          html: '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-029747aa=""><path fill="currentColor" d="M640 384v64H448a128 128 0 0 0-128 128v128a128 128 0 0 0 128 128h320a128 128 0 0 0 128-128V576a128 128 0 0 0-64-110.848V394.88c74.56 26.368 128 97.472 128 181.056v128a192 192 0 0 1-192 192H448a192 192 0 0 1-192-192V576a192 192 0 0 1 192-192h192z"></path><path fill="currentColor" d="M384 640v-64h192a128 128 0 0 0 128-128V320a128 128 0 0 0-128-128H256a128 128 0 0 0-128 128v128a128 128 0 0 0 64 110.848v70.272A192.064 192.064 0 0 1 64 448V320a192 192 0 0 1 192-192h320a192 192 0 0 1 192 192v128a192 192 0 0 1-192 192H384z"></path></svg>'
        },
      },
      page: '0'
    }
  },
  mounted() {
    this.checkIfHasConfig()
    const { ipcRenderer } = require("electron")
    ipcRenderer.on("close", () => {
      if (this.appConfig.appConfig.killAdbServerBeforeQuit) {
        const exec = require('child_process').exec
        const workerProcess = exec('adb kill-server', { cwd: process.cwd() + '/resources/scrcpy' })
        workerProcess.stderr.on('data', (data: string) => {
          ElMessage.error({ message: data, offset: 50 })
        })
        ipcRenderer.send('destroy')
      }
      else ipcRenderer.send('destroy')
    })
    ipcRenderer.send('app_version')
    ipcRenderer.on('app_version', (event, arg) => {
      ipcRenderer.removeAllListeners('app_version')
      if (event)
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
          if (typeof (this.appConfig.DB.serverIP) != 'undefined') {
            this.input1 = this.appConfig.DB.serverIP
            this.input2 = this.appConfig.DB.DBUser
            this.input3 = this.appConfig.DB.DBPassword
          }
          else {
            ElMessage.error({ message: '读取配置文件失败', offset: 50 })
          }
          if (typeof (this.appConfig.appConfig.fyIP) != 'undefined') {
            (this.$refs.childFyManage as any).getConfig(this.appConfig.appConfig.fyIP)
          }
          // 先判断配置中的 companyName 字段是否存在，再判断值是否为空。如果不存在或为空，均开启定时重新获取配置
          if (typeof (this.appConfig.DB.companyName) != 'undefined') {
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
    writeConfigFromChild(node: string, field: string, config: string) {
      this.appConfig[node][field] = config
      const fs = require('fs')
      const ini = require('ini')
      fs.writeFileSync(process.env.APPDATA + '/kmservice/config.ini', ini.stringify(this.appConfig))
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
    maxsizeWindow() {
      const { ipcRenderer } = require("electron")
      ipcRenderer.send('window-max')
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

<style scoped>
.title-bar {
  width: 100%;
  height: 35px;
  -webkit-app-region: drag;
  background-color: #38383f;
  text-align: center;
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

/* 用于清除 el-header 默认样式 */
.el-header {
  padding: 0;
  height: 35px
}

.el-menu {
  height: calc(100vh - 35px)
}
.el-main {
  height: calc(100vh - 35px);
}
.aside-buttons {
  border-radius: 5px;
  padding: 10px;
  margin: 3px 10px;
  transition: all .3s;
  display: flex;
  justify-content: left;
  align-items: center;
  font-size: 14px;
  user-select: none;
}

.aside-buttons:hover {
  background-color: #2e2e32;
}

.aside-button-icons {
  width: 25px;
  height: 25px;
  margin-right: 13px;
}

</style>
