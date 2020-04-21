const app = getApp();
const db = wx.cloud.database()
const store = db.collection('store');
const userInfo = db.collection('userInfo');
const imgUrl = require('../../utils/imgUrl')
const myApi = require('../../utils/myApi')

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
    defaultSearchValue: '',
    condition: 'noData',
    shareCode: '',
    isDataFromOthers: '0',
    action: 'viewSelf'
  },
  topItem:function(e){
    var index = e.currentTarget.id
    var action = this.data.action
    var stores = this.data.stores
    var item = stores.slice(index,index+1)[0]
    stores.splice(index,1)
    stores.unshift(item)
    if(action=='viewSelf'){
      myApi.updateStore(stores)
    }
    this.setData({
      stores
    })
  },
  deleteItem:function(e){
    var index = e.currentTarget.id
    var action = this.data.action
    var stores = this.data.stores
    stores.splice(index,1)
    if(action=='viewSelf'){
      myApi.updateStore(stores)
    }
    this.setData({
      stores
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var action = options.action
    var storesArr = wx.getStorageSync('storesArr')

    console.log(action)
    //TODO 以后做个列表单独放保存过的分享用户
    if (action == 'viewOthers') {
      var shareCodeFromOthers = wx.getStorageSync('shareCodeFromOthers')
      this.setData({
        condition: 'inputCode',
        shareCode: shareCodeFromOthers
      })
    } else {
      if (storesArr.length != 0) {
        this.setData({
          condition: 'showData'
        })
      }
    }

    this.setData({
      action,
      stores: storesArr,
      defaultSearchValue: ''
    })
  },
  share() {
    var shareCode = wx.getStorageSync('shareCode')
    var isShowIntroduction = wx.getStorageSync('isShowIntroduction')
    if (isShowIntroduction === '') {
      wx.showModal({
        title: '提示',
        content: '长按地图界面 "查看美食" 按钮，输入美食分享码即可查看好友美食列表',
        showCancel: false,
        confirmText: '我知道啦',
        confirmColor: '#3CC51F',
        success: (result) => {
          if (result.confirm) {
            wx.setStorageSync('isShowIntroduction', false);
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
          }
        },
      });
    }
    if (isShowIntroduction === false) {
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
    }
  },
  inputCode(e) {
    this.setData({
      shareCode: e.detail.value
    })
  },
  backToMap() {
    wx.navigateBack({
      delta: 1
    });
  },
  async confirmCode() {
    wx.showLoading({
      title:'加载中',
    });
    var shareCode = this.data.shareCode
    var info = await userInfo.where({
      shareCode: shareCode
    }).get()
    console.log(info)
    if (info.data.length != 0) {
      var storesArr = info.data[0].stores
      wx.setStorageSync('shareCodeFromOthers', shareCode);
      wx.setStorageSync('storesFromOthers', storesArr);
      wx.setNavigationBarTitle({
        title: '好友的美食列表',
      });
      this.setData({
        stores: storesArr,
        condition: 'showData',
      },()=>{
        wx.hideLoading();
      })
    } else {
      wx.showToast({
        title: '数据不存在',
        icon: 'none'
      });
    }
  },
  toInfo(e) {
    var id = e.currentTarget.id
    wx.navigateTo({
      url: '../info/info?id=' + id + '&action=' + this.data.action,
    });
  },

  clearSearch() {
    var storesArr = []
    if (this.data.action == 'viewSelf') {
      storesArr = wx.getStorageSync('storesArr')
    } else {
      storesArr = wx.getStorageSync('storesFromOthers')
    }

    this.setData({
      stores: storesArr,
      defaultSearchValue: ''
    })
  },
  storeSearch: function (e) {
    var keywords = e.detail.value
    var storesArr = []
    if (this.data.action == 'viewSelf') {
      storesArr = wx.getStorageSync('storesArr')
    } else {
      storesArr = wx.getStorageSync('storesFromOthers')
    }

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