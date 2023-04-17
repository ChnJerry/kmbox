<template>
  <div v-if="getDevicesListDone" class="cards">
    <el-dropdown v-for="item, index in devicesList" :key="item.id" trigger="contextmenu">
      <el-card class="devices" :body-style="{ padding: '0' }">
        <!-- @mouseenter="handleQueryDeviceState(item.ip, item.mac, item.sn), tooltipVisible = true"
      @mouseout="tooltipVisible = false" -->
        <div style="display: flex; align-items: flex-end; justify-content: space-between;">
          <div class="room-title" :style="{ backgroundColor: roomStatusColor[item.roomstatus] }">
            {{ item.roomName }}<div class="state-circle"
              :style="item.deviceOnline == 0 ? 'background-color: green' : 'background-color: gray'"></div>
            <!-- <div style="font-weight: normal;">{{ item.air[3] }}℃</div> -->
          </div>
          <div v-if="firstQueryAllDeviceStateDone">
            <svg v-if="item.exhaust == 1" t="1681292036262" class="icon" viewBox="0 0 1024 1024" version="1.1"
              xmlns="http://www.w3.org/2000/svg" p-id="2827" width="200" height="200">
              <path
                d="M510.379 1019.568c-68.427 0-134.828-13.41-197.359-39.859-60.378-25.537-114.595-62.089-161.144-108.638-46.549-46.549-83.1-100.766-108.638-161.144C16.79 647.396 3.379 580.995 3.379 512.568S16.79 377.74 43.238 315.209c25.538-60.378 62.089-114.595 108.638-161.144 46.549-46.549 100.765-83.1 161.144-108.638C375.551 18.979 441.952 5.568 510.379 5.568s134.828 13.411 197.359 39.859c60.378 25.538 114.595 62.089 161.144 108.638 46.549 46.549 83.101 100.765 108.638 161.144 26.449 62.531 39.859 128.933 39.859 197.359s-13.41 134.828-39.859 197.359c-25.537 60.378-62.089 114.595-108.638 161.144s-100.766 83.101-161.144 108.638c-62.531 26.449-128.932 39.859-197.359 39.859z m0-934c-235.449 0-427 191.551-427 427 0 235.448 191.551 427 427 427 235.448 0 427-191.552 427-427s-191.552-427-427-427z"
                fill="#1C86E5" p-id="2828"></path>
              <path
                d="M887.032 475.393H683.844c35.259-41.115 54.492-92.893 54.492-147.63 0-60.686-23.633-117.739-66.544-160.65-42.912-42.912-99.965-66.544-160.651-66.544-22.091 0-40 17.909-40 40v199.619c-40.799-34.215-91.809-52.86-145.692-52.86-60.686 0-117.739 23.632-160.65 66.544-42.912 42.911-66.544 99.964-66.544 160.65 0 22.092 17.909 40 40 40h199.313c-35.258 41.114-54.492 92.893-54.492 147.63 0 60.686 23.632 117.739 66.543 160.65 42.912 42.911 99.965 66.544 160.65 66.544 22.091 0 40-17.908 40-40V686.404c41.42 36.33 93.966 56.183 149.568 56.183 60.686 0 117.739-23.633 160.65-66.544s66.544-99.965 66.544-160.65c0.001-22.092-17.907-40-39.999-40z m-335.89-289.302c61.785 17.471 107.194 74.37 107.194 141.672s-45.409 124.201-107.194 141.672V186.091zM325.449 367.328c67.302 0 124.201 45.408 141.672 107.194H183.777c17.471-61.786 74.37-107.194 141.672-107.194zM470.27 843.823c-61.786-17.471-107.194-74.369-107.194-141.672S408.484 577.95 470.27 560.479v283.344z m229.568-181.236c-67.303 0-124.201-45.408-141.672-107.194H841.51c-17.471 61.786-74.369 107.194-141.672 107.194z"
                fill="#1C86E5" p-id="2829"></path>
              <path d="M512.02 515.968m-106.584 0a106.584 106.584 0 1 0 213.168 0 106.584 106.584 0 1 0-213.168 0Z"
                fill="#FFFFFF" p-id="2830"></path>
              <path
                d="M512.02 662.552c-80.826 0-146.583-65.757-146.583-146.584s65.757-146.584 146.583-146.584c80.827 0 146.584 65.757 146.584 146.584S592.847 662.552 512.02 662.552z m0-213.168c-36.714 0-66.583 29.87-66.583 66.584 0 36.715 29.869 66.584 66.583 66.584 36.715 0 66.584-29.869 66.584-66.584s-29.87-66.584-66.584-66.584z"
                fill="#80E1FF" p-id="2831"></path>
            </svg>
            <div v-if="item.air[1] !== 142" style="display: inline-flex;">
              <svg v-if="item.air[0] == 107" t="1681292967518" class="icon" viewBox="0 0 1024 1024" version="1.1"
                xmlns="http://www.w3.org/2000/svg" p-id="7678" width="200" height="200">
                <path
                  d="M953.63072 502.33344v-31.88736a84.21376 84.21376 0 0 0-84.11136-84.11136h-87.6544a84.21376 84.21376 0 0 0-84.13184 84.11136v15.09376h-57.97888v-15.09376a84.21376 84.21376 0 0 0-84.11136-84.11136h-87.6544a84.21376 84.21376 0 0 0-84.13184 84.11136v15.09376h-58.0608v-15.09376a84.21376 84.21376 0 0 0-84.11136-84.11136h-87.6544a84.21376 84.21376 0 0 0-84.11136 84.11136v31.39584A90.3168 90.3168 0 0 0 31.10912 575.8976v59.10528c0 30.63808 15.38048 57.7536 38.8096 74.05568v220.5696a84.1728 84.1728 0 0 0 84.11136 84.04992h87.6544a84.1728 84.1728 0 0 0 84.11136-84.04992v-204.26752h58.0608v204.26752a84.1728 84.1728 0 0 0 84.11136 84.04992h87.6544a84.1728 84.1728 0 0 0 84.13184-84.04992v-204.26752h57.97888v204.26752a84.1728 84.1728 0 0 0 84.11136 84.04992h87.67488a84.1728 84.1728 0 0 0 84.11136-84.04992V708.68992a90.33728 90.33728 0 0 0 38.2976-73.68704V575.8976a89.94816 89.94816 0 0 0-38.2976-73.56416z m-690.5856 427.29472c0 11.53024-9.76896 21.27872-21.36064 21.27872h-87.6544a21.58592 21.58592 0 0 1-21.34016-21.27872v-459.1616c0-11.59168 9.74848-21.34016 21.34016-21.34016h87.6544c11.59168 0 21.34016 9.74848 21.34016 21.31968v459.18208z m62.75072-267.0592v-114.25792h58.0608v114.2784h-58.0608z m251.16672 267.0592c0 11.53024-9.74848 21.27872-21.31968 21.27872h-87.6544a21.58592 21.58592 0 0 1-21.36064-21.27872v-459.1616c0-11.59168 9.74848-21.34016 21.34016-21.34016h87.6544c11.59168 0 21.34016 9.74848 21.34016 21.31968v459.18208z m62.79168-267.0592v-114.25792h57.97888v114.2784h-57.97888z m251.0848 267.0592c0 11.53024-9.728 21.27872-21.2992 21.27872h-87.69536a21.58592 21.58592 0 0 1-21.31968-21.27872v-459.1616c0-11.59168 9.74848-21.34016 21.31968-21.34016h87.67488c11.59168 0 21.34016 9.74848 21.34016 21.31968v459.18208z m-88.20736-573.1328a31.39584 31.39584 0 0 0 23.49056-52.30592c-19.92704-22.3232-28.75392-42.8032-26.35776-60.74368 3.29728-24.84224 27.4432-40.77568 32.29696-44.58496 39.30112-36.78208 55.9104-73.56416 49.41824-109.3632-9.25696-50.688-60.94848-73.44128-66.82624-75.89888a31.27296 31.27296 0 0 0-40.83712 16.7936 31.49824 31.49824 0 0 0 16.60928 41.08288c6.7584 2.94912 26.74688 14.6432 29.30688 29.42976 2.27328 13.04576-8.58112 31.55968-25.74336 48.49664-4.95616 3.11296-48.7424 31.80544-56.32 84.72576-5.34528 37.21216 8.62208 74.8544 41.49248 111.88224a31.5392 31.5392 0 0 0 23.47008 10.48576z m-289.05472 0a31.39584 31.39584 0 0 0 23.49056-52.30592c-19.92704-22.3232-28.75392-42.8032-26.37824-60.74368 3.31776-24.84224 27.48416-40.77568 32.31744-44.58496 39.30112-36.78208 55.9104-73.56416 49.41824-109.3632C583.168 38.8096 531.456 16.05632 525.59872 13.59872a31.3344 31.3344 0 0 0-40.83712 16.7936 31.49824 31.49824 0 0 0 16.60928 41.08288c6.7584 2.94912 26.74688 14.6432 29.30688 29.42976 2.27328 13.04576-8.58112 31.55968-25.74336 48.49664-4.95616 3.11296-48.7424 31.80544-56.32 84.72576-5.34528 37.21216 8.62208 74.8544 41.49248 111.88224a31.5392 31.5392 0 0 0 23.47008 10.48576z m-298.92608 0a31.39584 31.39584 0 0 0 23.49056-52.30592c-19.92704-22.3232-28.75392-42.8032-26.35776-60.74368 3.29728-24.84224 27.4432-40.77568 32.29696-44.58496 39.30112-36.78208 55.9104-73.56416 49.41824-109.3632-9.25696-50.688-60.94848-73.44128-66.82624-75.89888a31.31392 31.31392 0 0 0-40.83712 16.7936 31.49824 31.49824 0 0 0 16.62976 41.08288c6.73792 2.94912 26.7264 14.6432 29.2864 29.42976 2.27328 13.04576-8.58112 31.55968-25.74336 48.49664-4.95616 3.11296-48.7424 31.80544-56.32 84.72576-5.34528 37.21216 8.62208 74.8544 41.49248 111.88224a31.5392 31.5392 0 0 0 23.47008 10.48576z"
                  fill="#d81e06" p-id="7679"></path>
              </svg>
              <svg v-if="item.air[0] == 106" t="1681293038038" class="icon" viewBox="0 0 1024 1024" version="1.1"
                xmlns="http://www.w3.org/2000/svg" p-id="8278" width="200" height="200">
                <path
                  d="M493.653333 389.973333l-168.96-168.96 30.08-30.08 138.88 138.666667 138.666667-138.666667 30.293333 30.08-168.96 168.96zM632.32 833.066667l-138.666667-138.666667-138.88 138.666667-30.08-30.08 168.96-168.96 168.96 168.96-30.293333 30.08z"
                  fill="#1296db" p-id="8279"></path>
                <path
                  d="M472.32 148.48h42.666667v726.826667h-42.666667zM202.666667 680.96L172.373333 650.666667l138.88-138.666667-138.88-138.666667 30.293334-30.293333 153.813333 153.813333a21.333333 21.333333 0 0 1 0 30.293334zM784.64 680.96l-153.813333-153.813333a21.333333 21.333333 0 0 1 0-30.293334l153.813333-153.813333 30.08 30.293333-138.666667 138.666667 138.666667 138.666667z"
                  fill="#1296db" p-id="8280"></path>
                <path d="M130.133333 490.666667h726.826667v42.666666H130.133333z" fill="#1296db" p-id="8281"></path>
              </svg>
            </div>
          </div>
        </div>
        <div class="device-state">
          <div>{{ item.roomTypeName }}</div>
          <div>{{ item.scenarioName }}</div>
        </div>
        <div class="device-state" v-if="firstQueryAllDeviceStateDone">
        </div>
        <div v-if="item.roomstatus != 1 && item.roomstatus != 17">
          <div class="song-list" v-if="item.songListLength > 0">
            <div class="title">在播：</div>
            <div class="song-name">{{ item.thisSong }}</div>
          </div>
          <div class="song-list" v-else>
            <div class="title blue">当前无在播歌曲</div>
          </div>
          <div class="song-list" v-if="item.songListLength > 1">
            <div class="title">下首：</div>
            <div class="song-name">{{ item.nextSong }}</div>
          </div>
          <div class="song-list" v-if="item.songListLength < 3 && item.songListLength > 0">
            <div class="title gray">-- 后面没歌啦 --</div>
          </div>
          <div class="song-list" v-if="item.songListLength > 2">
            <div class="title gray">-- 后面还有{{ item.songListLength - 2 }}首 --</div>
          </div>
        </div>
      </el-card>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="openAcDialog(item.ip, item.mac, item.sn, index)">空调控制</el-dropdown-item>
          <el-dropdown-item @click="sendOperationToMachine(item.ip, 'exhaust', item.exhaust == 1 ? 0 : 1, index)">
            {{ item.exhaust == 1 ? '关闭排风' : '打开排风' }}
          </el-dropdown-item>
          <el-dropdown-item @click="doorLight.openDoorLightDialog(item.ip, index)">门牌灯设置</el-dropdown-item>
          <el-dropdown-item divided v-if="item.roomstatus == 1"
            @click="sendOperationToMachine(item.ip, 'scenario', 5, index)">灯光柔和</el-dropdown-item>
          <el-dropdown-item v-if="item.roomstatus == 1"
            @click="sendOperationToMachine(item.ip, 'scenario', 1, index)">灯光动感</el-dropdown-item>
          <el-dropdown-item v-if="item.roomstatus == 1"
            @click="sendOperationToMachine(item.ip, 'scenario', 7, index)">灯光明亮</el-dropdown-item>
          <el-dropdown-item v-if="item.roomstatus == 1"
            @click="sendOperationToMachine(item.ip, 'scenario', 11, index)">灯光全关</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-dialog v-model="acDialogVisible" :title="`【${devicesList[acDialogForm.deviceIndex].roomName}】 空调控制`" width="30%">
      <div class="ac-items">
        开关：<el-switch v-model="acDialogForm.acSwitch" @change="acSwitchChange" /></div>
      <div class="ac-items">模式：<el-radio-group v-model="acDialogForm.air[0]" :disabled="!acDialogForm.acSwitch">
          <el-radio :label="106">制冷</el-radio>
          <el-radio :label="107">制热</el-radio>
          <el-radio :label="108">通风</el-radio>
        </el-radio-group></div>
      <div class="ac-items">风速：<el-radio-group v-model="acDialogForm.air[1]" :disabled="!acDialogForm.acSwitch">
          <el-radio :label="138">低</el-radio>
          <el-radio :label="139">中</el-radio>
          <el-radio :label="140">高</el-radio>
          <el-radio :label="141">自动</el-radio>
        </el-radio-group></div>
      <div class="ac-items">温度：<el-input style="width: 108px;" size="small" type="number" min="16" max="30"
          v-model="acDialogForm.air[3]" :disabled="!acDialogForm.acSwitch">
          <template #append>℃</template>
        </el-input></div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="acDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="acFormSubmit()">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog v-model="doorLightDialogVisible" :title="`【${devicesList[doorLightForm.deviceIndex].roomName}】 门牌灯设置`"
      width="45%">
      <el-radio-group v-model="doorLightForm.doorLightNo">
        <el-radio v-for="item in doorLightType" :label="item.key" style="width: 90px;">{{ item.name }}</el-radio>
      </el-radio-group>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="doorLightDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="doorLight.doorLightFormSubmit()">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
    <!-- <el-tooltip :visible="tooltipVisible" content="Bottom center" placement="bottom" effect="light" trigger="click"
      virtual-triggering :virtual-ref="triggerRef" /> -->
  </div>
