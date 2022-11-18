<template>
  <html class="dark">
  <terminalRemoteControl v-if="hasConfig" />
  <div v-else class="demo-input-suffix" style="padding: 0 100px 0 100px; line-height: 30px">
    <h2 style="color: grey">基础配置</h2>
    <el-row>
      <span class="ml-3 w-35 text-gray-600 inline-flex items-center"
        style="color: cadetblue; font-weight: bold">利云服务器IP</span>
      <el-input v-model="input1" width="120px" class="w-50 m-2" placeholder="如果是本机可填 localhost" clearable />
      <span class="ml-3 w-35 text-gray-600 inline-flex items-center"
        style="color: cadetblue; font-weight: bold">数据库账号</span>
      <el-input v-model="input2" class="w-50 m-2" placeholder="一般为 sa" clearable />
      <span class="ml-3 w-35 text-gray-600 inline-flex items-center"
        style="color: cadetblue; font-weight: bold">数据库密码</span>
      <el-input v-model="input3" class="w-50 m-2" clearable />
    </el-row>
    <el-button type="primary" size="large" plain style="margin-top: 50px" @click="writeConfig">确定</el-button>
    <el-button v-if="cancelButton" type="info" size="large" plain style="margin-top: 50px" @click="hasConfig = true">取消
    </el-button>
  </div>
  <!-- 设置窗口区域 start -->
  <el-button style="position: fixed; bottom: 3px; left: 3px" type="info" plain @click="dialogVisible = true">设置
  </el-button>
  <el-dialog v-model="dialogVisible" title="设置" width="50%">
    <!-- <el-checkbox v-model="appConfig.appConfig.testDevicesPingState" label="持续 PING 设备是否在线" size="large" /> -->
    <el-checkbox v-model="appConfig.appConfig.killAdbServerBeforeQuit" label="关闭程序后终止 ADB 服务" size="large" />
    <template #footer>
      <span class="dialog-footer">
        <el-button v-if="hasConfig" type="primary" text
          @click="hasConfig = false, dialogVisible = false, cancelButton = true">进入配置页</el-button>
        <el-button type="primary" @click="dialogVisible = false, saveAppConfig()">
          保存
        </el-button>
      </span>
    </template>
  </el-dialog>
  <!-- 设置窗口区域 end -->
  <el-popover placement="top-start" title="微信公众号" trigger="hover">
    <template #reference>
      <el-button style="position: fixed; bottom: 3px; right: 3px" type="info" link>@K米服务中心</el-button>
    </template>
    <div style="text-align: center">
      <img style="width: 100px; height: 100px" src="http://help.ktvme.com/upload/images/img20221111111011.jpg" />
    </div>
  </el-popover>

  </html>
</template>

<script lang="ts">
import { ref } from 'vue'
import terminalRemoteControl from './components/terminalRemoteControl.vue'
import { ElButton, ElRow, ElInput, ElLoading, ElMessage } from 'element-plus'

export default {
  name: 'App',
  components: {
    terminalRemoteControl
  },
  data() {
    return {
      input1: ref(''),
      input2: ref(''),
      input3: ref(''),
      hasConfig: ref(false),
      cancelButton: ref(false),
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
          DBPassword: ''
        },
        appConfig: {
          killAdbServerBeforeQuit: false
        }
      },
      dialogVisible: ref(false),
    }
  },
  mounted() {
    this.checkIfHasConfig()
    const { ipcRenderer } = require("electron")
    ipcRenderer.on("close", () => {
      if (!this.hasConfig)
        ipcRenderer.send('destroy')
    })
  },
  methods: {
    checkIfHasConfig() {
      const fs = require('fs')
      const ini = require('ini')
      const file = process.cwd() + '/config.ini' // 文件路径
      fs.exists(file, (exists) => {
        if (exists) {
          this.appConfig = ini.parse(fs.readFileSync(file, 'utf-8'))
          try {
            if (this.appConfig.DB.serverIP) {
              this.hasConfig = true
              this.input1 = this.appConfig.DB.serverIP
              this.input2 = this.appConfig.DB.DBUser
              this.input3 = this.appConfig.DB.DBPassword
            }
          } catch (err) {
            ElMessage.error('读取配置文件失败')
            console.log(err)
          }
        } else {
          fs.exists('C:\\StartVOD.ini', (exists) => {
            if (exists) {
              const localSysConfig = ini.parse(fs.readFileSync('C:\\StartVOD.ini', 'utf-8'))
              console.log(localSysConfig)
              this.input1 = localSysConfig['BILL_ET DB']['Server IP']
              this.input2 = localSysConfig['BILL_ET DB']['Usr Name']
            }
          })
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
      const file = process.cwd() + '/config.ini' // 文件路径
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
          ElMessage.success('连接成功')
          console.log(result)
          loading.close()
          // 连接成功才写入配置
          this.appConfig.DB.serverIP = this.input1
          this.appConfig.DB.DBUser = this.input2
          this.appConfig.DB.DBPassword = this.input3
          fs.writeFileSync(file, ini.stringify(this.appConfig))
          this.hasConfig = true
        })
        .catch((err) => {
          ElMessage.error('连接失败: ' + err)
          loading.close()
        })
    },
    saveAppConfig() {
      const fs = require('fs')
      const ini = require('ini')
      fs.writeFileSync(process.cwd() + '/config.ini', ini.stringify(this.appConfig))
      ElMessage.success('保存成功')
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
</style>
