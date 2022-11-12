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
    picUrl:[],//上传图片的路径
    cloudImg:{},//上传至云数据库临时对象
    //输入
    nameOne:'',
    contentOne:'',
    nameTwo:'',
    contentTwo:'',
    //分类
    zeroCat:{},
    oneCat:{},
    twoCat:{},
    threeCat:{},
    //选择话题
    categoryTags: fileData.getCategoryTag(),
    selectedTags:[],//已选定的话题
    //上传时间
    date:'',
  },

  //输入

  //栏目1名字
  nameOneInput: function (e) {
    console.log(e.detail)
    this.setData({
      nameOne:e.detail,
    });
  },

  //栏目1内容
  contentOneInput: function (e) {
    console.log(e.detail)
    this.setData({
      contentOne:e.detail,
    });
  },

  //栏目2名字
  nameTwoInput: function (e) {
    console.log(e.detail)
    this.setData({
      nameTwo:e.detail,
    });
  },

  //栏目2内容
  contentTwoInput: function (e) {
    console.log(e.detail)
    this.setData({
      contentTwo:e.detail,
    });
  },

  //输入

  //分类选择
  // 选中话题 标签
  selectTags: function(e) {
    let selectedTags = this.data.selectedTags;
    let categoryTags = this.data.categoryTags;
    if (selectedTags.length >= 1) {
      wx.showToast({
        title: '已达到上限',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    let value = e.currentTarget.dataset.value;
    let index = e.currentTarget.dataset.index;

    selectedTags.push(value);
    categoryTags.splice(index,1);
    this.setData({
      categoryTags: categoryTags,
      selectedTags: selectedTags
    })
  },

  // 取消选中话题 标签
  unselectTags: function(e) {
    let value = e.currentTarget.dataset.value;
    let index = e.currentTarget.dataset.index;
    let selectedTags = this.data.selectedTags;
    let categoryTags = this.data.categoryTags;
    categoryTags.push(value);
    selectedTags.splice(index,1);
    this.setData({
      categoryTags: categoryTags,
      selectedTags: selectedTags
    });
  },
  //分类选择

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
    wx.chooseImage({
      count:9,
      success:res=>{
        console.log(res)
        filePath = res.tempFilePaths
        // console.log(filePath)
        var cloudfilePath = filePath
  
        for(var i=0,len=filePath.length;i<len;i++){
          var random = Math.floor(Math.random() * 10000 + 1)//随机数避免同时传图数据一样
          var cloudPathname = 'Img/'+ Date.now() +random + filePath[i].match(/\.[^.]+?$/)[0]
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
          console.log(picUrl[index])
          wx.cloud.deleteFile({//云储存删除图片
            fileList:[picUrl[index]]
          }).then(res=>{
            console.log('云储存删除图片成功',res)
          }).catch(res=>{
            console.log('云储存删除图片失败',res)
          })
          picUrl.splice(index, 1);
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
    console.log(this.data.cloudImg)
    var DATE = util.formatTime(new Date())
    this.setData({
      date: DATE
    })

    var cloudImgname = this.data.cloudImg.cloudImgname
    var cloudfilePath = this.data.cloudImg.cloudfilePath
    console.log(cloudImgname,cloudfilePath)

    let nameOne = this.data.nameOne
    let contentOne = this.data.contentOne
    let nameTwo = this.data.nameTwo
    let contentTwo = this.data.contentTwo

    let picUrl = this.data.picUrl
    let selectedTags = this.data.selectedTags

    if(nameOne.length==0){
      nameOne = 'Title'
    }

    if(nameTwo.length==0){
      nameTwo = 'Copyright'
    }

    if(contentOne.length==0){
      wx.showModal({
        title: '提交',
        content: '请输入栏目1内容',
        showCancel:false
      })
    }else if(contentTwo.length==0){
      wx.showModal({
        title: '提交',
        content: '请输入栏目2内容',
        showCancel:false
      })
    }else if(picUrl.length==0){
      wx.showModal({
        title: '提交',
        content: '请上传图片',
        showCancel:false
      })
    }else if(selectedTags.length==0){
      wx.showModal({
        title: '提交',
        content: '请选择分类',
        showCancel:false
      })
    }else{
      console.log(nameOne,nameTwo,contentOne,contentTwo)
      db.collection("Img").add({
        data: {
          nameOne:nameOne,//栏目1名
          contentOne:contentOne,//栏目1内容
          nameTwo:nameTwo,//栏目2名
          contentTwo:contentTwo,//栏目2内容
          category:selectedTags,//分类
          ImgUrl:picUrl,//图片
          time: this.data.date,//上传时间字符串
          date:Date.now(),//上传时间数字
        }
      }).then(res => {
        console.log(res)
        this.setData({
          nameOne:'',
          contentOne:'',
          nameTwo:'',
          contentTwo:'',
          selectedTags:[],
          categoryTags:fileData.getCategoryTag(),
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
            nameOne:'',
            contentOne:'',
            nameTwo:'',
            contentTwo:'',
            selectedTags:[],
            categoryTags:fileData.getCategoryTag(),
            picUrl:[]//图片清空
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

  onLoad: function () {

    //加载图片
    let catShown = []
    console.log(app.globalData)
    // console.log(img)
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
      this.setData({
        zeroCat:catShown[0],
        oneCat:catShown[1],
        twoCat:catShown[2],
        threeCat:catShown[3],
      })
    }
    
  },

})