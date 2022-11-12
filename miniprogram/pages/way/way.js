const app = getApp();
const db = wx.cloud.database();
const util = require("../../utils/util");
let fileData = require('../../utils/data.js');

Page({

  data: {
    imgShown:{},

    adminList:[],
    userOpenid:'',
  },

  //放大预览图片
  previewImg:function(e){
    console.log(picUrl)
    var picUrl = [e.currentTarget.dataset.url]
    wx.previewImage({
      current:picUrl,
      urls: picUrl,
    })
  },
  //放大预览图片

  onLoad: function (options) {
    db.collection('Apply').doc('79550af260dd823b2360b1fc0728ef36').get()
    .then(res=>{
      // console.log(res.data.imgShown)
      this.setData({
        imgShown:res.data.imgShown
      })
    })

    let adminList = app.globalData.adminList

    this.setData({
      userOpenid:app.globalData.userOpenid,
    })
    console.log(this.data.userOpenid)

    if(adminList!==[]){
      db.collection('Admin').doc("b00064a760dd81c2241c6b9d56cb1116").get()
      .then(res=>{
        console.log(res.data.adminList)
        app.globalData.adminList = res.data.adminList
        wx.setStorageSync('adminList', res.data.adminList)

        var that = this
        that.setData({
          adminList:res.data.adminList,
          
        })
      }).catch(res=>{
        console.log('拉取失败')
      })
    }else{
      this.setData({
        adminList:app.globalData.adminList,
        userOpenid:app.globalData.userOpenid,
      })
      console.log(this.data.adminList,this.data.userOpenid)
    }

    // this.setData({
    //   imgShown:app.globalData.imgShown
    // })
    // console.log(this.data.imgShown)
  },

  // onShareAppMessage: function () {

  // },

  // 管理员通道
  goCover:function(){
    wx.navigateTo({
      url: '../../pages/covermodi/covermodi',
    })
  },

  goCat:function(){
    wx.navigateTo({
      url: '../../pages/catmodi/catmodi',
    })
  },
})