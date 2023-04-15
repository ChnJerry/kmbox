const { ipcRenderer } = require("electron")
// const WinState = require('electron-win-state').default

// let fyMonitorWindow
export const newWindow = () => {
    ipcRenderer.invoke('window-open-event')
}