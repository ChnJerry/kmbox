<template>
    <div class="app">
        <div class="title-bar" @mouseover="handleMouseOutContentBox">
            <text style="color:#cccccc; line-height: 27px;"></text>
            <button id="closeButton" @click="closeWindow('fyMonitorWindow')">
                <el-icon>
                    <Close />
                </el-icon>
            </button>
            <button id="lockButton" @click="handleLockButton" title="锁定并置顶">
                <el-icon :color="lockButtonColor">
                    <Lock />
                </el-icon>
            </button>
        </div>
        <div class="content-box" @mouseover="handleMouseOverContentBox">
            <marquee-text class="marquee" :duration="15" :repeat="2" :paused="marqueePaused"
                @mouseover="marqueePaused = true" @mouseout="marqueePaused = false">
                <div class="label">广告</div>
                K米 X 网易云音乐|治愈系点歌新功能上线！
                <el-link type="primary" href="https://mp.weixin.qq.com/s/yTMzGjGIbMplHhSBQKphvw"
                    target="_blank">了解详情</el-link>
            </marquee-text>
            <div class="title">曲库信息</div>
            <div class="info-inline" v-for="item in songInfo">
                <div class="inline-title">{{ item.name }}</div>
                <div class="inline-value">{{ item.value + item.unit }}</div>
            </div>
            <el-divider />
            <div class="title">锋云状态</div>
            <div class="info-inline">
                <div class="inline-title">已运行时间</div>
                <div class="inline-value">{{ fyOpenTime }}</div>
            </div>
                <div v-for="item in (fyList as any)" :key="item.ID" class="fy-progress-state"
                    :class="item.mustRunServiceState ? 'progress' : 'fy-progress-state-error'">
                    <div class="state-circle"></div>
                    {{ item.mustRunServiceState ? `${item.IP1} 的必要服务正常运行中` : '' }}
                </div>
            <el-divider />
            <div class="title">锋云负载</div>
            <div v-for="item in fyBalance" class="progress">
                {{ `IP: ${item.IP} 负载: ${item.view}` }}
                <el-progress :percentage="item.percentage" :show-text="false" />
            </div>
            <div class="time-remain">
                <div class="text-cn">距下一次重启任务</div>
                <div class="divider"/>
                <div class="text-cn">还剩小时</div>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { getFyIP } from '@renderer/bridge/appConfig.js'
import { getFyBalance, getLocalSongProportion, createMysqlPool, getFyBasicInfo, getFyList, getFyProgressStatus } from '@renderer/bridge/connection.js'
import { closeWindow, setAlwaysTop } from '@renderer/controller/winSizeChange.js'

