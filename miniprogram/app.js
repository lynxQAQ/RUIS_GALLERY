

App({
  onLaunch: function () {
    wx.cloud.init({
      env:"ruiscloud-6gy1gxhe754165d0",
      traceUser:true
    })

    const db = wx.cloud.database();
    const _ = db.command;

    this.globalData.adminList = wx.getStorageSync('adminList')
    console.log(this.globalData.adminList)

    if(this.globalData.adminList.length==0){
      db.collection('Admin').doc("b00064a760dd81c2241c6b9d56cb1116").get()
      .then(res=>{
        console.log(res.data.adminList)
        this.globalData = res.data.adminList
        wx.setStorageSync('adminList', res.data.adminList)
      })
    }

    
  },
  
  globalData:{
    userOpenid:'',

    category:[],//类别

    imgShown:{},//前端图片展示

    adminList:[],//管理员名单

    coverImg:'',//封面图
    coverSlogan:'',//封面标语
    coverSloganColor:'',//封面标语字体颜色
  }

})
