<template>
    <div class="cards" v-if="getFyListDone == 1" v-loading="loading" :element-loading-text="loadingText">
        <el-card class="box-card" v-for="(fy, index) in fyList" :key="fy.ID" shadow="hover"
            body-style="display: flex; flex-wrap: wrap" :id="'fy' + index">
            <template #header>
                <div class="card-header">
                    <div class="header-fyinfo">
                        <div>{{ fy.ServerName }}
                            <el-tag class="ml-2" :type="fyList[index].status == 1 ? 'success' : 'info'" size="small">{{
                                fyList[index].status ? '在线' : '离线'
                            }}</el-tag>
                        </div>
                        <div>{{ `IP: ${fy.IP1}` }}</div>
                    </div>
                    <el-button v-show="fyList[index].status == 0" class="button" text
                        @click="fyList[index].status = -1">重连</el-button>
                    <el-button class="button" text @click="dialogVisible = true, targetIP = fy.IP1, targetIndex = index"
                        :disabled="fyList[index].status == 1 ? false : true">重启</el-button>
                </div>
            </template>
            <div v-for="item in (fyServices as any)" class="text item fy-services">{{ item.value }}<el-switch
                    v-model="fyProgressStatus[index][item.key]" class="ml-2" style="--el-switch-on-color: #13ce66"
                    @click="changeServiceStatus(index, item.key)" :id="'fy' + index + item.key"
                    :disabled="fyList[index].status == 1 ? false : true" />
            </div>
        </el-card>
    </div>
    <!-- 重启确认对话框区域 -->
    <el-dialog v-model="dialogVisible" title="提示" width="30%" align-center center>
        <span style="display: flex; justify-content: center">确认重启锋云服务器 <text style="color: cornflowerblue">{{
            targetIP
        }}</text> 吗？</span>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="rebootFy(targetIndex), dialogVisible = false">
                    确认
                </el-button>
            </span>
        </template>
    </el-dialog>

</template>
<script lang="ts" setup>
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref, onBeforeUnmount } from 'vue';
import { getFyIP } from '@renderer/bridge/appConfig.js'

let loading = ref(false)
var loadingText = ref('正在连接')

