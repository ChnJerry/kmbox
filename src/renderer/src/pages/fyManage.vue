<template>
    <div class="progress" v-if="loadBaseInfoCount < 2">
        <el-progress v-if="progressShow" :percentage="100" :indeterminate="true" :show-text="false" />
        <el-result v-if="!progressShow" icon="error" title="连接失败" sub-title="请检查网络连接和服务器状态后重试">
            <template #extra>
                <el-button type="primary"
                    @click="loadBaseInfoCount = 0, progressShow = true, readyToShow()">重试</el-button>
            </template>
        </el-result>
    </div>
    <div v-show="show" v-loading="loading" :element-loading-text="loadingText">
        <div v-if="loadBaseInfoCount == 2">
            <div class="fyinfo-header">
                <div class="device-pic">
                    <img src="http://open-doc.ktvme.cn/uploads/projects/chenjiarui/1737aca12bf3c1b8.png" width="140" />
                    <div class="text">
                        {{ reginfo['dogid'].slice(0, 4) == '0349' ? 'EVS7800系列' : '' }}
                        {{ reginfo['dogid'].slice(0, 4) == '0749' ? 'EVS8000系列' : '' }}
                        {{ reginfo['dogid'].slice(0, 4) == '0849' ? 'EVS8500系列' : '' }}
                    </div>
                    <div class="text">
                        {{ serverVersion['基本信息']['服务器名称'] }}
                    </div>
                </div>
                <el-descriptions title="锋云服务器" :column="5" direction="vertical" style="flex: 1">
                    <el-descriptions-item label="场所名称">{{ reginfo['regname'] }}</el-descriptions-item>
                    <el-descriptions-item label="系统版本">{{ serverVersion['基本信息']['主版本号'] }}</el-descriptions-item>
                    <el-descriptions-item label="授权点数">{{ reginfo['totalnum'] }}</el-descriptions-item>
                    <el-descriptions-item label="开机时间" :span="2">{{
                        serverVersion['基本信息']['更新时间']
                    }}</el-descriptions-item>
                    <el-descriptions-item label="预订电话">{{ reginfo['booktel'] }}
                    </el-descriptions-item>
                    <el-descriptions-item label="授权方式">{{ reginfo['regtype'] }}
                    </el-descriptions-item>
                    <el-descriptions-item v-if="reginfo['regtype'] == '临时授权'" label="授权剩余时间">{{
                    `${reginfo['ramainhours']}
                    小时` }}
                    </el-descriptions-item>
                    <el-descriptions-item v-if="reginfo['regtype'] == '临时授权'" label="授权到期时间">{{ reginfo['outdate'] }}
                    </el-descriptions-item>
                </el-descriptions>
            </div>
            <el-divider />
            <div class="infoDashboard">
                <el-progress type="dashboard"
                    :percentage="(fyServer.localSongCount / fyServer.totalSongCount * 100) || 0">
                    <template #default>
                        <span class="percentage-value">{{ fyServer.localSongCount }}</span>
                        <span class="percentage-label">本地歌曲</span>
                    </template>
                </el-progress>
                <el-progress type="dashboard"
                    :percentage="(fyServer.localScoreSongCount / fyServer.totalScoreSongCount * 100) || 0">
                    <template #default>
                        <span class="percentage-value">{{ fyServer.localScoreSongCount }}</span>
                        <span class="percentage-label">本地评分歌曲</span>
                    </template>
                </el-progress>
                <el-progress type="dashboard" :percentage="fyServer.CPU.used || 0" :color="percentageColors">
                    <template #default>
                        <span class="percentage-value">{{ fyServer.CPU.used }}%</span>
                        <span class="percentage-label">CPU使用</span>
                    </template>
                </el-progress>
                <el-progress type="dashboard" :percentage="fyServer.memory.percent || 0" :color="percentageColors">
                    <template #default>
                        <span class="percentage-value">{{ fyServer.memory.percent }}%</span>
                        <span class="percentage-label">内存使用</span>
                    </template>
                </el-progress>
                <el-progress type="dashboard" :percentage="fyServer.ethState.percentage || 0" :color="percentageColors">
                    <template #default>
                        <span class="percentage-value">{{
                            fyServer.ethState.unit == 'unknown' ? '测速中' :
                                `${fyServer.ethState.eth0Speed + fyServer.ethState.unit}/s`
                        }}</span>
                        <span class="percentage-label">网卡0发送速率</span>
                    </template>
                </el-progress>
                <el-progress type="dashboard" :percentage="fyServer.hardDisk.percentage || 0" :color="percentageColors">
                    <template #default>
                        <span class="percentage-value">{{
                            fyServer.hardDisk.remainSpace + fyServer.hardDisk.unit
                        }}</span>
                        <span class="percentage-label">剩余存储空间</span>
                    </template>
                </el-progress>
            </div>
            <el-divider />
            <el-table :data="loadStatus" style="width: 100%">
                <el-table-column label="服务器名称" width="180">
                    <template #default="scope">
                        <div v-if="loadStatus[scope.$index]">{{ loadStatus[scope.$index].slice(0, 15) }}</div>
                    </template>
                </el-table-column>
                <el-table-column label="状态" width="180">
                    <template #default="scope">
                        <div v-if="loadStatus[scope.$index]">{{
                            loadStatus[scope.$index].replace(/\s*/g, "").match(/状态：(\S*)负载/)![1]
                        }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="IP" width="180">
                    <template #default="scope">
                        <div v-if="loadStatus[scope.$index]">{{
                            loadStatus[scope.$index].replace(/\s*/g, "").match(/ip:(\S*)状态/)![1]
                        }}</div>
                    </template>
                </el-table-column>
                <el-table-column label="负载">
                    <template #default="scope">
                        <div v-if="loadStatus[scope.$index]">{{
                            loadStatus[scope.$index].replace(/\s*/g, "").match(/负载：(\S*)预览/)![1]
                        }}</div>
                    </template>
                </el-table-column>
                <el-table-column label="预览">
                    <template #default="scope">
                        <div v-if="loadStatus[scope.$index]">{{
                            loadStatus[scope.$index].replace(/\s*/g, "").match(/预览：(\S*)连接/)![1]
                        }}</div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script lang="ts">
// import { ElMessage } from 'element-plus';
import { getLocalSongProportion, createMysqlPool, getFyBasicInfo, getFyRegInfo } from '@renderer/bridge/connection.js';
import { transformCNameToHalfAngle, getFyIP } from '@renderer/bridge/appConfig.js'

export default {
    name: 'fyManage',
    mounted() {
        this.readyToShow()
    },
    methods: {
        readyToShow() {
            setTimeout(() => {
                getFyIP().then(res => {
                    this.fyServer.fyIP = res
                    createMysqlPool(this.fyServer.fyIP)
                    this.getCompanyInfo()
                    this.getLocalSongProportion()
                    this.intervalGetCPUandMemoryState = window.setInterval(this.getCPU_Memory_NetworkState, 5000)
                }, 2000);
            })
            setTimeout(() => {
                this.progressShow = false
            }, 10000);
        },
        getCompanyInfo() {
            this.loadBaseInfoCount = 0
            this.loadingText = '连接中'
            this.loading = true
            getFyBasicInfo(this.fyServer.fyIP).then(res => {
                this.serverVersion = res
                this.loadBaseInfoCount += 1
            }).catch((err: any) => {
                this.loading = false
                console.log("file download error: ", err);
            })
            getFyRegInfo(this.fyServer.fyIP).then(res => {
                this.loadBaseInfoCount += 1
                window.clearInterval(this.loadStatusTimer)
                this.reginfo = res
                this.show = true
                this.reginfo['regname'] = transformCNameToHalfAngle(this.reginfo['regname'])
                switch (this.reginfo['dogid'].slice(0, 4)) {
                    case '0349' || '0749':
                        this.getLoadStatus()
                        this.loadStatusTimer = window.setInterval(this.getLoadStatus, 5000)
                        break
                    case '0849':
                        this.getLoadStatusNew()
                        this.loadStatusTimer = window.setInterval(this.getLoadStatusNew, 5000)
                }
            }).catch((err: any) => {
                this.loading = false
                console.log("file download error: ", err);
            })
        },
        async getLoadStatus() {
            const loadStatusFile = `http://${this.fyServer.fyIP}:9166/bin/logstation/log/服务器负载.log`
            const http = require('http')
            const fs = require('fs')
            await http.get(loadStatusFile, async (res) => {
                const file = fs.createWriteStream(`loadStatus.txt`);
                res.pipe(file);
                await file.on('finish', () => {
                    file.close();
                    this.loadStatus = fs.readFileSync(process.cwd() + '/loadStatus.txt', 'utf-8').split('\r\n')
                    let loadStatusResult: string[] = []
                    this.loadStatus.forEach((item) => {
                        if (item.includes('---- 状态')) loadStatusResult.push(item.slice(0, 16) + ' ip:')
                        else if (item.includes('负载')) loadStatusResult[loadStatusResult.length - 1] += item
                    })
                    this.loadStatus = loadStatusResult
                    // console.log(`loadStatus.txt downloaded!`, this.loadStatus)
                    if (this.loading) this.loading = false
                });
            }).on("error", (err) => {
                console.log("file download error: ", err.message);
            });
        },
        getLoadStatusNew() {
            const loadStatusFile = `http://${this.fyServer.fyIP}:9166/log/服务器负载.log`
            const http = require('http')
            const fs = require('fs')
            http.get(loadStatusFile, (res) => {
                const file = fs.createWriteStream(`loadStatus.txt`);
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    this.loadStatus = fs.readFileSync(process.cwd() + '/loadStatus.txt', 'utf-8').split('\r\n')
                    var loadStatusResult: string[] = []
                    this.loadStatus.forEach((item) => {
                        loadStatusResult.push(item.slice(0, 15) + 'ip:' + item.slice(16))
                    })
                    this.loadStatus = loadStatusResult
                    // console.log(`loadStatus.txt downloaded!`, this.loadStatus)
                    if (this.loading) this.loading = false
                })
            }).on("error", (err) => {
                console.log("file download error: ", err.message);
            });
        },
        getLocalSongProportion() {
            getLocalSongProportion().then((res: any) => {
                this.fyServer.totalSongCount = res.totalSongCount
                this.fyServer.localSongCount = res.localSongCount
                this.fyServer.totalScoreSongCount = res.totalScoreSongCount
                this.fyServer.localScoreSongCount = res.localScoreSongCount
            })
        },
        async getCPU_Memory_NetworkState() {
            const { Telnet } = require('telnet-client')
            const telnetConnection = new Telnet()
            const params = {
                host: this.fyServer.fyIP,
                port: 23,
                timeout: 1500,
                username: 'root',
                password: '123456'
            }
            // 如果连接失败次数超过5次，则清除定时器，展示连接失败页面
            if (this.connectErrorCount == 5) {
                window.clearInterval(this.intervalGetCPUandMemoryState)
                window.clearInterval(this.loadStatusTimer)
                this.show = false
                this.loadBaseInfoCount = 0
                this.progressShow = true
                this.connectErrorCount = 0
            }
            try {
                await telnetConnection.connect(params)
            }
            catch (err) {
                this.connectErrorCount += 1
                if (this.loadBaseInfoCount == 0) window.clearInterval(this.intervalGetCPUandMemoryState)
            }
            await telnetConnection.exec('top -n 1', (err: any, response: string) => {
                if (err) {
                    return err
                }
                const result = response.split('\n')
                this.fyServer.CPU.used = parseInt(result[1].replace(/\s*/g, "").match(/CPU:(\S*)%usr/)![1])
                this.fyServer.memory.used = parseInt(result[0].replace(/\s*/g, "").match(/Mem:(\S*)Kused/)![1])
                this.fyServer.memory.free = parseInt(result[0].replace(/\s*/g, "").match(/used,(\S*)Kfree/)![1])
                this.fyServer.memory.buffer = parseInt(result[0].replace(/\s*/g, "").match(/shrd,(\S*)Kbuff/)![1])
                this.fyServer.memory.cached = parseInt(result[0].replace(/\s*/g, "").match(/buff,(\S*)Kcached/)![1])
                this.fyServer.memory.total = this.fyServer.memory.used + this.fyServer.memory.free
                this.fyServer.memory.percent = parseInt(((this.fyServer.memory.used - this.fyServer.memory.buffer - this.fyServer.memory.cached) / this.fyServer.memory.total * 100).toFixed())
            })
            // 通过判断单位是否为初始的空置来决定要不要检测磁盘空间，所以只执行一次检测
            if (this.fyServer.hardDisk.unit == '')
                await telnetConnection.exec('df', (err: any, response: string) => {
                    if (err) return err
                    let result = response.split('\n')
                    let onlyMntDiskList: Array<string> = []
                    result.forEach((res) => {
                        if (res.includes('mnt')) onlyMntDiskList.push(res.replace(/ +/g, ' '))
                    })
                    let allMntDiskUse: number = 0
                    let allMntDiskAvailable: number = 0
                    onlyMntDiskList.forEach((res) => {
                        let result: Array<string> = res.split(' ')
                        allMntDiskAvailable += Number(result[3])
                        allMntDiskUse += Number(result[4].replace('%', ''))
                    })
                    this.fyServer.hardDisk.percentage = allMntDiskUse / onlyMntDiskList.length
                    if (allMntDiskAvailable / 1024 > 1024) {
                        if (allMntDiskAvailable / 1024 / 1024 > 1024) {
                            this.fyServer.hardDisk.remainSpace = allMntDiskAvailable / 1024 / 1024 / 1024
                            this.fyServer.hardDisk.unit = 'TB'
                        }
                        else {
                            this.fyServer.hardDisk.remainSpace = allMntDiskAvailable / 1024 / 1024
                            this.fyServer.hardDisk.unit = 'GB'
                        }
                    }
                    else {
                        this.fyServer.hardDisk.remainSpace = allMntDiskAvailable / 1024
                        this.fyServer.hardDisk.unit = 'MB'
                    }
                    this.fyServer.hardDisk.remainSpace = Number(this.fyServer.hardDisk.remainSpace.toFixed(1))
                })
            await telnetConnection.exec('ifconfig eth0', (err: any, response: string) => {
                if (err) return err
                const resList = response.split('\n')
                try {
                    resList.forEach((res, index) => {
                        if (res.includes('RX bytes')) throw index
                    })
                }
                catch (index: any) {
                    if (this.fyServer.ethState.eth0RXbytes == 0) this.fyServer.ethState.eth0RXbytes = parseInt(resList[index].match(/TX bytes:(\S*) /)![1])
                    else {
                        const newEth0RXbytes: number = parseInt(resList[index].match(/TX bytes:(\S*) /)![1])
                        const newEth0Speed: number = (newEth0RXbytes - this.fyServer.ethState.eth0RXbytes) / 5 / 1024
                        if (newEth0Speed > 1024) {
                            this.fyServer.ethState.eth0Speed = Number((newEth0Speed / 1024).toFixed(1))
                            this.fyServer.ethState.unit = 'MB'
                            if (this.fyServer.ethState.eth0Speed / 10 * 100 > 100) {
                                this.fyServer.ethState.percentage = 100
                            }
                            else this.fyServer.ethState.percentage = this.fyServer.ethState.eth0Speed / 10 * 100
                        } else {
                            this.fyServer.ethState.eth0Speed = Number(newEth0Speed.toFixed(1))
                            this.fyServer.ethState.unit = 'KB'
                            this.fyServer.ethState.percentage = this.fyServer.ethState.eth0Speed / 10485760 * 100
                        }
                    }
                    this.fyServer.ethState.eth0RXbytes = parseInt(resList[index].match(/TX bytes:(\S*) /)![1])
                }
            })
            telnetConnection.destroy()
        }
    },
    computed: {

    },
    data() {
        return {
            show: false,
            progressShow: true,
            connectErrorCount: 0,
            fyServer: {
                fyIP: '192.168.10.2',
                totalSongCount: 0,
                localSongCount: 0,
                totalScoreSongCount: 0,
                localScoreSongCount: 0,
                getHardDiskDoneFlag: 0,
                CPU: {
                    used: 0,
                },
                memory: {
                    used: 0,
                    free: 0,
                    total: 0,
                    cached: 0,
                    buffer: 0,
                    percent: 0
                },
                ethState: {
                    eth0RXbytes: 0,
                    eth0Speed: 0,
                    unit: 'unknown',
                    percentage: 0
                },
                hardDisk: {
                    percentage: 0,
                    remainSpace: 0,
                    unit: ''
                }
            },
            percentageColors: [
                { color: '#5CB87A', percentage: 60 },
                { color: '#e6a23c', percentage: 80 },
                { color: '#f56c6c', percentage: 100 },
            ],
            intervalGetCPUandMemoryState: 0, // interval 1
            serverVersion: {
                '基本信息': {
                    '服务器名称': '',
                    '主版本号': '',
                    '更新时间': ''
                }
            },
            reginfo: {
                '授权编号': '',
                '授权名称': '',
                '预定电话': ''
            },
            loadBaseInfoCount: 0, // 用于判断两个文件是否均下载成功
            loadStatus: [''],
            loading: false,
            loadingText: '',
            loadStatusTimer: 0, // interval 2
        }
    },
    props: ['appConfig']
}
</script>
<style scoped>
/* el-divider 修改边距 */
.el-divider--horizontal {
    margin: 1px 0;
}

.progress {
    width: 50%;
    margin-top: 25%;
    margin-left: 25%;
}

.percentage-value {
    display: block;
    margin-top: 10px;
    font-size: 23px;
}

.percentage-value:nth-child(3) {
    display: block;
    margin-top: 10px;
    font-size: 30px;
}

.percentage-label {
    display: block;
    margin-top: 10px;
    font-size: 12px;
}

.infoDashboard {
    display: flex;
    justify-content: space-around;
    margin: 10px 0;
}

.fyinfo-header {
    display: flex;
}

.fyinfo-header .device-pic {
    width: 160px;
    background-color: #1d1e1f;
    border-radius: 10%;
    margin: 0 10px 15px 0;
    display: flex;
    font-size: 17px;
    font-weight: bo;
    color: #cccccc;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
}

.fyinfo-header .device-pic div:nth-child(3) {
    font-size: 13px;
}

.fyinfo-header .text {
    margin-left: 10px;
}
</style>