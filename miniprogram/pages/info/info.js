const app = getApp();
const db = wx.cloud.database()
const store = db.collection('store');
const config = require('../../config.js');
const myApi = require('../../utils/myApi')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardCur: 0,
    keywords_array: [],
    store: '',
    friendsIndex: 'self',
    thumbs_up: 1, //1表示未收藏，0表示已收藏
    store_id: ''
  },
  //收藏好友的店铺功能
  async star() {
    var myStores = wx.getStorageSync("storesArr")
    var friendsList = wx.getStorageSync('friendsList');
    var store_id = this.data.store_id
    var friendsIndex = this.data.friendsIndex
    //当前朋友的店铺列表
    var storesArr = friendsList[friendsIndex].stores
    //当前显示的店铺
    var store = this.data.store
    //获取当前商铺的下标
    var storeIndex = storesArr.findIndex(item => {
      return item.id == store_id
    })

    //需要一个收藏店铺id的列表。为的是防止更新数据的时候把收藏状态也初始化了
    var starStoreIdList = wx.getStorageSync("starStoreIdList")
    if (starStoreIdList == '') {
      starStoreIdList = []
    }
    //未收藏状态就收藏
    if (store.thumbs_up == 1) {
      // 压入我的店铺
      myStores.push(store)
      //置零表示已收藏
      store.thumbs_up = 0
      starStoreIdList.push(store_id)
      wx.showToast({
        title: '已收藏',
        icon: 'success',
      });
    } else {
      store.thumbs_up = 1

      //在我的店铺列表中找到当前收藏的店铺，删除
      var index = myStores.findIndex(item => {
        return item.id == store_id
      })
      myStores.splice(index, 1)
      starStoreIdList.splice(starStoreIdList.indexOf(store_id), 1)
      wx.showToast({
        title: '取消收藏',
        icon: 'success',
      });
    }

    //更新我的店铺
    myApi.updateStore(myStores)
    //更新朋友列表
    friendsList[friendsIndex].stores[storeIndex] = store
    wx.setStorageSync('friendsList', friendsList);
    //更新收藏id列表
    wx.setStorageSync('starStoreIdList', starStoreIdList);

    this.setData({
      store: store
    })
  },


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
    var storesArr = wx.getStorageSync('storesArr')
    var friendsIndex = options.friendsIndex
    var store_id = options.id
    if (friendsIndex != 'self') {
      var friendsList = wx.getStorageSync('friendsList')
      //获取朋友的所有店铺
      storesArr = friendsList[friendsIndex].stores
    }
    //根据id在店铺列表中找到指定的店铺
    var store = storesArr.find(item => {
      return item.id == store_id
    })
    if (friendsIndex != 'self') {
      //判断在收藏店铺id列表中是否有当前店铺id存在
      //判断是否收藏了主要是看收藏id列表中是否存在此id
      var starStoreIdList = wx.getStorageSync("starStoreIdList")
      var idIndex = starStoreIdList.indexOf(store_id + '')
      console.log(idIndex)
      //如果存在,说明被收藏了
      if (idIndex == -1) {
        store.thumbs_up = 1
      } else {
        store.thumbs_up = 0
      }
    }


    // 切割逗号
    let keywords_array = store.keywords.split(',')
    console.log(store.thumbs_up)
    this.setData({
      keywords_array,
      store: store,
      friendsIndex,
      store_id
    })

  },
  tapImage: function (e) {
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
    if (this.data.store.images[0]) {
      wx.cloud.getTempFileURL({
        fileList: [this.data.store.images[0]],
        success: res => {
          return {
            title: '我在' + config.appName + '上发现了好吃的，你也看看吧！',
            path: path,
            imageUrl: res.fileList[0].tempFileURL
          }
        },
        fail: error => {
          console.error("出现Bug了", error)
        }
      })
    } else {
      return {
        title: '我在' + config.appName + '上发现了好吃的，你也看看吧！',
        path: path,
        imageUrl: image
      }
    }

  },
  navigate: function (e) {
    wx.openLocation({
      latitude: this.data.store.latitude,
      longitude: this.data.store.longitude,
      name: this.data.store.name,
      address: this.data.store.address
    })
  },

})