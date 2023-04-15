const fs = require('fs')
const ini = require('ini')
let appConfig = {}
const file = process.env.APPDATA + '/kmservice/config.ini' // 文件路径
export const setAppConfig = (config) => {
  appConfig = config
}
export const getAppConfig = () => {
  if (Object.keys(appConfig).length !== 0) return appConfig
  else return false
}
export const getFyIP = () => {
  return new Promise((resolve, reject) => {
    if (Object.keys(appConfig).length !== 0) resolve(appConfig.appConfig.fyIP)
    else {
      fs.readFile(file, 'utf-8', (err, data) => {
        if (err) reject(err)
        appConfig = ini.parse(data)
        resolve(appConfig.appConfig.fyIP)
      })
    }
  })
}
export const getGatewayIP = () => {
  return new Promise((resolve, reject) => {
    if (Object.keys(appConfig).length !== 0) resolve(appConfig.appConfig.gatewayIP)
    else reject('error')
  })
}
// 将场所名从全角转半角（因为有的场所名称带全角字符）
export const transformCNameToHalfAngle = (companyName) => {
  let finalResult = ''
  if (!companyName) return 'error: companyName invalid'
  for (let i = 0; i < companyName.length; i++) {
    if (companyName.charCodeAt(i) == 12288) {
      finalResult += String.fromCharCode(companyName.charCodeAt(i) - 12256)
      continue
    }
    if (companyName.charCodeAt(i) > 65280 && companyName.charCodeAt(i) < 65375) finalResult += String.fromCharCode(companyName.charCodeAt(i) - 65248)
    else finalResult += String.fromCharCode(companyName.charCodeAt(i))
  }
  return finalResult
}
export const changeOneConfig = (node, field, config, saveToLocal) => {
  appConfig[node][field] = config
  if (saveToLocal) saveConfigToLocal()
}
export const saveConfigToLocal = () => {
  return new Promise((resolve, reject) => {
    fs.writeFile(process.env.APPDATA + '/kmservice/config.ini', ini.stringify(appConfig), (err) => {
      if (err) reject('保存配置失败: ' + err)
      resolve('保存配置成功')
    })
  })

}