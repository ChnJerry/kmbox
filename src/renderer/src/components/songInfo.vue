<template>
    <el-form :inline="true" :model="form" class="demo-form-inline" :disabled="!getBasicInfoDone" id="searchForm">
        <el-form-item label="歌曲编号">
            <el-input v-model="form.songID" clearable @keyup.enter="submitSearch" />
        </el-form-item>
        <el-form-item label="歌曲名称">
            <el-input v-model="form.songName" clearable @keyup.enter="submitSearch" />
        </el-form-item>
        <el-form-item label="歌手名称">
            <el-input v-model="form.singer" clearable @keyup.enter="submitSearch" />
        </el-form-item>
        <el-form-item label="点播率≤">
            <el-input v-model="form.ranks" clearable @keyup.enter="submitSearch" />
        </el-form-item>
        <el-form-item label="歌曲语种">
            <el-select v-model="form.songLanguage" clearable>
                <el-option v-for="item in (songLanguage as any)" :label="item.LanguageName" :value="item.ID" />
            </el-select>
        </el-form-item>
        <el-form-item label="歌曲类型">
            <el-select v-model="form.songType" clearable>
                <el-option v-for="item in (songType as any)" :label="item.TypeName" :value="item.ID" />
            </el-select>
        </el-form-item>
        <el-form-item label="歌曲版本">
            <el-select v-model="form.VerID" clearable>
                <el-option v-for="item in (songVersion as any)" :label="item.TypeName" :value="item.ID" />
            </el-select>
        </el-form-item>
        <el-form-item label="文件数量">
            <el-select v-model="form.fileCount" clearable>
                <el-option label="大于0" value='>' />
                <el-option label="等于0" value='=' />
            </el-select>
        </el-form-item>
        <el-form-item label="评分可用">
            <el-select v-model="form.isMark" clearable>
                <el-option label="有评分" value='0' />
                <el-option label="无评分" value='1' />
            </el-select>
        </el-form-item>
        <el-form-item label="歌曲状态">
            <el-select v-model="form.isHide" clearable>
                <el-option label="启用" value='0' />
                <el-option label="禁用" value='1' />
            </el-select>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="submitSearch" :loading="loading">查询</el-button>
            <el-button type="info" @click="clearForm">重置</el-button>
        </el-form-item>
    </el-form>
    <el-auto-resizer>
        <template #default="{ width }">
            <transition name="el-zoom-in-center">
                <el-table-v2 v-if="searchDone == 1" :columns="columns" :data="searchResult" :width="width"
                    :height="tableHeight" :footer-height="50" fixed>
                    <template #footer>
                        <el-pagination :page-sizes="[1000, 2000]" layout="total, prev, pager, next, jumper"
                            :total="resultCount" :page-size="1000" v-model:current-page="currentPage" @current-change="handleCurrentChange" />
                    </template>
                    <template #empty>
                        <div class="flex items-center justify-center h-100%">
                            <el-empty />
                        </div>
                    </template>
                </el-table-v2>
            </transition>
        </template>
    </el-auto-resizer>
</template>
<script lang="ts" setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus';

