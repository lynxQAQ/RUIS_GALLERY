
const util = require("../../utils/util");
let fileData = require('../../utils/data.js');

const db = wx.cloud.database();
const _ = db.command;
const app = getApp();

Page({
  data: {
    userOpenid:'',

    transitionShown:false,

    coverImg:'',//封面图片
    coverSlogan:'',//封面标语
    coverSloganColor:'',//封面标语字体颜色

    applyShown:false,
    password:'',
  },

  goCategory:function(){
    wx.switchTab({
      url: '../category/category',
    })
  },

  //申请管理
  applyAdmin:function(){
    let openid = this.data.userOpenid
    let time = util.formatTime(new Date())
    let candidate = [openid,time]
    console.log(candidate)
    db.collection('Apply').doc("79550af260dd823b2360b1fc0728ef36").update({//doc要随数据库变化更改
      data:{adminApply:_.push([candidate])}
    }).then(res=>{
      console.log('申请成功')
      wx.showModal({
        title:'申请管理员',
        content:'申请成功',
      })
      var that = this
      that.setData({
        applyShown:false,
      })
    }).catch(res=>{
      console.log('申请失败',res)
    })

  },

  onApply:function(){
    this.setData({
      applyShown:true,
    })
  },

  closeApply:function(){
    this.setData({
      applyShown:false,
    })
  },

  passwordInput:function(e){
    console.log(e.detail)
    this.setData({
      password:e.detail,
    });
  },

  //申请管理

  onLoad: function() {

    // 缓入
    var that = this
    setTimeout(function () {
      that.setData({
        transitionShown:true,
      })
    },500)

    wx.cloud.callFunction({
      name: "login"
    }).then(res => {
      var that = this
      app.globalData.userOpenid = res.result.openid
      wx.setStorageSync('userOpenid', res.result.openid)
      console.log(app.globalData.userOpenid)
      that.setData({
        userOpenid:res.result.openid
      })
    }).catch(res => {
      console.log("fail", res)
    })

      //doc要随数据库变化更改
      db.collection('Apply').doc("79550af260dd823b2360b1fc0728ef36").get()
      .then(res=>{
        app.globalData.category = res.data.category
        app.globalData.imgShown = res.data.imgShown
      }).catch(res=>{
        console.log('拉取失败')
      })

      //doc要随数据库变化更改
      db.collection('coverpage').doc("b00064a760df3e2724778fb90f07b40c").get()
      .then(res=>{
        app.globalData.coverImg = res.data.coverImg
        app.globalData.coverSlogan = res.data.coverSlogan
        app.globalData.coverSloganColor = res.data.coverSloganColor
        console.log(app.globalData.coverSloganColor,app.globalData.coverSlogan)
        this.setData({
          coverImg:res.data.coverImg,
          coverSlogan:res.data.coverSlogan,
          coverSloganColor:res.data.coverSloganColor,
        })
      }).catch(res=>{
        console.log('拉取失败')
      })
    

    if(app.globalData.adminList.length==0){//doc要随数据库变化更改
      db.collection('Admin').doc("b00064a760dd81c2241c6b9d56cb1116").get()
      .then(res=>{
        console.log(res.data.adminList)
        app.globalData.adminList = res.data.adminList
        wx.setStorageSync('adminList', res.data.adminList)
      })
    }
    
  },

  onShareAppMessage:function(e){
    return {
      title: 'Welcome to RUIS',
      path: '/pages/index/index',
      imageUrl: "/images/logo/RUIS_logo.jpg",
      success: (res) => {
        console.log("转发成功", res);
      },
      fail: (res) => {
        console.log("转发失败", res);
      }
    }
  },

  // getUserProfile() {
  //   wx.getUserProfile({
  //     desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
  //     success: (res) => {
  //       this.setData({
  //         avatarUrl: res.userInfo.avatarUrl,
  //         userInfo: res.userInfo,
  //         hasUserInfo: true,
  //       })
  //     }
  //   })
  // },

})
