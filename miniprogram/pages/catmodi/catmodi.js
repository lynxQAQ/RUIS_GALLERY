const app = getApp();
const db = wx.cloud.database();
const util = require("../../utils/util");
let fileData = require('../../utils/data.js');


Page({

  data: {
    picUrl:[],//上传图片的路径
    cloudImg:{},//上传至云数据库临时对象
    //输入 CN
    newCNtitle:'',
    //输入 EN
    newENtitle:'',
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

  //作者名输入
  CNInput: function (e) {
    console.log(e.detail)
    this.setData({
      newCNtitle:e.detail,
    });
  },

  //作品名输入
  ENInput: function (e) {
    console.log(e.detail)
    this.setData({
      newENtitle:e.detail,
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


  //确认上传
  confirmUpload:function(){

    let newCNtitle = this.data.newCNtitle
    let newENtitle = this.data.newENtitle
    
    let selectedTags = this.data.selectedTags
    let catIndex = 0

    if(newCNtitle.length==0 || newENtitle.length==0){
      wx.showModal({
        title: '提交',
        content: '请输入中文及英文命名标题',
        showCancel:false
      })
    }else if(selectedTags.length==0){
      wx.showModal({
        title: '提交',
        content: '请选择要更改标题的分类',
        showCancel:false
      })
    }else{
      if(selectedTags[0]=='分类 1'){
        catIndex = 0
      }else if(selectedTags[0]=='分类 2'){
        catIndex = 1
      }else if(selectedTags[0]=='分类 3'){
        catIndex = 2
      }else if(selectedTags[0]=='分类 4'){
        catIndex = 3
      }
      console.log(catIndex)

      db.collection("Apply").doc('79550af260dd823b2360b1fc0728ef36').update({
        data: {
          ['category.'+[catIndex] + '.CNtitle']:newCNtitle,
          ['category.'+[catIndex] + '.ENtitle']:newENtitle,
        }
      }).then(res => {
        console.log(res)
        this.setData({
          newCNtitle:'',
          newENtitle:'',
          selectedTags:[],
          categoryTags:fileData.getCategoryTag(),
        })

        wx.showModal({
          title: '提交',
          content: '提交成功',
          showCancel:false,
        })
      })
    }
  },
  //确认上传

  //取消上传
  cancelUpload:function(){
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定要取消吗？',
      success: function (res) {
        if (res.confirm) {
          that.setData({
            newCNtitle:'',
            newENtitle:'',
            selectedTags:[],
            categoryTags:fileData.getCategoryTag(),
          })
        } else if (res.cancel) {
          //console.log('取消删除图片');
          return false;
        }
      }
    })
    //
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