const loading = ref(false)
const { fyIP } = defineProps({
    fyIP: String
})
onMounted(() => {
    getBasicInfo()
})
var songLanguage = reactive({})
var songType = reactive({})
var songVersion = reactive({})
const form = reactive({
    songID: '',
    songName: '',
    singer: '',
    ranks: '',
    songType: '',
    songLanguage: '',
    fileCount: '',
    isMark: '',
    VerID: '',
    isHide: '',
})
const columns = [
    {
        key: 'songID',
        dataKey: 'SongNO',
        title: '歌曲编号',
        width: 100
    },
    {
        key: 'songName',
        dataKey: 'SongName',
        title: '歌曲名称',
        width: 270
    },
    {
        key: 'singer',
        dataKey: 'SingerName',
        title: '歌手',
        width: 200
    }, {
        key: 'songType',
        dataKey: 'SongTypeID1',
        title: '歌曲类型',
        width: 100
    }, {
        key: 'songLanguage',
        dataKey: 'SongLanguageID1',
        title: '歌曲语种',
        width: 100
    }, {
        key: 'VerID',
        dataKey: 'VerID',
        title: '歌曲版本',
        width: 100
    }, {
        key: 'ranks',
        dataKey: 'Ranks',
        title: '点播率',
        width: 100
    }, {
        key: 'isMark',
        dataKey: 'IsMark',
        title: '评分',
        width: 100
    }, {
        key: 'isHide',
        dataKey: 'IsHide',
        title: '歌曲状态',
        width: 100
    }, {
        key: 'fileCount',
        dataKey: 'FileCount',
        title: '文件数量',
        width: 100
    },
]
let searchResult = reactive([])
let resultCount = ref(0)
var mysql = require('mysql')
var connection = mysql.createConnection({
    host: fyIP,
    user: 'admin',
    password: 'admin',
    database: 'eVideoKTV'
})
const getBasicInfoDone = ref(false)
const searchDone = ref(0)
async function getBasicInfo() {
    const songLanguageSQL = 'SELECT * FROM `eVideoKTV`.`FY_SONGLANGUAGE`'
    const songTypeSQL = 'SELECT * FROM `eVideoKTV`.`FY_SONGTYPE`'
    const songVersionSQL = 'SELECT * FROM `eVideoKTV`.`FY_SONGVER'
    loading.value = true
    await connection.connect();
    await connection.query(songLanguageSQL, function (error, results) {
        if (error) return
        songLanguage = results
    })
    await connection.query(songTypeSQL, function (error, results) {
        if (error) return
        songType = results
    })
    await connection.query(songVersionSQL, function (error, results) {
        if (error) return
        songVersion = results
        getBasicInfoDone.value = true
        loading.value = false
    })

}
var finalSQL: string = '' // 最终经过处理后的 SQL 查询语句
async function submitSearch() {
    loading.value = true
    searchDone.value = 0
    var SQLs = {
        songID: `SongNO LIKE '%${form.songID}%'`,
        songName: `SongName LIKE '%${form.songName}%'`,
        singer: `SingerName LIKE '%${form.singer}%'`,
        songLanguage: `SongLanguageID1 = ${form.songLanguage}`,
        ranks: `Ranks <= ${form.ranks}`,
        songType: `SongTypeID1 = ${form.songType}`,
        VerID: `VerID = '${form.VerID}'`,
        isMark: `IsMark='${form.isMark}'`,
        isHide: `IsHide='${form.isHide}'`,
        fileCount: `FileCount${form.fileCount}0`
    }
    // BUG 已完成 遍历表单存在顺序问题，导致有时 AND 在 WHERE 前
    // 此时开始遍历表单，①将未填写的内容对应的 SQL 语句清空；②将第一条有效的SQL语句的前面添加 WHERE 条件；③将从第二条有效的 SQL 语句开始，语句的前面添加 'AND' 连接句
    Object.keys(form).forEach((key, index) => {
        if (form[key] != '' && finalSQL == '') {
            finalSQL = `WHERE ${SQLs[key]}`
        }
        else if (form[key] != '') finalSQL = finalSQL + ` AND ${SQLs[key]}`
        if (index == Object.keys(SQLs).length - 1) runSQl(finalSQL, '0,1000', true)
    })
}
async function runSQl(SQL: string, limit: string, origin: boolean) {
    console.log(`SELECT * FROM FY_SONGINFO ${SQL} ORDER BY SongNO LIMIT ${limit}`)
    if (origin) {
        await connection.query(`SELECT COUNT(*) FROM FY_SONGINFO ${SQL}`, function (error, results) {
            if (error) {
                ElMessage.error({ message: error, offset: 50 })
                loading.value = false
                return
            }
            resultCount.value = results[0]['COUNT(*)']
        })
    }
    await connection.query(`SELECT * FROM FY_SONGINFO ${SQL} ORDER BY SongNO LIMIT ${limit}`, function (error, results) {
        if (error) {
            ElMessage.error({ message: error, offset: 50 })
            loading.value = false
            return
        }
        searchResult = results
        // console.log(searchResult)
        handleSearchResults()
    })
}
// BUG 待处理 跳转到最后一页的时候偶发报错
function handleSearchResults() {
    searchResult.forEach((_res, index) => {
        var songLangID = searchResult[index]['SongLanguageID1']
        if (songLangID == -1) {
            (searchResult[index]['SongLanguageID1'] as string) = ''
        } else {
            (searchResult[index]['SongLanguageID1'] as string) = songLanguage[songLangID - 1]['LanguageName']
        }
        var songTypeID = searchResult[index]['SongTypeID1']
        if (songTypeID == -1) {
            (searchResult[index]['SongTypeID1'] as string) = ''
        } else {
            (searchResult[index]['SongTypeID1'] as string) = songType[songTypeID - 1]['TypeName']
        }
        var songVerID = searchResult[index]['VerID']
        if (songVerID == -1) {
            (searchResult[index]['VerID'] as string) = ''
        } else {
            (searchResult[index]['VerID'] as string) = songVersion[songVerID - 1]['TypeName']
        }
        switch (searchResult[index]['IsMark']) {
            case 0:
                (searchResult[index]['IsMark'] as string) = '✔️'
                break
            case 1: (searchResult[index]['IsMark'] as string) = '❌'
        }
        switch (searchResult[index]['IsHide']) {
            case 0:
                (searchResult[index]['IsHide'] as string) = '✔️'
                break
            case 1: (searchResult[index]['IsHide'] as string) = '❌'
        }
    })
    searchDone.value = 1
    loading.value = false
}
const currentPage = ref(1)
const handleCurrentChange = (page: number) => {
    searchDone.value = 0
    runSQl(finalSQL, `${(page - 1)*1000},1000`, false)
    currentPage.value = page
}
function clearForm() {
    Object.keys(form).forEach((key) => {
        form[key] = ''
    })
}
const tableHeight = computed(() => {
    return window.innerHeight - document.getElementById('searchForm')?.offsetHeight!
})
</script>
<style scoped>
.el-input {
    width: 130px;
}

.el-select {
    width: 130px;
}
</style>