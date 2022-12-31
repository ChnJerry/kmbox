<template>
    <el-card class="box-card">
        <h3>基本设置</h3>
        <el-alert title="修改基本设置需保存并重启程序后生效" type="info" show-icon :closable="false" />
        <div class="card-title">
            锋云IP
        </div>
        <el-autocomplete v-model="settings.basicConfig.fyIP" :fetch-suggestions="querySearchFyIps"
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
        <el-button type="primary" plain style="margin-top: 10px;" @click="transSaveConfigToApp">保存</el-button>
    </el-card>

    <el-card class="box-card">
        <h3>利云终端管理</h3>
        <div>
            <el-tooltip :content="killAdbServerBeforeQuitTip" placement="right" effect="light">
                <el-checkbox v-model="settings.lyClientManage.killAdbServerBeforeQuit" label="关闭程序后终止 ADB 服务"
                    size="large" />
            </el-tooltip>
        </div>
        <div>
            <el-checkbox v-model="settings.lyClientManage.sortByIP" label="默认以IP地址排序" size="large" />
        </div>
    </el-card>
    <el-card class="box-card" :body-style="{ width: '50vw' }">
        <h3>锋云设置</h3>
        <div class="card-title">
            欢迎信息
        </div>
        <div class="inline-input">
            <el-input v-model="settings.fyConfig.marquee" type="textarea" placeholder="编辑区域" autosize show-word-limit
                maxlength="140" resize="none" />
            <el-select class="m-2" placeholder="模板" style="margin-top: 10px;" @change="bindMarqueeSelectChange">
                <el-option v-for="(item, index) in data.suggestMarquees" :key="index" :value="item" />
            </el-select>
            <el-button type="primary" plain style="margin-top: 10px;" @click="getOrSetMarquee('set', settings.fyConfig.marquee)">保存</el-button>
        </div>

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
onMounted(() => {
    getOrSetMarquee('get')
})
const killAdbServerBeforeQuitTip = "由于1台客户端只能同时被1台电脑连接，如果您想在关闭程序后继续使用另一台电脑连接，请勾选"
const settings = reactive({
    basicConfig: {
        fyIP: '',
        lyDbAddr: '',
        lyDbUser: 'sa',
        lyDbPasswd: ''
    },
    lyClientManage: {
        killAdbServerBeforeQuit: false,
        sortByIP: false
    },
    fyConfig: {
        marquee: ''
    }
})
const data = reactive({
    suggestMarquees: [
        '欢迎使用视易&K米点歌系统！',
        '本场所营业时间为 13:00 - 02:00'
    ]
})
const { appConfig } = defineProps({
    appConfig: Object
})
const emit = defineEmits(['writeConfigEvent'])
console.log(appConfig)
settings.basicConfig.fyIP = appConfig?.appConfig.fyIP
settings.basicConfig.lyDbAddr = appConfig?.DB.serverIP
settings.basicConfig.lyDbUser = appConfig?.DB.DBUser
settings.basicConfig.lyDbPasswd = appConfig?.DB.DBPassword
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
const getOrSetMarquee = async (type: string, text?: string) => {
    const mysql = require('mysql')
    var connection = mysql.createConnection({
        host: appConfig?.appConfig.fyIP,
        user: 'admin',
        password: 'admin',
        database: 'eVideoKTV'
    })
    if (type == 'get') {
        await connection.connect();
        await connection.query('SELECT Param_Str FROM `eVideoKTV`.`FY_SYSPARAM` WHERE ID=10', function (error: any, results: any) {
            if (error) return
            settings.fyConfig.marquee = results[0].Param_Str
            connection.end()
        })
    }
    else if(type == 'set'){
        await connection.connect();
        await connection.query(`UPDATE FY_SYSPARAM SET Param_Str = '${text}' WHERE ID = '10'`, function (error: any, _results: any) {
            if (error) {
                ElMessage.error({ message: error, offset: 50 })
                return
            }
            ElMessage.success({ message: '保存走马灯成功', offset: 50 })
            connection.end()
        })
    }
}
const transSaveConfigToApp = () =>{
    if(appConfig?.appConfig.fyIP != settings.basicConfig.fyIP) emit('writeConfigEvent', 'appConfig', 'fyIP', settings.basicConfig.fyIP)
    if(appConfig?.DB.serverIP != settings.basicConfig.lyDbAddr) emit('writeConfigEvent', 'DB', 'serverIP', settings.basicConfig.lyDbAddr)
    if(appConfig?.DB.DBUser != settings.basicConfig.lyDbUser) emit('writeConfigEvent', 'DB', 'DBUser', settings.basicConfig.lyDbUser)
    if(appConfig?.DB.DBPassword != settings.basicConfig.lyDbPasswd) emit('writeConfigEvent', 'DB', 'DBPassword', settings.basicConfig.lyDbPasswd)
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