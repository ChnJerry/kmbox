import { runExec, exec } from '@renderer/bridge/runCmd'

export const disconnectTerminal = (index: number, row: string) => {
    try {
      loadingText.value = '正在断开'
      loading.value = true
      console.log('断开第 ' + index + ' 台设备, IP 为 ' + row)
      runExec('adb disconnect ' + row, false)
      intervalADBState() // 断开后马上进行一次ADB状态检测
    } catch (err) {
      loading.value = false
    }
  }
  
export const connectToTerminal = (index: number, row: string) => {
    try {
      loadingText.value = '正在连接'
      loading.value = true
      console.log(index, row)
      targetIP = row
      runExec('adb connect ' + row, true)
    } catch (err) {
      loading.value = false
    }
  }