</template>
<script lang="ts" setup>
import { getDevicesList, queryDeviceState, getStbOrderSongList, sendOperation, getAllDoorLight } from '@renderer/bridge/lightServer'
import { getAppConfig, getGatewayIP } from '@renderer/bridge/appConfig.js'
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue'
import { querySong, createMysqlPool } from '@renderer/bridge/connection.js';
import { ElMessage } from 'element-plus';

const appConfig = getAppConfig()
const serverIP = appConfig.DB.serverIP

let gatewayIP
getGatewayIP().then(res => {
  gatewayIP = res
  timers.getUserSongInfo = window.setInterval(intervalGetUserSongInfo, 30000)
  timers.refreshPage = window.setInterval(() => {
    getDevicesListDone.value = false
    getDevicesListDone.value = true
  }, 5000)
  if (appConfig.appConfig.isReception) {
    createMysqlPool(appConfig.appConfig.fyIP)
  }
})
const intervalGetUserSongInfo = () => {
  let needQuerySongList: string[] = []
  let querySongResult: Object[]
  let tempCount: number = 0
  devicesList.forEach((item, index) => {
    if (item.roomstatus == 1 || item.roomstatus == 17) {
      return
    } // 房态为空置时，不获取已点列表
    getStbOrderSongList(gatewayIP, item.roomIp).then((res: any) => {
      console.log(item.roomIp, res)
      devicesList[index].songListLength = res.length
      // console.log(devicesList[index])
      const completeSongId = (songId: any) => {
        songId = songId.toString()
        if (songId.length < 8) {
          let addZero: string = ''
          for (let i = 0; i < 8 - songId.length; i++) {
            addZero += '0'
          }
          return addZero + songId
        }
        else return songId
      }
      if (res.length == 1) {
        res[0].songId = completeSongId(res[0].songId)
        // 判断是否为云点歌，如是，直接读取歌星歌名；否则，加入待查询的歌曲列表中
        if (res[0].songType == '16' || res[0].songType == '17') {
          devicesList[index].thisSong = `${res[0].customData.singername} - ${res[0].customData.songname}`
        }
        else {
          needQuerySongList.push(res[0].songId)
        }
        devicesList[index].thisSongId = res[0].songId
      }
      else if (res.length > 1) {
        res[0].songId = completeSongId(res[0].songId)
        res[1].songId = completeSongId(res[1].songId)
        if (res[0].songType == '16' || res[0].songType == '17') {
          devicesList[index].thisSong = `${res[0].customData.singername} - ${res[0].customData.songname}`
        }
        else {
          needQuerySongList.push(res[0].songId)
        }
        if (res[1].songType == '16' || res[1].songType == '17') {
          devicesList[index].nextSong = `${res[1].customData.singername} - ${res[1].customData.songname}`
        }
        else {
          needQuerySongList.push(res[1].songId)
        }
        devicesList[index].thisSongId = res[0].songId
        devicesList[index].nextSongId = res[1].songId
      }
    }).catch(err => console.error(`获取 ${item.ip} 的已点列表失败`, err))
      .finally(() => {
        tempCount++
        if (tempCount == needQueryStbCount.value && needQuerySongList.length !== 0) {
          console.log('获取列表结束，准备查询所有待查询歌曲信息')
          querySongAfterGetAllSong()
        }
      })
  }
  )
  const querySongAfterGetAllSong = () => {
    querySong(needQuerySongList).then(res => {
      querySongResult = res
      console.log(querySongResult)
      devicesList.forEach((item, index) => {
        querySongResult.find((songItem: any) => {
          if (songItem.SONGNO == item.thisSongId) {
            devicesList[index].thisSong = `${songItem.SingerName} - ${songItem.SongName}`
          }
          if (songItem.SONGNO == item.nextSongId) {
            devicesList[index].nextSong = `${songItem.SingerName} - ${songItem.SongName}`
          }
        })
      })
    }).catch(err => ElMessage.error({ message: `查询歌曲列表信息失败: ${err}`, offset: 50 }))
  }
}
const getDevicesListDone = ref(false)
const firstQueryAllDeviceStateDone = ref(false)
let devicesList = reactive([
  {
    deviceOnline: 0,
    roomName: '101',
    roomstatus: 5, // 1 空置，5 使用，10 带客，17 清洁
    ip: '192.168.2.101',
    roomIp: '',
    roomTypeName: '',
    mac: '',
    sn: '',
    id: 0,
    thisSongId: '',
    thisSong: '',
    nextSongId: '',
    nextSong: '',
    songListLength: 0,
    air: [1, 1, 26, 26], // 第二个 142 是关
    scenarioName: '',
    scenario: 0,
    exhaust: 0,
    doorlight: 0
  }])
