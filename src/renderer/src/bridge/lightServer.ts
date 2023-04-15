const got = require('got')
export const getDevicesList = (serverIP: string) => {
    return new Promise((resolve, reject) => {
        got(`http://${serverIP}:60002/lightserver/webApi/getDevicesList`).then(res => resolve(JSON.parse(res.body))).catch(err => reject(err))
    })
}
export const queryDeviceState = (serverIP: string, deviceInfo: object) => {
    return new Promise((resolve, reject) => {
        got.post(`http://${serverIP}:60002/lightserver/webApi/queryDeviceState`, { json: deviceInfo }).then(res => resolve(JSON.parse(res.body))).catch(err => reject(err))
    })
}
export const getAllScenario = (serverIP: string) => {
    return new Promise((resolve, reject) => {
        got(`http://${serverIP}:60002/lightserver/webApi/getAllScenario`).then(res => resolve(JSON.parse(res.body))).catch(err => reject(err))
    })
}
export const getAllDoorLight = (serverIP: string) => {
    return new Promise((resolve, reject) => {
        got(`http://${serverIP}:60002/lightserver/webApi/getAllDoorLight`).then(res => resolve(JSON.parse(res.body))).catch(err => reject(err))
    })
}
export const sendOperation = (serverIP: string, operation: object) => {
    return new Promise((resolve, reject) => {
        got.post(`http://${serverIP}:60002/lightserver/webApi/sendOperation`, { json: operation }).then(res => resolve(JSON.parse(res.body))).catch(err => reject(err))
    })
}
export const getStbOrderSongList = (gatewayIP: string, stbIP: string) => {
    return new Promise((resolve, reject) => {
        const time = new Date()
        const date = `${time.getFullYear()}-${time.getMonth() > 9 ? time.getMonth() + 1 : '0' + (time.getMonth() + 1)}-${time.getDate() > 9 ? time.getDate() : '0' + time.getDate()}`
        const ignoreIpSymbol = stbIP.replace(/\./g,"")
        got(`http://${gatewayIP}:9266/record/${ignoreIpSymbol}/${date}/tv_order.txt`).then(res => resolve(JSON.parse(res.body))).catch(err => reject(err))
    })
}