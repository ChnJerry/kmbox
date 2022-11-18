<template>
    <div class="demo-input-suffix" style="padding: 0 100px 0 100px; line-height: 30px">
        <h2 style="color: grey">基础配置</h2>
        <el-row>
            <span class="ml-3 w-35 text-gray-600 inline-flex items-center"
                style="color: cadetblue; font-weight: bold">利云服务器IP</span>
            <el-input v-model="input1" width="120px" class="w-50 m-2" placeholder="如果是本机可填 localhost" />
            <span class="ml-3 w-35 text-gray-600 inline-flex items-center"
                style="color: cadetblue; font-weight: bold">数据库账号</span>
            <el-input v-model="input2" class="w-50 m-2" placeholder="一般为 sa" />
            <span class="ml-3 w-35 text-gray-600 inline-flex items-center"
                style="color: cadetblue; font-weight: bold">数据库密码</span>
            <el-input v-model="input3" class="w-50 m-2" />
        </el-row>
        <el-button type="primary" size="large" plain style="margin-top: 50px" @click="writeConfig">确定</el-button>
    </div>
    <el-popover placement="top-start" title="微信公众号" trigger="hover">
        <template #reference>
            <el-button style="position: fixed; bottom: 3px; right: 3px" type="info" link>@K米服务中心</el-button>
        </template>
        <div style="text-align: center">
            <img style="width: 100px; height: 100px" src="http://help.ktvme.com/upload/images/img20221111111011.jpg" />
        </div>
    </el-popover>
</template>

<script lang="ts">
import { ElButton, ElRow, ElInput, ElLoading, ElMessage } from 'element-plus'
import { ref } from 'vue'

export default {
    data() {
        return {
            input1: ref(''),
            input2: ref(''),
            input3: ref(''),
            hasConfig: ref(false)
        }
    },
    mounted() {
        this.checkIfHasConfig()
    },
    methods: {
        checkIfHasConfig() {
            const fs = require('fs')
            const ini = require('ini')
            const file = process.cwd() + '/config.ini' // 文件路径
            const config = ini.parse(fs.readFileSync(file, 'utf-8'))
            if (config.DB.serverIP) this.hasConfig = true
            else this.hasConfig = false
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
            const config = ini.parse(fs.readFileSync(file, 'utf-8'))
            config.DB.serverIP = this.input1
            config.DB.DBUser = this.input2
            config.DB.DBPassword = this.input3
            const sql = require('mssql') //声明插件
            const dbConfig = {
                user: this.input2,
                password: this.input3,
                server: this.input1,
                database: 'eVideoBill_ET',
                options: {
                    encrypt: true, //使用windows azure，需要设置次配置。
                    trustServerCertificate: true
                }
            }
            sql
                .connect(dbConfig)
                .then(() => {
                    return sql.query`SELECT [MachineID], [MachineName], [MachineIp], [DeviceType], [DeviceID] FROM [eVideoBill_ET].[dbo].[BL_TBL_MachineUse] WHERE DeviceType=4`
                })
                .then((result) => {
                    ElMessage.success('连接成功')
                    console.log(result)
                    loading.close()
                    fs.writeFileSync(file, ini.stringify(config)) // 连接成功才写入配置
                    this.hasConfig = true
                })
                .catch((err) => {
                    ElMessage.error('连接失败：' + err)
                    loading.close()
                })
        }
    }

}


</script>