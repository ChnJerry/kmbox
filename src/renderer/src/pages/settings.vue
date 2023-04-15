<template>
    <el-card class="box-card">
        <h3>基本设置</h3>
        <!-- <el-alert title="修改基本设置需保存并重启程序后生效" type="info" show-icon :closable="false" /> -->
        <div class="card-title">
            锋云服务器 IP
        </div>
        <el-autocomplete v-model="settings.basicConfig.fyIP" :fetch-suggestions="querySearchFyIps"
            class="inline-input w-50" />
        <div class="card-title">
            网关服务器 IP
        </div>
        <el-autocomplete v-model="settings.basicConfig.gatewayIP" :fetch-suggestions="querySearchFyIps"
            class="inline-input w-50" />
        <div class="card-title">
            利云数据库地址
        </div>
        <el-autocomplete v-model="settings.basicConfig.lyDbAddr" :fetch-suggestions="querySearchLyIps"
            class="inline-input w-50" />
        <div class="card-title">
            利云数据库账户
        </div>
        <el-input v-model="settings.basicConfig.lyDbUser" class="inline-input w-50" />
        <div class="card-title">
            利云数据库密码
        </div>
        <el-input v-model="settings.basicConfig.lyDbPasswd" class="inline-input w-50" />
        <el-button type="primary" plain style="margin-top: 10px;" @click="saveConfig">保存</el-button>
    </el-card>

    <el-card class="box-card">
        <h3>利云终端管理</h3>
        <div>
            <el-tooltip :content="killAdbServerBeforeQuitTip" placement="right" effect="light">
                <el-checkbox v-model="settings.lyClientManage.killAdbServerBeforeQuit" label="关闭程序后终止 ADB 服务"
                    size="large"
                    @change="changeOneConfig('appConfig', 'killAdbServerBeforeQuit', settings.lyClientManage.killAdbServerBeforeQuit, true)" />
            </el-tooltip>
        </div>
        <div>
            <el-checkbox v-model="settings.lyClientManage.sortByIP" label="默认以IP地址排序" size="large"
                @change="changeOneConfig('appConfig', 'sortByIP', settings.lyClientManage.sortByIP, true)" />
        </div>
    </el-card>
    <el-card class="box-card" :body-style="{ width: '50vw' }">
        <h3>锋云设置</h3>
        <div class="card-title">
            欢迎信息
        </div>
        <div class="inline-input">
            <el-input v-model="settings.fyConfig.marquee" type="textarea" placeholder="编辑区域" autosize show-word-limit
                maxlength="140" resize="none" :disabled="editMarqueeAreaDisabled" />
            <el-select class="m-2" placeholder="模板" style="margin-top: 10px;" @change="bindMarqueeSelectChange"
                :disabled="editMarqueeAreaDisabled">
                <el-option v-for="(item, index) in data.suggestMarquees" :key="index" :value="item" />
            </el-select>
            <el-button type="primary" plain style="margin-top: 10px;" @click="setMarquee"
                :disabled="editMarqueeAreaDisabled ? editMarqueeAreaDisabled : saveMarqueeButtonDisabled">保存</el-button>
        </div>
        监控窗口
        <el-switch v-model="settings.fyConfig.monitorWindow" class="ml-2" style="--el-switch-on-color: #13ce66"
            @change="handleMonitorWindowSwitchChange" />

    </el-card>
    <!-- <el-card class="box-card">
        <h3>主题设置</h3>
        暗黑模式 <el-switch v-model="value1" />
    </el-card> -->
    <!-- <el-checkbox v-model="appConfig.appConfig.testDevicesPingState" label="持续 PING 设备是否在线" size="large" /> -->

</template>
<script lang="ts" setup>
import { ElMessage } from 'element-plus';
import { reactive, ref, onMounted } from 'vue';
import { getAppConfig, changeOneConfig, saveConfigToLocal } from '@renderer/bridge/appConfig.js'
import { fyMarquee } from '@renderer/bridge/connection.js'
import { newWindow } from '@renderer/controller/openWindow.js'
import { closeWindow } from '@renderer/controller/winSizeChange.js'

