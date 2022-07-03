<template>
    <div>
        <div>
            <el-form :model="ruleForm" ref="ruleForm" label-width="300px" class="demo-ruleForm">
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
                        :auto-upload="false">
                    <i class="el-icon-upload"> </i>
                    <div class="el-upload_text">将视频文件拖到此处，或<em>点击上传</em></div>
                    <div slot="tip" class="el-upload_tip">只能上传一个视频文件</div>
                </el-upload>
                <el-form-item label="frame_rate(拆帧率)" prop="frame_rate">
                    <el-input v-model="ruleForm.frame_rate" placeholder="默认是30"></el-input>
                </el-form-item>
                <el-form-item label="stage_num(耗时共分为几个阶段)" prop="stage_num">
                    <el-input v-model="ruleForm.stage_num" placeholder="默认是1"></el-input>
                </el-form-item>
<!--                <el-form-item>-->
<!--&lt;!&ndash;                    <el-button type="primary" @click="submitForm1('ruleForm')">startRun</el-button>&ndash;&gt;-->
<!--                    -->
<!--                </el-form-item>-->
                <el-button type="primary" @click="submitForm">startRun</el-button>
            </el-form>
        </div>
    </div>
    <div>
        <div>
            <el-link type="primary">
                运行结果:
            </el-link>
        </div>
    </div>
    <div>
        <div>
            <el-row>
                <el-col>
                    <h3 class="grid-content bg-purple-dark">
                        查看任务具体拆帧情形
                    </h3>
                </el-col>
                <el-table :data="resultTable">
                    border
                    <el-table-column
                            prop="frame_num"
                            label="帧号"
                            width="100"
                            align="center"></el-table-column>
                    <el-table-column
                            label="图片"
                            width="200"
                            align="center">

                        <template v-slot:default="scope">
                            <el-image :src="scope.row.img_src" :preview-src-list="[scope.row.img_src]" fit="fill">

                            </el-image>
                        </template>
                    </el-table-column>
                </el-table>
                <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                               :current-page="queryInfo.pagenum" :page-sizes="[5,10,20,30]"
                               :page-size="queryInfo.pagesize" :total="total" layout="total,sizes,pager,jumper">

                </el-pagination>
            </el-row>
            <el-row>
                <el-col>
                    <h3 class="grid-content bg-purple-dark">
                        人工标注特征帧
                    </h3>
                </el-col>
                <el-row :gutter="20" class="margins">
                    <div>
                        <el-form ref="form" model="mainFormData">
                            <el-col :span="12" v-for="(item,index) in formItemList" :key="index">
                                <el-form-item :label="item.label">
                                    <el-input v-model="mainFormData[item.key]">
                                    </el-input>
                                </el-form-item>
                            </el-col>
                            <el-col>
                                <el-form-item>
                                    <el-button type="primary" @click="submitCalcPageLoadTimesForm('mainFormData')">
                                        计算页面加载耗时（包含各个阶段页面加载耗时和总的页面加载耗时，需点击此按钮才能得到下表中的数据）
                                    </el-button>
                                </el-form-item>
                            </el-col>
                        </el-form>
                    </div>
                </el-row>

                <el-row>
                    <el-table :data="basicInfo" border>
                        <el-table-column prop="scene_page_load_times" label="各个阶段页面加载耗时/ms">
                        </el-table-column>
                        <el-table-column prop="sum_page_load_times" label="总的页面加载耗时/ms">

                        </el-table-column>
                    </el-table>
                </el-row>
            </el-row>
        </div>
    </div>
</template>

