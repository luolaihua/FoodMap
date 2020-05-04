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
    store_id: '',
    isStar: false
  },
  //TODO 收藏的店铺id列表也要放在云端
  //收藏好友的店铺功能
  async star() {
    var myStores = wx.getStorageSync("storesArr")
    var friendsList = wx.getStorageSync('friendsList');
    var store_id = this.data.store_id
    var friendsIndex = this.data.friendsIndex
    //当前显示的店铺
    var store = this.data.store
    var isStar = this.data.isStar
    //TODO 收藏时是否要更新其他表单,还是只更新收藏id列表
    /*     //当前朋友的店铺列表
        var storesArr = friendsList[friendsIndex].stores
        //获取当前商铺的下标
        var storeIndex = storesArr.findIndex(item => {
          return item.id == store_id
        }) */
    var starStoreIdList = wx.getStorageSync("starStoreIdList")
    //未收藏状态就收藏
    if (!isStar) {
      // 压入我的店铺
      myStores.push(store)
      //置零表示已收藏
      starStoreIdList.push(store_id)
      wx.showToast({
        title: '已收藏',
        icon: 'success',
      });
    } else {
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
    //wx.setStorageSync('starStoreIdList', starStoreIdList);
    //更新我的店铺
    myApi.updateUserInfo(myStores, 'stores')
    myApi.updateUserInfo(starStoreIdList, 'starStoreIdList')
    //更新朋友列表
    //friendsList[friendsIndex].stores[storeIndex] = store
    //myApi.updateUserInfo(friendsList, 'friendsList')
    //wx.setStorageSync('friendsList', friendsList);
    this.setData({
      isStar: !isStar
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
    var that = this
    var storesArr = wx.getStorageSync('storesArr')
    var friendsIndex = options.friendsIndex
    var store_id = options.id

    switch (friendsIndex) {
      case 'self':
        //根据id在店铺列表中找到指定的店铺
        var store = storesArr.find(item => {
          return item.id == store_id
        })
        break;
      case 'MyGroup':
        //My_GroupsList-->groupId-->group-->store_id-->store
        var groupId = options.groupId
        var My_GroupsList = wx.getStorageSync('My_GroupsList');
        //通过groupId找到是哪个圈子
        var index = My_GroupsList.findIndex(item => {
          return item._id == groupId
        })
        //获取这个圈子的所有店铺
        var group = My_GroupsList[index]
        storesArr = group.stores
        //根据id在店铺列表中找到指定的店铺
        var store = storesArr.find(item => {
          return item.id == store_id
        })
        break
      case 'JoinedGroup':
        //Joined_GroupsList-->groupId-->group-->store_id-->store
        var groupId = options.groupId
        var Joined_GroupsList = wx.getStorageSync('Joined_GroupsList');
        //通过groupId找到是哪个圈子
        var index = Joined_GroupsList.findIndex(item => {
          return item._id == groupId
        })
        //获取这个圈子的所有店铺
        var group = Joined_GroupsList[index]
        storesArr = group.stores
        //根据id在店铺列表中找到指定的店铺
        var store = storesArr.find(item => {
          return item.id == store_id
        })
        break

      default:
        //从好友列表过来的
        var friendsList = wx.getStorageSync('friendsList')
        //获取朋友的所有店铺
        storesArr = friendsList[friendsIndex].stores
        //根据id在店铺列表中找到指定的店铺
        var store = storesArr.find(item => {
          return item.id == store_id
        })
        break;
    }
    //判断在收藏店铺id列表中是否有当前店铺id存在
    //判断是否收藏了主要是看收藏id列表中是否存在此id
    that.isStar(store_id)


    // 切割逗号
    let keywords_array = store.keywords.split(',')
    this.setData({
      keywords_array,
      store: store,
      friendsIndex,
      store_id
    })

  },
  isStar(store_id) {
    //判断在收藏店铺id列表中是否有当前店铺id存在
    //判断是否收藏了主要是看收藏id列表中是否存在此id
    var starStoreIdList = wx.getStorageSync("starStoreIdList")
    var idIndex = starStoreIdList.indexOf(store_id + '')
    var isStar
    //如果存在,说明被收藏了
    if (idIndex == -1) {
      isStar = false
      console.log('未收藏')
    } else {
      isStar = true
      console.log('已收藏')
    }
    this.setData({
      isStar
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