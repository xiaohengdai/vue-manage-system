<template>
    <div>

        <div style="display: flex">
            <div style="margin: 0 0 0 100px; flex-grow: 1">
                <el-upload
                        multiple
                        ref="upload"
                        drag
                        action=""
                        :limit=1
                        :on-exceed="handleExceed"
                        :file-list="fileList"
                        :on-change="handleChange"
                        :on-remove="handleRemove"
                        :on-preview="handlePictureCardPreview"
                        :auto-upload="false"
                        list-type="picture-card">
                    <!--          list-type="picture-card">--> <!--上传后的图片可以对其删除-->
                    <div class="el-upload__text">
                        将文件拖到此处，或
                        <em>点击上传</em>
                    </div>
                    <template #tip>
                        <div class="el-upload__tip">只能上传 1张jpg/png 文件</div>
                    </template>

                </el-upload>

                <el-button style="margin-down: 10px;" size="medium" type="warning" @click="startRun">start run</el-button>
<!--                <el-tag style="margin-down: 10px;" size="medium">将文件拖到此处，或<em>点击上传</em>,只能上传1张jpg/png文件</el-tag>-->
            </div>
        </div>


        <div style="display: flex">
            <div style="margin: 0 0 0 100px; flex-grow: 1">
                <el-link type="primary">识别结果：</el-link>  <!-- el-link:Link 文字链接 -->
            </div>
        </div>

        <div style="display: flex">
            <div style="margin: 0 0 0 100px; flex-grow: 1">
                <el-table
                        :data="resultTable"
                        border
                        style="width: 100%">
                    <el-table-column
                            :prop="item.prop"
                            :label="item.label"
                            v-for="(item,key) in result"
                            :key="key"
                            width="180">
                    </el-table-column>

                </el-table>
            </div>
        </div>

    </div>
</template>

<script>
    import axios from 'axios'
    export default {
        name: 'Cluster',
        data () {
            return {
                dialogImageUrl: '',
                dialogVisible: false,
                disabled: false,
                upload_pic_url: import.meta.env.VITE_APP_BASE_API + 'upload_pic',
                start_run_pic_url: import.meta.env.VITE_APP_BASE_API + 'img/cluster/start_run',
                get_video_url: import.meta.env.VITE_APP_BASE_API + 'video/get',
                loading: true,
                activityData: [], //查看活动数据
                resultTable: [],//表格数据
                result: [], //查看数据用于循环的数据
                fileList: [], // upload多文件数组
                step_active: 0,
                url: '',
                srcList: [],
                ssim: '',
                hist: '',
                psnr: '',
                feature_num: '',
                total_time_cost: '',
                algorithm_time_cost: ''
            }
        },
        methods: {
            getCol (src) {
                let col = []
                for (let j in src[0]) {
                    col.push({
                        prop: j,
                        label: j,
                    })
                }
                // }
                return col
            },
            getTable (src) {
                let table = []
                let col = []
                for (let i = 0; i < src.length; i++) {
                    let temp = {}
                    for (let j in src[i]) {
                        temp[j] = src[i][j].toString()//需转换成字符串，要不在表格中显示时坐标里的的逗号会被截断
                    }
                    table.push(temp)
                }
                return table
            },
            handleRemove(file) {
                console.log(file);
                // 1.获取将要删除图片的临时路径
                let fileList = this.$refs.upload.uploadFiles;
                // 2.从pics数组中，找到图片对应的索引值
                let index = fileList.findIndex( fileItem => {
                    return fileItem.uid === file.uid
                })
                // 3.调用splice方法，移除图片信息
                fileList.splice(index, 1);
            },
            handlePictureCardPreview(file) {
                this.dialogImageUrl = file.url;
                this.dialogVisible = true;
            },
            handleDownload(file) {
                console.log(file);
            },
            handleExceed(){
                this.$message({
                    message: '超出上传文件数量限制，目前只同时支持对一张图片进行ocr识别,可将已上传图片删除掉',
                    type: 'warning'
                })
            },
            handleChange (file, fileList) {
                this.fileList = fileList
            },
            // 开始对图片进行ocr识别
            startRun: function () {
                console.log("this.fileList:"+this.fileList);
                if (this.fileList.length < 1) {
                    this.$message({
                        message: '还未上传图片文件',
                        type: 'warning'
                    })
                } else {
                    this.srcList = [] // 计算结果归零
                    const isLt5M = this.fileList.every(file => file.size / 1024 / 1024 < 5)
                    if (!isLt5M) {
                        this.$message.error('请检查，上传文件大小不能超过5M!')
                    } else {
                        let formData = new FormData() // new formData对象
                        this.fileList.forEach(file => {
                            formData.append('file', file.raw)
                        })
                        axios.post(this.start_run_pic_url, formData).then((response) => {
                            console.log("response:"+response)
                            console.log("response.status:"+response.status)
                            if (response.status === 200) {
                                // this.form.pic_uuid = response.data.uuid
                                // this.form.pic1_name = response.data.pic1_name
                                this.code = response.data.code
                                console.log('response.data.data.data:'+response.data.data.data)
                                this.activityData = response.data.data.data
                                console.log('this.activityData:' + this.activityData)
                                console.log("this.activityData.length:"+this.activityData.length)
                                if (this.activityData.length===0){
                                    this.$message({
                                        message: '聚类识别接口请求成功',
                                        type: 'success'
                                    })
                                }else{  this.result = this.getCol(this.activityData)
                                    this.resultTable = this.getTable(this.activityData)
                                    console.log('this.resultTable:' + this.resultTable)
                                    this.$message({
                                        message: '聚类识别接口请求成功',
                                        type: 'success'
                                    })
                                }}
                        }).catch(error => {
                            this.$message({
                                message: '聚类识别失败,具体信息为:' + error,
                                type: 'error'
                            })
                        })
                    }
                }
            },
        }
    }
</script>
