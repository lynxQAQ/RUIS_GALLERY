const util = require("../../utils/util");
let fileData = require('../../utils/data.js');

const db = wx.cloud.database();
const _ = db.command;
const app = getApp();

Page({

  data: {
    transitionShown:false,
    zeroCat:{},
    oneCat:{},
    twoCat:{},
    threeCat:{},
  },

  onLoad: function (options) {
    //加载
    let catShown = app.globalData.category
    // console.log(app.globalData)
    if(catShown.length == 0 || Object.keys(catShown).length==0){//doc要随数据库变化更改
      console.log('未拉取过分类图片')
      var that = this
      db.collection('Apply').doc("79550af260dd823b2360b1fc0728ef36").get()
      .then(res=>{
        console.log(res)
        app.globalData.category = res.data.category
        that.setData({
          zeroCat:res.data.category[0],
          oneCat:res.data.category[1],
          twoCat:res.data.category[2],
          threeCat:res.data.category[3],
        })
      }).catch(res=>{
        console.log('拉取失败')
      })
    }else{
      console.log('有内容')
      this.setData({
        zeroCat:catShown[0],
        oneCat:catShown[1],
        twoCat:catShown[2],
        threeCat:catShown[3],
      })
    }
    

    // 缓入
    var that = this
    setTimeout(function () {
      that.setData({
        transitionShown:true,
      })
    },500)

  },

  //跳转分类
  goCategory:function(e){
    let url = e.currentTarget.dataset.url
    console.log(url)
    wx.navigateTo({
      url: '../'+ url + '/' + url,
    })
  },

  onReady: function () {

  },

  onShow: function () {

  },


  onHide: function () {

  },


  onUnload: function () {

  },


  onPullDownRefresh: function () {

  },


  onReachBottom: function () {

  },


  // onShareAppMessage: function (e) {
  //   return {
  //     title: 'Welcome to RUIS',
  //     path: '/pages/index/index',
  //     success: (res) => {
  //       console.log("转发成功", res);
  //     },
  //     fail: (res) => {
  //       console.log("转发失败", res);
  //     }
  //   }
  // }
})