// let devicesFilterList = reactive([])
let roomStatusColor = {
  1: '#3375b9',
  5: '#ff4e4e',
  7: '#AB65DD',
  10: '#ff5c05',
  17: '#08D800',
  22: '#78A000'
}
let timers = {
  getUserSongInfo: 0,
  getAllDeviceStatue: 0,
  refreshPage: 0
}
if (serverIP) {
  getDevicesList(serverIP).then((res: any) => {
    devicesList = res.data.sort((a, b) => {
      return a.roomName - b.roomName
    }) // 将获取到的设备信息按房间名排序
    setTimeout(() => {
      queryAllDeviceState()
      intervalGetUserSongInfo()
      getDevicesListDone.value = true
    }, 2000);
    timers.getAllDeviceStatue = window.setInterval(queryAllDeviceState, 20000)
  }).catch(err => ElMessage.error({ message: `获取设备列表失败: ${err}`, offset: 50 }))
}
// 鼠标悬停包厢时弹出 tooltip
// const tooltipVisible = ref(false)
const needQueryStbCount = ref(0)
const sendOperationToMachine = (hostIP: string, operationType: string, content: any, deviceIndex: number) => {
  let sendContent: object = { hostIp: hostIP }
  switch (operationType) {
    case 'exhaust':
      sendContent = { ...sendContent, exhaust: content }
      break
    case 'air':
      sendContent = { ...sendContent, air: [...content] }
      break
    case 'scenario':
      sendContent = { ...sendContent, scenario: content }
      break
    case 'doorLight':
      sendContent = { ...sendContent, doorlight: content }
      break
  }
  sendOperation(serverIP, sendContent).then((res: any) => {
    console.log(sendContent)
    if (res.ret == -1) {
      ElMessage.error({ message: `${hostIP} 发送指令失败：${res.msg}`, offset: 50 })
      return
    }
    else {
      ElMessage.success({ message: `发送指令成功`, offset: 50 })
      setTimeout(() => queryDeviceState(serverIP, {
        hostIp: hostIP
      }).then((res: any) => {
        if (res.ret == -1) {
          ElMessage.error({ message: `${hostIP} 获取设备信息出错: ${res.msg}`, offset: 50 })
          return
        }
        devicesList[deviceIndex].air = res.data.air
        devicesList[deviceIndex].scenarioName = res.data.scenarioName
        devicesList[deviceIndex].exhaust = res.data.exhaust
        devicesList[deviceIndex].doorlight = res.data.doorlight
        devicesList[deviceIndex].scenario = res.data.scenario
      }), 2000)
    }
  })
}
// 空调相关
const acDialogVisible = ref(false)
const acDialogForm = reactive({
  acSwitch: false,
  air: [0, 0, 0, 0],
  zkIp: '',
  deviceIndex: 0
})
const openAcDialog = (zkIp: string, mac: string, sn: string, index: number) => {
  queryDeviceState(serverIP, {
    hostIp: zkIp,
    mac: mac,
    sn: sn
  }).then((res: any) => {
    if (res.ret == -1) {
      ElMessage.error({ message: `${zkIp} 获取设备信息出错: ${res.msg}`, offset: 50 })
      return
    }
    acDialogForm.zkIp = zkIp
    acDialogForm.air = res.data.air
    acDialogForm.deviceIndex = index
    if (res.data.air[1] == 142) acDialogForm.acSwitch = false
    else acDialogForm.acSwitch = true
    acDialogVisible.value = true
  })
}
const acSwitchChange = (e) => {
  if (e) acDialogForm.air[1] = 141
  else acDialogForm.air[1] = 142
}
const acFormSubmit = () => {
  if (acDialogForm.air[3] > 30 || acDialogForm.air[3] < 16) {
    ElMessage.error({ message: `温度请填写 16-30 的数字`, offset: 50 })
    return
  }
  acDialogForm.air[3] = Number(acDialogForm.air[3])
  sendOperationToMachine(acDialogForm.zkIp, 'air', acDialogForm.air, acDialogForm.deviceIndex)
  acDialogVisible.value = false
}

