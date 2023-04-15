const { ipcRenderer } = require("electron")

export const minsizeWindow = () => {
    ipcRenderer.invoke('window-min')
}
export const maxsizeWindow = () => {
    ipcRenderer.invoke('window-max')
}
export const closeWindow = (whichWindow) => {
    ipcRenderer.invoke('close', whichWindow)
}
export const openDev = () => {
    ipcRenderer.invoke('openDev')
}
export const setAlwaysTop = (status) => {
    ipcRenderer.invoke('set-always-top', status)
}
export const changeMousePenetrateState = (status) => {
    ipcRenderer.invoke('change-mouse-penetrate-state', status)
}