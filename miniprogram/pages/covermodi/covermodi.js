const app = getApp();
const db = wx.cloud.database();
const util = require("../../utils/util");
let fileData = require('../../utils/data.js');

//上传图片
let picArr = []
let filePath = []
let cloudImgname = []

Page({

  data: {
    userOpenid:'',
    coverImg:'',
    coverSlogan:'',
    coverSloganColor:'',

    showNewImg:false,
    picUrl:[],
    newcoverSlogan:'',
    newcoverSloganColor:'',
    //
    picUrl:[],//上传图片的路径
    cloudImg:{},//上传至云数据库临时对象
    //输入 作者
    authorName:'',
    //输入 作品名
    titleName:'',
    //上传时间
    date:'',
  },

  //输入

  //slogan输入
  sloganInput: function (e) {
    console.log(e.detail)
    this.setData({
      newcoverSlogan:e.detail,
    });
  },

  //slogan颜色输入
  colorInput: function (e) {
    console.log(e.detail)
    this.setData({
      newcoverSloganColor:e.detail,
    });
  },

  //输入


  uploadAdmin:function(){
    db.collection('Admin').add({
      data:{
        adminList:[],
      }
    }).then(res=>{
      console.log('上传成功')
    }).catch(res=>{
      console.log('上传失败')
    })
  },

  uploadImg:function(){
    if(this.data.picUrl.length==0){
      wx.chooseImage({
        count:1,
        success:res=>{
          console.log(res)
          filePath = res.tempFilePaths
          // console.log(filePath)
          var cloudfilePath = filePath
    
          for(var i=0,len=filePath.length;i<len;i++){
            var random = Math.floor(Math.random() * 10000 + 1)//随机数避免同时传图数据一样
            var cloudPathname = 'Img_coverpage/'+ Date.now() +random + filePath[i].match(/\.[^.]+?$/)[0]
            var cloudfilePathi = cloudfilePath[i]
            cloudImgname.push(cloudPathname)
  
            wx.cloud.uploadFile({
              cloudPath:cloudPathname,
              filePath:cloudfilePathi,
            }).then(res=>{
              console.log(res)
              picArr.push(res.fileID)
  
              this.setData({
                picUrl:picArr,
              })
            })
          }
          // console.log(cloudImgname,cloudfilePath)//云函数所需的图片名字即临时路径
          this.setData({
            ['cloudImg.cloudImgname']:cloudImgname,
            ['cloudImg.cloudfilePath']:cloudfilePath,
          })
  
        }
      })
    }else{
      wx.showModal({
        title: '提交',
        content: '只能上传一张封面图',
        showCancel:false
      })
    }

  },

  //删除图片
  deleteImg:function(e){
    var that = this
    var picUrl = that.data.picUrl;
    var index = e.currentTarget.dataset.index;//获取当前长按图片下标
    console.log(index)
    wx.showModal({
      title: '提示',
      content: '确定要删除此图片吗？',
      success: function (res) {
        if (res.confirm) {
          //console.log('确定删除图片');
          console.log(picUrl[0])
          wx.cloud.deleteFile({//云储存删除图片
            fileList:[picUrl[0]]
          }).then(res=>{
            console.log('云储存删除图片成功',res)
          }).catch(res=>{
            console.log('云储存删除图片失败',res)
          })
          picUrl.splice(0, 1);
          that.setData({
            picUrl:picUrl
          })
        } else if (res.cancel) {
          //console.log('取消删除图片');
          return false;
        }
      }
    })
  },
  //删除图片

  //放大预览图片
  previewImg:function(e){
    var index = e.currentTarget.dataset.index
    var picUrl = this.data.picUrl
    wx.previewImage({
      current:picUrl[index],
      urls: picUrl,
    })
  },
  //放大预览图片

  //确认上传
  confirmUpload:function(){

    var cloudImgname = this.data.cloudImg.cloudImgname
    var cloudfilePath = this.data.cloudImg.cloudfilePath
    console.log(cloudImgname,cloudfilePath)

    let coverImg = this.data.coverImg
    let coverSlogan = this.data.coverSlogan
    let coverSloganColor = this.data.coverSloganColor

    let picUrl = this.data.picUrl
    let newcoverSlogan = this.data.newcoverSlogan
    let newcoverSloganColor = this.data.newcoverSloganColor

    if(picUrl.length==0){
      this.setData({
        picUrl:[coverImg]
      })
      picUrl = this.data.picUrl
    }

    if(newcoverSlogan.length==0){
      this.setData({
        newcoverSlogan:coverSlogan
      })
      newcoverSlogan = this.data.newcoverSlogan
    }

    if(newcoverSloganColor.length==0){
      this.setData({
        newcoverSloganColor:coverSloganColor
      })
      newcoverSloganColor = this.data.newcoverSloganColor
    }

    if(picUrl.length==0 && newcoverSlogan.length==0 && newcoverSloganColor.length==0){
      wx.showModal({
        title: '提交',
        content: '请更新任何一项信息',
        showCancel:false
      })
    }else{
      console.log(picUrl[0],newcoverSlogan,newcoverSloganColor)
      db.collection("coverpage").doc('b00064a760df3e2724778fb90f07b40c').update({//doc需调整
        data: {
          coverImg:picUrl[0],//图片
          coverSlogan:newcoverSlogan,
          coverSloganColor:newcoverSloganColor,
        }
      }).then(res => {
        console.log(res)
        this.setData({
          newcoverSlogan:'',
          newcoverSloganColor:'',
          picUrl:[]//图片清空
        })
        picArr = []
        filePath = []
        cloudImgname = []

        wx.showModal({
          title: '提交',
          content: '提交成功',
          showCancel:false,
        })
      })
    }
  },
  //确认上传

  //删除图片
  cancelUpload:function(){
    var that = this
    var picUrl = that.data.picUrl
    wx.showModal({
      title: '提示',
      content: '确定要取消吗？',
      success: function (res) {
        if (res.confirm) {
          

          for(var index = 0;index < picUrl.length; index++){
            wx.cloud.deleteFile({//云储存删除图片
              fileList:[picUrl[index]]
            }).then(res=>{
              console.log('云储存删除图片成功',res)
            }).catch(res=>{
              console.log('云储存删除图片失败',res)
            })
          }

          that.setData({
            newcoverSlogan:'',
            picUrl:[],
          })

          picArr = []
          filePath = []
          cloudImgname = []

        } else if (res.cancel) {
          //console.log('取消删除图片');
          return false;
        }
      }
    })
    // 删除图片
  },
  //取消上传

  onLoad: function (options) {

    console.log(app.globalData)
    this.setData({
      coverImg:app.globalData.coverImg,
      coverSlogan:app.globalData.coverSlogan,
      coverSloganColor:app.globalData.coverSloganColor,
    })
    
  },

})