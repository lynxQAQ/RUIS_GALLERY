

const util = require("../../utils/util");
let fileData = require('../../utils/data.js');

const db = wx.cloud.database();
const _ = db.command;
const app = getApp();

Page({

  data: {
    adminList:[],
    userOpenid:'',

    //数据库
    imgInfo_All:[],
    allowShown:false,//允许展示

    //搜索
    searching:false,//是否处于搜索
    search:'',//搜索关键字
    imgInfo_search:[],//搜索结果
  },

  // 删除
  deleteImage:function(e){
    let obj = e.currentTarget.dataset.obj
    console.log('删除图片',obj._id)

    // 云开发 云储存
    var that = this
    var picUrl = obj.ImgUrl;
    // var index = i;//获取当前长按图片下标
    // console.log(index)
    wx.showModal({
      title: '提示',
      content: '确定要删除此图片/图片集吗？',
      success: function (res) {
        if (res.confirm) {
          //console.log('确定删除图片');
          var picUrl_length = picUrl.length
          for(var i=0;i<picUrl.length;i++){
            console.log(picUrl)
            wx.cloud.deleteFile({//云储存删除图片
              fileList:[picUrl[i]]
            }).then(res=>{
              console.log('云储存删除图片成功',res)
              picUrl_length = picUrl_length - 1
              if(picUrl_length == 0){
                // 删除完成后
                // 云开发
                db.collection('Img').doc(obj._id).remove()
                .then(res=>{
                  console.log('删除成功')
                  wx.showToast({
                    title: '删除成功',
                  })
                }).catch(res=>{
                  console.log('删除失败')
                })
                // 云开发
                // 删除完成后
              }
            }).catch(res=>{
              console.log('云储存删除图片失败',res)
            })
          }

        } else if (res.cancel) {
          //console.log('取消删除图片');
          return false;
        }
      }
    })
    // 云开发 云储存
 

  },

  // 删除

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
      db.collection('Img').where(
        {
          contentTwo:db.RegExp({
            regexp:'.*' + searchcontentTwo,
            options:'i',
          })
        }
      ).orderBy("time", "desc").limit(12).get()
      .then(res=>{
        console.log('拉取成功',res)
        this.setData({
          imgInfo_search:res.data
        })
      }).catch(res=>{
        console.log('拉取失败',res)
      })
    }else{
      db.collection('Img').where({
        contentOne:db.RegExp({
          regexp:'.*' + search,
          options:'i',
        })
      }).orderBy("time", "desc").limit(12).get()
      .then(res=>{
        console.log('拉取成功',res)
        this.setData({
          imgInfo_search:res.data
        })

        // 云开发 作者搜索 接原数组
        var that = this
        db.collection('Img').where(
          {
            contentTwo:db.RegExp({
              regexp:'.*' + search,
              options:'i',
            })
          }
        ).orderBy("time", "desc").limit(12).get()
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
        // 云开发 作者搜索 接原数组

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
      let imgNum = that.data.imgInfo_All.length
      let oldImgInfo = that.data.imgInfo_All
      wx.showLoading({
        title: '正在获取',
      })

      if(imgNum<100){//限制最大数量
        db.collection('Img').skip(imgNum).limit(10).orderBy('time','desc').get()
        .then(res=>{
          console.log('拉取成功',res)
          let more = res.data
          let newImgInfo = oldImgInfo.concat(more)

          that.setData({
            imgInfo_All:newImgInfo,
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
          db.collection('Img').skip(imgNum).where(
            {
              contentTwo:db.RegExp({
                regexp:'.*' + searchcontentTwo,
                options:'i',
              })
            }
          ).orderBy("time", "desc").limit(10).get()
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
          db.collection('Img').skip(imgNum).where({
            contentOne:db.RegExp({
              regexp:'.*' + search,
              options:'i',
            })
          }).orderBy("time", "desc").limit(10).get()
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

            db.collection('Img').skip(imgNum).where(
              {
                contentTwo:db.RegExp({
                  regexp:'.*' + search,
                  options:'i',
                })
              }
            ).orderBy("time", "desc").limit(10).get()
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

    db.collection('Img').limit(12).orderBy('time','desc').get()
    .then(res=>{
      console.log('拉取成功',res)
      this.setData({
        imgInfo_All:res.data,
        allowShown:true,//允许展示
      })
    }).catch(res=>{
      console.log('拉取失败')
      wx.showModal({
        title: '获取失败',
        content: '请尝试重新进入小程序'
      })
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