var mysql = require('mysql')
let fyIP = ref('')
getFyIP().then(res => {
    fyIP.value = res
    connectToFy()
})
const { Telnet } = require('telnet-client')
var dialogVisible = ref(false)
var targetIP = ref('')
var targetIndex = ref(-1)
var intervalTelnetFy = 0
var fyList = reactive([{
    ID: null,
    ServerName: null,
    IP1: '',
    model: 0,
    status: -1
}])
var fyServices: object = reactive([
    {
        key: 'fileservice',
        value: '文件服务',
    },
    {
        key: 'tsserver',
        value: '分发服务',
    },
    {
        key: 'vodserver',
        value: '视频服务',
    },
    {
        key: 'smftp',
        value: '机顶盒启动服务',
    },
    {
        key: 'updateservice',
        value: '升级服务',
    }, {
        key: 'stblogservice',
        value: '机顶盒日志服务',
    }
])
let fyProgressStatus: object = reactive([
    {
        fileservice: false,
        tsserver: true,
        vodserver: true,
        smftp: true,
        stblogservice: true,
        updateservice: true
    },
])
var getFyListDone = ref(0)
function connectToFy() {
    loading.value = true
    var connection = mysql.createConnection({
        host: fyIP.value,
        user: 'admin',
        password: 'admin',
        database: 'eVideoKTV'
    })
    connection.connect();
    connection.query('SELECT ID,IP1,ServerName FROM FY_SERVER WHERE ServerType=0 OR ServerType=1 AND OnLine=0 AND Usable1=0', async function (error, results) {
        if (error) {
            ElMessage.error({ message: `获取锋云列表失败: ${error}`, offset: 50 })
            loading.value = false
            return
        }
        fyList = results
        // console.log('The solution is: ', fyList);
        for (var i = 0; i < fyList.length; i++) {
            fyProgressStatus[i] = {
                fileservice: false,
                tsserver: false,
                vodserver: false,
                smftp: false,
                stblogservice: false,
                updateservice: false
            }
        }
        getFyListDone.value = 1
        getFysModel()
        telnetToFy()
        intervalTelnetFy = window.setInterval(telnetToFy, 5000)
    });
    connection.end();
}
async function getFysModel() {
    const telnetConnection = new Telnet()
    const params = [{}]
    for (var i = 0; i < fyList.length; i++) {
        params[i] = {
            host: fyList[i].IP1,
            port: 23,
            timeout: 1500,
            username: 'root',
            password: '123456'
        }
        try {
            await telnetConnection.connect(params[i])
            const result = await telnetConnection.exec('hostname', (err: any, response: string) => {
                telnetConnection.destroy()
                if (err) {
                    console.log(err)
                    return
                }
                return response
            })
            if (result.slice(0, 4) == '0349') {
                fyList[i].model = 7800
            }
            else if (result.slice(0, 4) == '0749') {
                fyList[i].model = 8000
            }
            else if (result.slice(0, 4) == '0849') {
                fyList[i].model = 8500
            }
        } catch (err) {
            console.log('获取锋云型号失败', err)
        }
    }
}
async function telnetToFy() {
    const telnetConnection = new Telnet()
    const params = [{}]
    for (var i = 0; i < fyList.length; i++) {
        if (fyList[i].status == 0) return
        params[i] = {
            host: fyList[i].IP1,
            port: 23,
            timeout: 1500,
            username: 'root',
            password: '123456'
        }
        try {
            await telnetConnection.connect(params[i])
            const res = await telnetConnection.exec('ps -ef|grep servicemanager', (err: any, response: string) => {
                if (err) {
                    console.log(err)
                    return
                }
                fyList[i].status = 1
                return response
            })
            if (res.includes('fileservice')) fyProgressStatus[i].fileservice = true
            else fyProgressStatus[i].fileservice = false
            if (res.includes('tsserver')) fyProgressStatus[i].tsserver = true
            else fyProgressStatus[i].tsserver = false
            if (res.includes('vodserver')) fyProgressStatus[i].vodserver = true
            else fyProgressStatus[i].vodserver = false
            if (res.includes('/updateservice')) fyProgressStatus[i].updateservice = true
            else fyProgressStatus[i].updateservice = false
            if (res.includes('smftp')) fyProgressStatus[i].smftp = true
            else fyProgressStatus[i].smftp = false
            if (res.includes('stblogservice')) fyProgressStatus[i].stblogservice = true
            else fyProgressStatus[i].stblogservice = false
        } catch (err) {
            ElMessage.error({ message: `连接锋云 ${params[i]['host']} 失败 [${err}]`, offset: 50 })
            fyList[i].status = 0
            return
        } finally {
            await telnetConnection.destroy()
            if (loading) loading.value = false
        }
    }
}
async function rebootFy(whichServer: number) {
    const telnetConnection = new Telnet()
    const params = {
        host: fyList[whichServer].IP1,
        port: 23,
        timeout: 1500,
        username: 'root',
        password: '123456'
    }
    await telnetConnection.connect(params)
    await telnetConnection.exec(`reboot`, (err: any, res: string) => {
        if (err) return
        console.log('success reboot ', fyList[whichServer].IP1, res)
    })
    telnetConnection.destroy()
}
async function changeServiceStatus(whichServer: number, serviceName: string) {
    const telnetConnection = new Telnet()
    const params = {
        host: fyList[whichServer].IP1,
        port: 23,
        timeout: 1500,
        username: 'root',
        password: '123456'
    }
    window.clearInterval(intervalTelnetFy)
    if (fyProgressStatus[whichServer][serviceName] == false) {
        // 因 8500 的 机顶盒日志服务 名为 fystblogservice，所以在这里特殊处理
        var ifStbLog = ''
        if (fyList[whichServer].model == 8500 && serviceName == 'stblogservice') ifStbLog = 'fy'
        try {
            await telnetConnection.connect(params)
            await telnetConnection.exec(`killall ${ifStbLog + serviceName}`, (err: any, res: string) => {
                telnetConnection.destroy()
                if (err) return
                console.log('success kill ' + serviceName, res)
            })
        } catch (err) {
            ElMessage.error({ message: `操作失败 [${err}]`, offset: 50 })
        }
    } else {
        var serviceSource = '/evideoktv/bin/servicemanager'
        var envSource = ''
        var ifStbLog = ''
        var fileserviceCmd = ''
        if (serviceName == 'fileservice') {
            fileserviceCmd = ' -style cleanlooks'
        }
        if (fyList[whichServer].model == 7800) {
            envSource = '/opt/qtmarvell/mvqt/env.sh'
        }
        else if (fyList[whichServer].model == 8000 || fyList[whichServer].model == 8500) {
            envSource = '/evideoktv/sh/env.sh'
        }
        if (fyList[whichServer].model == 8500) {
            // 因 8500 的 机顶盒日志服务 名为 fystblogservice，所以在这里特殊处理
            if (serviceName == 'stblogservice') ifStbLog = 'fy'
        }
        try {
            await telnetConnection.connect(params)
            await telnetConnection.exec(`source ${envSource}`, (err: any) => {
                if (err) throw err
            })
            if (fyList[whichServer].model == 7800 && serviceName == 'fileservice') {
                await telnetConnection.exec(`export QT_QWS_FONTDIR=/opt/qtmarvell/mvqt/lib/fonts`, (err: any) => {
                    if (err) throw err
                })
            }
            await telnetConnection.exec(`cd ${serviceSource}`, (err: any) => {
                if (err) throw err
            })
            console.log(`${serviceSource}/${ifStbLog + serviceName + fileserviceCmd} &`)
            await telnetConnection.exec(`${serviceSource}/${ifStbLog + serviceName + fileserviceCmd} &`, (err: any) => {
                if (err) throw err
            })
        } catch (err) {
            ElMessage.error({ message: `操作失败 [${err}]`, offset: 50 })
        } finally {
            telnetConnection.destroy()
        }
    }
    intervalTelnetFy = window.setInterval(telnetToFy, 5000)
}

onMounted(() => {
})
onBeforeUnmount(() => {
    window.clearInterval(intervalTelnetFy)
})
</script>
<style scoped>
.cards {
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-wrap: wrap;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-fyinfo {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.header-fyinfo div:nth-child(2) {
    color: gray;
    font-size: 13px;
}

.fy-services {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.fy-services:nth-child(2n) {
    margin-left: auto;
}

.text {
    font-size: 14px;
    text-align: left;
}

.item {
    width: 170px;
    margin-bottom: 18px;
}

.box-card {
    width: 420px;
    height: 250px;
}

.box-card:nth-child(n+3) {
    margin-top: 20px;
}
</style>