// 门牌灯相关
const doorLightDialogVisible = ref(false)
let doorLightType = reactive([{
  key: 0,
  name: '熄灭',
  id: 1
}])
const doorLightForm = reactive({
  deviceIndex: 0,
  doorLightNo: 0,
  doorLightTargetIp: ''
})
const doorLight = {
  openDoorLightDialog(zkIp: string, index: number) {
    queryDeviceState(serverIP, {
      hostIp: zkIp,
    }).then((res: any) => {
      if (res.ret == -1) {
        ElMessage.error({ message: `${zkIp} 获取设备信息出错: ${res.msg}`, offset: 50 })
        return
      }
      doorLightForm.doorLightNo = res.data.doorlight
      doorLightForm.doorLightTargetIp = zkIp
      doorLightForm.deviceIndex = index
      if (Object.keys(doorLightType).length == 1) {
        this.getDoorLightType()
        return
      }
      doorLightDialogVisible.value = true
    })

  },
  getDoorLightType() {
    getAllDoorLight(serverIP).then((res: any) => {
      doorLightType = res.data
      doorLightDialogVisible.value = true
    })
  },
  doorLightFormSubmit() {
    sendOperationToMachine(doorLightForm.doorLightTargetIp, 'doorLight', doorLightForm.doorLightNo, doorLightForm.deviceIndex)
    doorLightDialogVisible.value = false
  }
}
const queryAllDeviceState = async () => {
  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms)) // 延时函数
  for (let index = 0; index < devicesList.length; index++) {
    await sleep(200)
    queryDeviceState(serverIP, {
      hostIp: devicesList[index].ip,
      mac: devicesList[index].mac,
      sn: devicesList[index].sn
    }).then((res: any) => {
      if (res.ret == -1) {
        console.error(devicesList[index].ip, '获取设备信息出错: ', res.msg)
        return
      }
      devicesList[index].roomstatus = res.data.roomstatus
      console.log('changeRoomStatus', devicesList[index].roomName, devicesList[index].roomstatus)
      devicesList[index].air = res.data.air
      devicesList[index].scenarioName = res.data.scenarioName
      devicesList[index].exhaust = res.data.exhaust
      devicesList[index].doorlight = res.data.doorlight
      devicesList[index].scenario = res.data.scenario
      // console.log(devicesList)
    })
    if (index + 1 == devicesList.length) {
      let tempCount = 0
      devicesList.forEach(item => {
        if (item.roomstatus !== 1) {
          tempCount++
        }
      })
      needQueryStbCount.value = tempCount
      firstQueryAllDeviceStateDone.value = true
    }
  }
}
// const handleQueryDeviceState = (hostIp: string, mac: string, sn: string) => {
//   queryDeviceState(serverIP, {
//     hostIp: hostIp,
//     mac: mac,
//     sn: sn
//   }).then(res => console.log(res))
// }
// const triggerRef = ref({
//   getBoundingClientRect() {
//     return position.value
//   },
// })
const position = ref({
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
})
onMounted(() => {
  document.addEventListener('mousemove', (e) => {
    position.value = DOMRect.fromRect({
      width: 0,
      height: 0,
      x: e.clientX,
      y: e.clientY,
    })
  })
})
onBeforeUnmount(() => {
  window.clearInterval(timers.getUserSongInfo)
  window.clearInterval(timers.getAllDeviceStatue)
  window.clearInterval(timers.refreshPage)
})

