const app = getApp();
const db = wx.cloud.database()
const store = db.collection('store');
const userInfo = db.collection('userInfo');
const imgUrl = require('../../utils/imgUrl')
const myApi = require('../../utils/myApi')
//TODO 动态分享码 分享指定内容 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalName: '',
    defaultImage: imgUrl.head,
    numbers: 0,
    searchNum: 0,
    stores: [],
    storesArr: [],
    defaultSearchValue: '',
    condition: 'noData',
    shareCode: '',
    isDataFromOthers: '0',
    action: 'viewSelf',
    friendsIndex: 'self',
    shareIndexList: [],
    isShowModal: false,
    isInstantShare: false
  },
  shareItems() {
    const db = wx.cloud.database()
    var shareIndexList = this.data.shareIndexList
    var stores = this.data.storesArr
    var shareList = []
    for (let index = 0; index < shareIndexList.length; index++) {
      shareList.push(stores[shareIndexList[index]])
    }
    var instantShareCode = myApi.getRandomCode(8)
    db.collection('instantShare').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        instantShareCode: instantShareCode,
        createTime: myApi.formatTime(new Date()),
        stores: shareList,
        shareCount: 6
      },
      success: function (res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        console.log(res)
        wx.showModal({
          title: '即时美食分享码',
          content: instantShareCode,
          showCancel: true,
          cancelText: '取消',
          cancelColor: '#000000',
          confirmText: '确定',
          confirmColor: '#3CC51F',
          success: (result) => {
            if (result.confirm) {
              wx.setClipboardData({
                data: instantShareCode,
              });
            }
          },
        });
      },
      fail: console.error,
      complete: console.log
    })

    console.log(shareList)
  },
  chooseItem(e) {
    this.setData({
      shareIndexList: e.detail.value
    })
  },
  topItem: function (e) {
    var index = e.currentTarget.id
    var friendsIndex = this.data.friendsIndex
    var stores = this.data.stores
    stores = myApi.makeItemTop(stores, index)
    if (friendsIndex == 'self') {
      myApi.updateStore(stores)
    }
    this.setData({
      stores
    })
  },
  deleteItem: function (e) {
    var index = Number(e.currentTarget.id)
    var friendsIndex = this.data.friendsIndex
    var stores = this.data.stores
    var friendsList = wx.getStorageSync('friendsList');

    //如果是自身数据就更新到云端，如果是他人数据就更新本地
    //如果删除的条目为收藏的店铺，需要把店铺取消收藏
    var id = stores[index].id + ''
    var starStoreIdList = wx.getStorageSync("starStoreIdList")
    if (starStoreIdList != '') {
      var idIndex = starStoreIdList.indexOf(id)
      //如果要删除的店铺为收藏进来的，
      if (idIndex != -1) {
        //先把id列表的的id删除
        starStoreIdList.splice(idIndex, 1)
        wx.setStorageSync('starStoreIdList', starStoreIdList);
        //
      }
    }


    stores.splice(index, 1)
    if (friendsIndex == 'self') {
      myApi.updateStore(stores)
    } else {
      friendsList[friendsIndex].stores = stores
      wx.setStorageSync('friendsList', friendsList);
    }
    this.setData({
      stores
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //friendsIndex
    var friendsIndex = options.friendsIndex
    var storesArr = []

    //console.log(friendsIndex)
    if (friendsIndex == 'self') {
      storesArr = wx.getStorageSync('storesArr')
    } else {
      var friendsList = wx.getStorageSync('friendsList')
      storesArr = friendsList[friendsIndex].stores
      wx.setNavigationBarTitle({
        title: '好友的美食列表',
        success: (result) => {

        },
        fail: () => {},
        complete: () => {}
      });
    }

    this.setData({
      stores: storesArr,
      storesArr,
      defaultSearchValue: '',
      friendsIndex
    })
  },
  hideModal(e) {
    this.setData({
      isShowModal: false
    })
  },
  share() {
    this.setData({
      isShowModal: true
    })


  },
  instantShare() {
    this.setData({
      isShowModal: false,
      isInstantShare: true
    })
  },
  foreverShare() {
    this.setData({
      isShowModal: false,
      isInstantShare: false
    })
    var shareCode = wx.getStorageSync('shareCode')
    wx.showModal({
      title: '您的美食分享码',
      content: shareCode,
      showCancel: true,
      cancelText: '取消',
      cancelColor: '#000000',
      confirmText: '确定',
      confirmColor: '#3CC51F',
      success: (result) => {
        if (result.confirm) {
          wx.setClipboardData({
            data: shareCode,
          });
        }
      },
    });

  },
  backToMap() {
    wx.navigateBack({
      delta: 1
    });
  },
  toInfo(e) {
    var id = e.currentTarget.id
    console.log(this.data.friendsIndex)
    wx.navigateTo({
      url: '../info/info?id=' + id + '&friendsIndex=' + this.data.friendsIndex,
    });
  },

  clearSearch() {
    this.setData({
      stores: this.data.storesArr,
      defaultSearchValue: ''
    })
  },
  storeSearch: function (e) {
    var keywords = e.detail.value
    var storesArr = this.data.storesArr

    function search(obj) {
      var str = JSON.stringify(obj);
      return str.search(keywords) != -1
    }
    this.setData({
      stores: storesArr.filter(search)
    })
  },
  // ListTouch触摸开始
  ListTouchStart(e) {
    this.setData({
      ListTouchStart: e.touches[0].pageX
    })
  },

  // ListTouch计算方向
  ListTouchMove(e) {
    this.setData({
      ListTouchDirection: e.touches[0].pageX - this.data.ListTouchStart > 0 ? 'right' : 'left'
    })
  },

  // ListTouch计算滚动
  ListTouchEnd(e) {
    if (this.data.ListTouchDirection == 'left') {
      this.setData({
        modalName: e.currentTarget.dataset.target
      })
    } else {
      this.setData({
        modalName: null
      })
    }
    this.setData({
      ListTouchDirection: null
    })
  }
})