onMounted(() => {
    fyMarquee.get().then((result: string) => settings.fyConfig.marquee = result).catch((_err) => editMarqueeAreaDisabled.value = true)
})
const killAdbServerBeforeQuitTip = "由于1台客户端只能同时被1台电脑连接，如果您想在关闭程序后继续使用另一台电脑连接，请勾选"
const editMarqueeAreaDisabled = ref(false)
const settings = reactive({
    basicConfig: {
        fyIP: '',
        gatewayIP: '',
        lyDbAddr: '',
        lyDbUser: 'sa',
        lyDbPasswd: '',
        isReception: false
    },
    lyClientManage: {
        killAdbServerBeforeQuit: false,
        sortByIP: false
    },
    fyConfig: {
        marquee: '',
        monitorWindow: false,
    }
})
const data = reactive({
    suggestMarquees: [
        '欢迎使用视易&K米点歌系统！',
        '本场所营业时间为 13:00 - 02:00'
    ]
})
const appConfig = getAppConfig()
settings.basicConfig.fyIP = appConfig?.appConfig.fyIP
settings.basicConfig.gatewayIP = appConfig?.appConfig.gatewayIP
settings.basicConfig.lyDbAddr = appConfig?.DB.serverIP
settings.basicConfig.lyDbUser = appConfig?.DB.DBUser
settings.basicConfig.lyDbPasswd = appConfig?.DB.DBPassword
settings.lyClientManage.sortByIP = appConfig?.appConfig.sortByIP
settings.lyClientManage.killAdbServerBeforeQuit = appConfig?.appConfig.killAdbServerBeforeQuit
interface IpItem {
    id: number,
    value: string
}
const suggestFyIps = ref<IpItem[]>([{ id: 0, value: '192.168.10.2' }, { id: 1, value: '192.168.0.2' }, { id: 2, value: '192.168.1.2' }, { id: 3, value: '172.16.0.2' }])
const suggestLyIps = ref<IpItem[]>([{ id: 0, value: 'localhost' }, { id: 1, value: '192.168.10.8' }, { id: 2, value: '192.168.8.8' }, { id: 3, value: '172.16.0.8' }])
const querySearchFyIps = (queryString: string, cb: any) => {
    const results = queryString
        ? suggestFyIps.value.filter(createFilter(queryString))
        : suggestFyIps.value
    // call callback function to return suggestions
    cb(results)
}
const querySearchLyIps = (queryString: string, cb: any) => {
    const results = queryString
        ? suggestLyIps.value.filter(createFilter(queryString))
        : suggestLyIps.value
    // call callback function to return suggestions
    cb(results)
}
const createFilter = (queryString: string) => {
    return (suggestIps: IpItem) => {
        return (
            suggestIps.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        )
    }
}
const bindMarqueeSelectChange = (marquee: string) => {
    settings.fyConfig.marquee = marquee
}
const saveMarqueeButtonDisabled = ref(false)
const setMarquee = () => {
    saveMarqueeButtonDisabled.value = true
    fyMarquee.set(settings.fyConfig.marquee).then((result) => ElMessage.success({ message: result, offset: 50 })).catch((err) => ElMessage.error({ message: err, offset: 50 })).finally(saveMarqueeButtonDisabled.value = false)
}
const saveConfig = () => {
    if (appConfig?.appConfig.fyIP != settings.basicConfig.fyIP) changeOneConfig('appConfig', 'fyIP', settings.basicConfig.fyIP)
    if (appConfig?.appConfig.gatewayIP != settings.basicConfig.gatewayIP) changeOneConfig('appConfig', 'gatewayIP', settings.basicConfig.gatewayIP)
    if (appConfig?.DB.serverIP != settings.basicConfig.lyDbAddr) changeOneConfig('DB', 'serverIP', settings.basicConfig.lyDbAddr)
    if (appConfig?.DB.DBUser != settings.basicConfig.lyDbUser) changeOneConfig('DB', 'DBUser', settings.basicConfig.lyDbUser)
    if (appConfig?.DB.DBPassword != settings.basicConfig.lyDbPasswd) changeOneConfig('DB', 'DBPassword', settings.basicConfig.lyDbPasswd)
    saveConfigToLocal().then((res) => ElMessage.success({ message: res, offset: 50 })).catch((err) => ElMessage.error({ message: err, offset: 50 }))
}
const handleMonitorWindowSwitchChange = (value) => {
    if (value) newWindow()
    else closeWindow('fyMonitorWindow')
}
</script>
<style scoped>
.box-card {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: flex-start;
    margin-bottom: 15px;
}

.card-title {
    color: gray;
    margin: 7px 0;
}

/* 用于清除 h3 的默认样式 */
h3 {
    margin: 0 0 5px 0;
}

.inline-input {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    width: 69%;
}
</style>