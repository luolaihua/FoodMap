const app = getApp();
const db = wx.cloud.database()
const store = db.collection('store');
const config = require('../../config.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardCur: 0,
    keywords_array:[]
  },
  //TODO 收藏好友的店铺功能
  //TODO 在地图上查看好友的美食地图
    // cardSwiper
    cardSwiper(e) {
      this.setData({
        cardCur: e.detail.current
      })
    },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var storesArr= wx.getStorageSync('storesArr')
    var friendsIndex = options.friendsIndex
    var id = options.id
    if(friendsIndex!='self'){
      var friendsList = wx.getStorageSync('friendsList')
      storesArr=friendsList[friendsIndex].stores
      console.log(friendsList)
      console.log(friendsIndex)
      console.log(storesArr)

    }
    var store =storesArr.find(item=>{
      return item.id==id
    }) 
      if (config.dynamic_title){
        wx.setNavigationBarTitle({
          title: store.name,
        });
      }
      // 切割逗号
      let keywords_array = store.keywords.split(',')
    //console.log(keywords_array)
      this.setData({
        keywords_array,
        store: store
      })

  },
  tapImage:function(e){
    wx.previewImage({
      urls: this.data.store.images,
      current: e.currentTarget.id
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let path = '/pages/info/info?id=' + this.data.store._id;
    let image = "/images/share.jpg";
    if (this.data.store.images[0]){
      wx.cloud.getTempFileURL({
        fileList: [this.data.store.images[0]],
        success: res =>{
          return {
            title: '我在' + config.appName + '上发现了好吃的，你也看看吧！',
            path: path,
            imageUrl: res.fileList[0].tempFileURL
          }
        },
        fail: error => {
          console.error("出现Bug了",error)
        }
      })
    }else{
      return {
        title: '我在' + config.appName + '上发现了好吃的，你也看看吧！',
        path: path,
        imageUrl: image
      }
    }
    
  },
  navigate:function(e){
    wx.openLocation({
      latitude: this.data.store.latitude,
      longitude: this.data.store.longitude,
      name: this.data.store.name,
      address: this.data.store.address
    })
  },

})