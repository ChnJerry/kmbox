const { Telnet } = require('telnet-client');
var mysql = require('mysql')
// const sql = require('mssql')
// const { Sequelize } = require('sequelize');
let mysqlPool
let marquee
const telnetConnection = new Telnet()
const got = require('got')
const ini = require('ini')

export const createMysqlPool = (host) => {
    mysqlPool = mysql.createPool({
        connectionLimit: 10,
        host: host,
        user: 'admin',
        password: 'admin',
        database: 'eVideoKTV',
        multipleStatements: true, //允许多条语句同时查询
    });
}
export const getLocalSongProportion = () => new Promise((resolve, reject) => {
    let errorCount = 0
    mysqlPool.query('SELECT COUNT(*) FROM FY_SONGINFO; SELECT COUNT(*) FROM FY_SONGINFO WHERE FileCount>0; SELECT COUNT(*) FROM FY_SONGINFO WHERE IsMark=0; SELECT COUNT(*) FROM FY_SONGINFO WHERE IsMark=0 AND FileCount>0', function (error, results, fields) {
        if (error) errorCount += 1;
        if (errorCount > 0) reject()
        else resolve({ totalSongCount: results[0][0]['COUNT(*)'], localSongCount: results[1][0]['COUNT(*)'], totalScoreSongCount: results[2][0]['COUNT(*)'], localScoreSongCount: results[3][0]['COUNT(*)'] })
    });
})
export const querySong = (songIdList) => new Promise((resolve, reject) => {
    let querySql = `SELECT SONGNO, SongName, SingerName FROM FY_V_SONG_SEARCH WHERE SONGNO = ${songIdList[0]}`
    if(songIdList.length > 1){
        songIdList.forEach((item, index) => {
            if(index > 0) querySql += ` OR SONGNO = ${item}`
        })
        console.log(querySql)
    }
    mysqlPool.query(querySql, (error, results, fields) => {
        if (error) reject(error)
        else resolve(results)
    });
})
export const fyMarquee = {
    get() {
        return new Promise((resolve, reject) => {
            mysqlPool.query('SELECT Param_Str FROM `eVideoKTV`.`FY_SYSPARAM` WHERE ID=10', function (error, results) {
                if (error) reject(error)
                resolve(results[0].Param_Str)
            })
        })
    },
    set(text) {
        return new Promise((resolve, reject) => {
            mysqlPool.query(`UPDATE FY_SYSPARAM SET Param_Str = '${text}' WHERE ID = '10'`, function (error, _results) {
                if (error) reject('保存失败：' + error)
                resolve('保存走马灯成功')
            })
        })
    }
}
export const getFyBalance = (fyIP) => {
    return new Promise((resolve, reject) => {
        got(`http://${fyIP}:9166/log/服务器负载.log`).then(data => resolve(data.body))
    })
}
export const getFyBasicInfo = (fyIP) => {
    return new Promise((resolve, reject) => {
        got(`http://${fyIP}:9166/download/public/version/serverversion.txt`).then(data => resolve(ini.parse(data.body))).catch(err => reject(err))
    })
}
export const getFyRegInfo = (fyIP) => {
    return new Promise((resolve, reject) => {
        got(`http://${fyIP}:9166/bin/servicemanager/serverdata/reginfo.txt`).then(data => resolve(ini.parse(data.body))).catch(err => reject(err))
    })
}
let fyList = [] // 锋云列表，包含字段 ID、IP、服务器名称
// 所有锋云的服务状态(类型 Object)
let fyProgressStatus = [
    {
        fileservice: false,
        tsserver: true,
        vodserver: true,
        smftp: true,
        stblogservice: true,
        updateservice: true
    },
]
export const getFyList = (fyIP) => {
    return new Promise((resolve, reject) => {
        var connection = mysql.createConnection({
            host: fyIP,
            user: 'admin',
            password: 'admin',
            database: 'eVideoKTV'
        })
        try {
            connection.connect();
            connection.query('SELECT ID,IP1,ServerName FROM FY_SERVER WHERE ServerType=0 OR ServerType=1 AND OnLine=0 AND Usable1=0', (error, results) => {
                if (error) {
                    throw (error)
                }
                fyList = results
                resolve(results)
            })
        } catch (err) {
            reject(err)
        }
        finally {
            connection.end()
        }
    })
}
export const getFyProgressStatus = () => {
    return new Promise(async (resolve, reject) => {
        let connectErrorFyList = []
        fyList.forEach(async (item, index) => {
            const params = {
                host: item.IP1,
                port: 23,
                timeout: 1500,
                username: 'root',
                password: '123456'
            }
            try {
                await telnetConnection.connect(params)
                const res = await telnetConnection.exec('ps -ef|grep servicemanager', (err, response) => {
                    if (err) {
                        throw (err)
                    }
                    return response
                })
                fyProgressStatus[index].fileservice = res.includes('fileservice') ? true : false
                fyProgressStatus[index].tsserver = res.includes('tsserver') ? true : false
                fyProgressStatus[index].vodserver = res.includes('vodserver') ? true : false
                fyProgressStatus[index].updateservice = res.includes('/updateservice') ? true : false
                fyProgressStatus[index].smftp = res.includes('smftp') ? true : false
                fyProgressStatus[index].stblogservice = res.includes('stblogservice') ? true : false
            } catch (err) {
                connectErrorFyList.push(index)
            } finally {
                telnetConnection.end()
            }
            if (index == fyList.length - 1)
                resolve(fyProgressStatus, connectErrorFyList)
        })
    })
}