let lockButtonColor = ref('currentColor')
let isLocked = ref(false)
let loadStatus = reactive([''])
let fyOpenTime = ref('')
let fyList = reactive([])
let fyProgressStatus = reactive([])
let marqueePaused = ref(false)
let fyBalance = reactive([
    {
        IP: '',
        view: -1,
        percentage: 0,
    }
])
let songInfo = reactive({
    localSong: {
        name: '本地歌曲',
        value: 0,
        unit: ' 首'
    },
    localScoreSong: {
        name: '评分歌曲',
        value: 0,
        unit: ' 首'
    }
})
getFyIP().then((fyIP: string) => {
    createMysqlPool(fyIP)
    getLocalSongProportion().then((res: any) => {
        songInfo.localSong.value = res.localSongCount
        songInfo.localScoreSong.value = res.localScoreSongCount
    })
    getFyBasicInfo(fyIP).then(res => {
        fyOpenTime.value = computeTimeInterval(new Date(res['基本信息']['更新时间']), new Date())
    })

    getFyBalance(fyIP).then(res => {
        var loadStatusResult: string[] = []
        loadStatus = res.split('\r\n')
        loadStatus.forEach((item: string) => {
            loadStatusResult.push(item.slice(0, 15) + 'ip:' + item.slice(16))
        })
        loadStatus = loadStatusResult
        loadStatus.forEach((res, index) => {
            fyBalance[index]['IP'] = res.replace(/\s*/g, "").match(/ip:(\S*)状态/)![1]
            fyBalance[index]['view'] = Number(res.replace(/\s*/g, "").match(/负载：(\S*)预览/)![1])
            fyBalance[index]['percentage'] = Math.round(fyBalance[index]['view'] / 35 * 100)
        })
    })
    getFyList(fyIP).then(res => {
        fyList = res
        getFyProgressStatus().then(res => {
            fyProgressStatus = res
            fyList.forEach((_item, index) => {
                if ((fyProgressStatus[index] as any).fileservice && (fyProgressStatus[index] as any).smftp && (fyProgressStatus[index] as any).tsserver && (fyProgressStatus[index] as any).vodserver)
                    (fyList[index] as any).mustRunServiceState = true
            })
            console.log(fyList, fyProgressStatus)
        })
    })
})
const handleLockButton = () => {
    if (isLocked.value) {
        isLocked.value = false
        lockButtonColor.value = 'currentColor'
        setAlwaysTop(false)
    }
    else if (!isLocked.value) {
        isLocked.value = true
        lockButtonColor.value = '#409EFC'
        setAlwaysTop(true)
    }
}
const handleMouseOverContentBox = () => {
    if (isLocked.value) {
        // changeMousePenetrateState(true)
        console.log(1)
    }
}
const handleMouseOutContentBox = () => {
    if (isLocked.value) {
        // changeMousePenetrateState(false)
    }
}
const computeTimeInterval = (startTime: Date, endTime: Date) => {
    var stime = Date.parse(startTime.toString());
    var etime = Date.parse(endTime.toString());
    // 两个时间戳相差的毫秒数
    var usedTime = etime - stime;
    // 计算相差的天数  
    var days = Math.floor(usedTime / (24 * 3600 * 1000));
    // 计算天数后剩余的毫秒数
    var leave1 = usedTime % (24 * 3600 * 1000);
    // 计算出小时数  
    var hours = Math.floor(leave1 / (3600 * 1000));
    // 计算小时数后剩余的毫秒数
    var leave2 = leave1 % (3600 * 1000);
    // 计算相差分钟数
    var minutes = Math.floor(leave2 / (60 * 1000));
    var time = `${days > 0 ? days + " 天 " : ''}${hours > 0 ? hours + " 小时 " : ''}${minutes} 分钟`;
    return time;
}
</script>
<style scoped>
.app {
    display: flex;
    flex-direction: column;
    width: 100%;
    opacity: 0.9;
    background-color: #1b1b1b;
}

.el-divider--horizontal {
    margin: 5px 0;
}

.title-bar {
    /* width: 100%; */
    height: 27px;
    -webkit-app-region: drag;
    background-color: #1b1b1b;
    opacity: 0.7;
    /* text-align: center; */
}

.title-bar button {
    padding: 0;
    border: 0;
    float: right;
    background-color: #1b1b1b;
    -webkit-app-region: no-drag;
    transition: all .2s;
    padding: 7px;
}

.title-bar button:hover {
    cursor: pointer;
    color: #409EFC;
}

.title-bar button#closeButton:hover {
    color: #ef675e;
}

.content-box {
    -webkit-app-region: drag;
    height: calc(100vh - 27px);
    margin: 0 15px;
}

.content-box .progress {
    font-size: 15px;
    color: #adbcd9;
}

.content-box .title {
    color: gray;
    font-weight: bold;
    cursor: default;
}

.info-inline {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.info-inline .inline-title {
    color: #adbcd9;
    font-size: 15px;
}

.info-inline .inline-value {
    color: #adbcd9;
    font-size: 15px;
}

.fy-progress-state {
    display: flex;
    align-items: center;
}

.fy-progress-state-success {
    color: cadetblue;
}

.fy-progress-state-error {
    color: #ef675e;
}

.state-circle {
    height: 6px;
    width: 6px;
    border-radius: 50%;
    background-color: aquamarine;
    margin: 0 3px;
}

.content-box .label {
    background-color: #ef675e;
    border-radius: .25rem;
    font-size: 75%;
    font-weight: 700;
    padding: .25em .4em;
    display: inline-block;
    line-height: 1;
    margin-left: 5px;
    vertical-align: baseline;
}
.marquee {
    cursor: default;
    -webkit-app-region: no-drag;
}
.time-remain{
}
.time-remain .text-cn{
    display: inline-flex;
    font-size: 23px;
    font-family: sans-serif;
    font-weight: bold;
}
.time-remain .divider{
    width: 6px;
    height: 70px;
    background-color: #b71b1b;
    margin-left: 100px;
    display: inline-flex;
}
</style>