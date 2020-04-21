const app = getApp();
const db = wx.cloud.database()
const store = db.collection('store');
const userInfo = db.collection('userInfo');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalName: '',
    defaultImage: '../../images/share.jpg',
    numbers: 0,
    searchNum: 0,
    stores: [],
    defaultSearchValue: '',
    condition: 'noData',
    shareCode: '',
    isDataFromOthers: '0',
    action: 'viewSelf'
  },
  share() {
    var shareCode = wx.getStorageSync('shareCode')
    var isShowIntroduction = wx.getStorageSync('isShowIntroduction')
    /*     if(isShowIntroduction===''){
          isShowIntroduction=true
          wx.setStorageSync('isShowIntroduction', );
        } */
    if (isShowIntroduction === '') {
      wx.showModal({
        title: '提示',
        content: '长按地图界面 "查看美食" 按钮，输入美食分享码即可查看好友美食列表',
        showCancel: false,
        confirmText: '我知道啦',
        confirmColor: '#3CC51F',
        success: (result) => {
          if (result.confirm) {
            isShowIntroduction = false
            wx.setStorageSync('isShowIntroduction', false);
            wx.showModal({
              title: '美食分享码',
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
                    success: (result) => {},
                    fail: () => {},
                    complete: () => {}
                  });
                }
              },

            });
          }
        },
      });
    }
    if( isShowIntroduction === false){
          wx.showModal({
      title: '美食分享码',
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
            success: (result) => {},
            fail: () => {},
            complete: () => {}
          });
        }
      },
      fail: () => {},
      complete: () => {}
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
        isDataFromOthers: '1'
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
      url: '../info/info?id=' + id + '&isDataFromOthers=' + this.data.isDataFromOthers,
      success: (result) => {

      },
      fail: () => {},
      complete: () => {}
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var action = options.action
    var storesArr = wx.getStorageSync('storesArr')

    console.log(action)
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
  clearSearch() {
    var storesArr=[]
    if(this.data.action=='viewSelf'){
      storesArr  = wx.getStorageSync('storesArr') 
    }else{
      storesArr  = wx.getStorageSync('storesFromOthers') 
    }

    this.setData({
      stores: storesArr,
      defaultSearchValue: ''
    })
  },
  storeSearch: function (e) {
    var keywords = e.detail.value
    var storesArr=[]
    if(this.data.action=='viewSelf'){
      storesArr  = wx.getStorageSync('storesArr') 
    }else{
      storesArr  = wx.getStorageSync('storesFromOthers') 
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