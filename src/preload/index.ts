import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

// 用于判断程序是否是安装后第一次启动，如是，创建应用文件夹以存放配置；如否，读取配置文件
import fs from 'fs'
fs.exists(process.env.APPDATA + '/kmservice', (exists) => {
  if (!exists) {
    fs.mkdir(process.env.APPDATA + '/kmservice', (err) => {
      if (err) console.log(err)
      else console.log("success create dir ", process.env.APPDATA + '/kmservice')
    })
  }
})