<script>
    import axios from "axios";
    import {fetchData, fetchDebugVideoFrame} from "../api/index";
    export default {
        name: "VideoFrame",
        data() {
            return {
                start_run_pic_url: import.meta.env.VITE_APP_BASE_API + 'video/videoFrame',
                basicInfo: null,
                mainFormData: {},
                formItemList: [],
                ruleForm: {frame_rate: 30, stage_num: 1},
                queryInfo: {
                    query: '',
                    pagenum: 1,
                    pagesize: 10
                },
                total: 0,
                lim_Size:20,
                userList: [],
                job_id: -1,
                video_frame:[],
                dialogImageUrl: '',
                dialogVisible: false,
                disabled: false,
                loading: true,
                activityData: [],
                activityData1: [],
                resultTable: [],
                resultTable1: [],
                result: [],
                result1: [],
                fileList: [],
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
            handleSizeChange(newSize) {
                this.queryInfo.pagesize = newSize
                this.getPicsList()
            },
            handleCurrentChange(newPage) {
                this.queryInfo.pagenum = newPage
                this.getPicsList()
            },
            getPicsList() {
                let formData = new FormData()
                formData.append("job_id", this.job_id)
                formData.append("pagenum", this.queryInfo.pagenum)
                formData.append("pagesize", this.queryInfo.pagesize)
                axios.post(this.start_run_pic_url, formData).then((response) => {
                    console.log("response:" + response)
                    console.log("response.status:" + response.status)
                    this.activityData = res.frame_pics_data
                    this.tableHead = this.getCol(this.activityData)
                    this.resultTable = this.getTable(this.activityData)
                }).catch(error => {
                    this.$message({
                        message: '接口请求失败,具体信息为:' + error,
                        type: 'error'
                    })
                })
            },
            getCol(src) {
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
            getTable(src) {
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
                let fileList = this.$refs.upload.uploadFiles;
                let index = fileList.findIndex(fileItem => {
                    return fileItem.uid = file.uid
                })
                fileList.splice(index, 1)
            },
            handlePictureCardPreview(file) {
                this.dialogImageUrl = file.url;
                this.dialogVisible = true;
            },
            handleExceed() {
                this.$message({
                    message: "超出",
                    type: "warning"

                })
            },
            handleChange(file, fileList) {
                this.fileList = fileList;
            },
            submitForm : function (){

                console.log("this.ruleForm:"+JSON.stringify(this.ruleForm));
                console.log("this.fileList:" + this.fileList);
                if (this.fileList.length < 1) {
                    this.$message({
                        message: "还未上传视频文件,请上传,上传文件大小不能超过"+this.lim_Size+"M!",
                        type: 'warning'
                    })
                }
            else
                {
                    this.srcList=[]
                    const isLtM=this.fileList.every(file=>file.size/1024/1024<this.lim_Size)
                    if (!isLtM){
                        this.$message.error("请检查，上传文件大小不能超过"+lim_Size+"M!")
                    }else{
                        let formData=new FormData()
                        this.fileList.forEach(file=>{
                            formData.append("file",file.raw)
                            formData.append('pagenum',this.queryInfo.pagenum)
                            formData.append('pagesize',this.queryInfo.pagesize)
                            formData.append('frame_rate',this.ruleForm.frame_rate)
                            formData.append('stage_num',this.ruleForm.stage_num)
                        })
                        fetchDebugVideoFrame(formData).then((response) => {
                            console.log("response:" + JSON.stringify(response))
                            console.log("response.status:" + response.status)
                            response=response.data   //这里后续可以优化成一个统一的response处理器
                            this.activityData = response.video_frame
                            this.job_id=response.job_id
                            this.total=response.total
                            this.mainFormData=response.mainFormData
                            this.formItemList=response.formItemList
                            console.log("this.activityData:"+JSON.stringify(this.activityData))
                            this.result=this.getCol(this.activityData)
                            this.resultTable=this.getTable(this.activityData)
                        });
                        // axios.post(this.start_run_pic_url, formData).then((response) => {
                        //     console.log("response:" + JSON.stringify(response))
                        //     console.log("response.status:" + response.status)
                        //     response=response.data.data   //这里后续可以优化成一个统一的response处理器
                        //     this.activityData = response.video_frame
                        //     this.job_id=response.job_id
                        //     this.total=response.total
                        //     this.mainFormData=response.mainFormData
                        //     this.formItemList=response.formItemList
                        //     console.log("this.activityData:"+JSON.stringify(this.activityData))
                        //     this.result=this.getCol(this.activityData)
                        //     this.resultTable=this.getTable(this.activityData)
                        // })
                    }
                }

            },
        }
    }
</script>

<style scoped>

</style>