</script>
<style scoped>
.cards {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
}

.devices {
  height: 130px;
  width: 200px;
  margin: 0 0 10px 0;
}

.song-list {
  color: rgb(156, 156, 156);
  font-size: 12px;
  display: flex;
  align-items: center;
  margin: 2px 8px;
}

.song-list .song-name {
  flex: 1;
}

.song-list .title {
  font-weight: bold;
  cursor: default;
  width: 37px;
}

.song-list .blue {
  width: 100%;
  font-size: 15px;
  font-weight: normal;
  color: rgb(75, 114, 187);
}

.song-list .gray {
  width: 100%;
  text-align: center;
  font-weight: normal;
}

.room-title {
  display: flex;
  flex-wrap: nowrap;
  /* justify-content: space-between; */
  align-items: center;
  cursor: default;
  height: 24px;
  width: 50%;
  font-weight: bold;
  padding-left: 10px;
  /* border-radius: 3px; */
  margin-top: 8px;
  background-image: linear-gradient(to left, #1d1e1f, transparent);
}

.device-state {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 2px 7px;
  color: rgb(156, 156, 156);
  cursor: default;
}

.state-circle {
  height: 6px;
  width: 6px;
  border-radius: 50%;
  margin: 0 3px;
}

.icon {
  height: 20px;
  width: 20px;
}

.ac-items {
  display: flex;
  align-items: center;
}
</style>