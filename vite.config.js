import vue from '@vitejs/plugin-vue'

export default {
    base: './',
    plugins: [vue()],
    optimizeDeps: {
        include: ['schart.js']
    },
    // server:{
    //     host:'0,0,0,0' ,
    //     port:4001,
    //     fs:{strict:true}
    // }
    // proxy:{
    //     '/api':{
    //         target:'http://localhost:8000/',
    //         changeOrigin:true,
    //         secure:false,
    //         rewrite:path=>path.replace(/^\/api/,'api')
    //     }
    // }

}