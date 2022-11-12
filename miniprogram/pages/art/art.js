

const util = require("../../utils/util");
let fileData = require('../../utils/data.js');

const db = wx.cloud.database();
const _ = db.command;
const app = getApp();

Page({

  data: {
    imgInfo_Art:[],

    //搜索
    searching:false,//是否处于搜索
    search:'',//搜索关键字
    imgInfo_search:[],//搜索结果
  },

  //搜索
  searchInput:function(e){
    console.log(e.detail)
    this.setData({
      search:e.detail,
    })
  },

  confirmSearch:function(){
    let search = this.data.search
    this.setData({
      searching:true,
    })

    var firstString = search.substring(0,1)
    var stringLength = search.length
    var endString = stringLength+1
    console.log('关键词首位：',firstString)
    
    if(firstString=='#'){//搜作者
      var searchcontentTwo = search.substring(1,endString)
      db.collection('Img').where(_.and([
        {
          contentTwo:db.RegExp({
            regexp:'.*' + searchcontentTwo,
            options:'i',
          })
        },
        {
          category:_.eq(['分类 3'])
        }
      ])).orderBy("time", "desc").limit(12).get()
      .then(res=>{
        console.log('拉取成功',res)
        this.setData({
          imgInfo_search:res.data
        })
      }).catch(res=>{
        console.log('拉取失败',res)
      })
    }else{
      db.collection('Img').where(_.and([
        {
          contentOne:db.RegExp({
            regexp:'.*' + search,
            options:'i',
          })
        },
        {
          category:_.eq(['分类 3'])
        }
      ])).orderBy("time", "desc").limit(12).get()
      .then(res=>{
        console.log('拉取成功',res)
        this.setData({
          imgInfo_search:res.data
        })
        
        var that = this
        db.collection('Img').where(_.and([
          {
            contentTwo:db.RegExp({
              regexp:'.*' + search,
              options:'i',
            })
          },
          {
            category:_.eq(['分类 3'])
          }
        ])).orderBy("time", "desc").limit(10).get()
        .then(res=>{
          console.log('拉取成功',res)
          let oldimg = that.data.imgInfo_search
          let newimg = oldimg.concat(res.data)
          that.setData({
            imgInfo_search:newimg
          })
        }).catch(res=>{
          console.log('拉取失败',res)
        })
        
      }).catch(res=>{
        console.log('拉取失败',res)
      })
    }
  },

  exitSearch:function(){
    this.setData({
      searching:false,
      imgInfo_search:[],
      search:'',
    })
  },
  //搜索

  //放大预览图片
  previewImg:function(e){
    var picUrl = e.currentTarget.dataset.url
    wx.previewImage({
      current:picUrl[0],
      urls: picUrl,
    })
  },
  //放大预览图片

  //触底加载更多
  reachBottom:util.throttle(function(){
    let searching = this.data.searching
    var that = this

    if(!searching){
      //非搜索
      let imgNum = that.data.imgInfo_Art.length
      let oldImgInfo = that.data.imgInfo_Art
      wx.showLoading({
        title: '正在获取',
      })

      if(imgNum<100){//限制最大数量
        db.collection('Img').where({category:_.eq(['分类 3'])}).skip(imgNum).limit(10).orderBy('time','desc').get()
        .then(res=>{
          console.log('拉取成功',res)
          let more = res.data
          let newImgInfo = oldImgInfo.concat(more)

          that.setData({
            imgInfo_Art:newImgInfo,
          })

          wx.hideLoading({})

          //没有更多
          if(res.data.length==0){
            wx.showModal({
              title: '加载更多',
              content:'没有更多作品啦，敬请期待。',
              showCancel:false,
            })
          }
          //没有更多

        }).catch(res=>{
          console.log('拉取失败')
          wx.hideLoading({})
        })
      }
    }else if(searching){
      //搜索
      let search = that.data.search
      let imgNum = that.data.imgInfo_search.length
      let oldImgInfo = that.data.imgInfo_search
      wx.showLoading({
        title: '正在获取',
      })

      if(imgNum<100){//限制最大数量
        var firstString = search.substring(0,1)
        var stringLength = search.length
        var endString = stringLength+1
        console.log('关键词首位：',firstString)

        
        if(firstString=='#'){//搜作者
          var searchcontentTwo = search.substring(1,endString)
          db.collection('Img').skip(imgNum).where(_.and([
            {
              contentTwo:db.RegExp({
                regexp:'.*' + searchcontentTwo,
                options:'i',
              })
            },
            {
              category:_.eq(['分类 3'])
            }
          ])).orderBy("time", "desc").limit(10).get()
          .then(res=>{
            console.log('拉取成功',res)
            wx.hideLoading({})

            //没有更多
            if(res.data.length==0){
              wx.showModal({
                title: '加载更多',
                content:'没有更多作品啦，敬请期待。',
                showCancel:false,
              })
            }
            //没有更多

            let more = res.data
            let newImgInfo = oldImgInfo.concat(more)
            that.setData({
              imgInfo_search:newImgInfo
            })
          }).catch(res=>{
            console.log('拉取失败',res)
            wx.hideLoading({})
          })
        }else{
          db.collection('Img').skip(imgNum).where(_.and([
            {
              contentOne:db.RegExp({
                regexp:'.*' + search,
                options:'i',
              })
            },
            {
              category:_.eq(['分类 3'])
            }
          ])).orderBy("time", "desc").limit(10).get()
          .then(res=>{
            console.log('拉取成功',res)
            wx.hideLoading({})

            //没有更多
            if(res.data.length==0){
              wx.showModal({
                title: '加载更多',
                content:'没有更多作品啦，敬请期待。',
                showCancel:false,
              })
            }
            //没有更多

            let more = res.data
            let newImgInfo = oldImgInfo.concat(more)
            that.setData({
              imgInfo_search:newImgInfo
            })

            db.collection('Img').skip(imgNum).where(_.and([
              {
                contentTwo:db.RegExp({
                  regexp:'.*' + search,
                  options:'i',
                })
              },
              {
                category:_.eq(['分类 3'])
              }
            ])).orderBy("time", "desc").limit(10).get()
            .then(res=>{
              console.log('拉取成功',res)
              let oldimg = that.data.imgInfo_search
              let newimg = oldimg.concat(res.data)
              that.setData({
                imgInfo_search:newimg
              })
            }).catch(res=>{
              console.log('拉取失败',res)
            })

          }).catch(res=>{
            console.log('拉取失败',res)
            wx.hideLoading({})
          })
        }
      }
    }
    

  },600),

  //触底加载更多

  onLoad: function (options) {

    db.collection('Img').where({category:_.eq(['分类 3'])}).limit(12).orderBy('time','desc').get()
    .then(res=>{
      console.log('拉取成功',res)
      this.setData({
        imgInfo_Art:res.data
      })
    }).catch(res=>{
      console.log('拉取失败')
    })

  },

  // onReady: function () {

  // },

  // onShow: function () {

  // },

  // onHide: function () {

  // },

  // onUnload: function () {

  // },

  // onPullDownRefresh: function () {

  // },

  // onReachBottom: function () {

  // },

  // onShareAppMessage: function () {

  // },

  // 管理员通道
  goAdmin:function(){
    wx.navigateTo({
      url: '../../pages/upload/upload',
    })
  }
})