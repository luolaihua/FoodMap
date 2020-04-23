// miniprogram/pages/friends/friends.js
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
    friendsList: [],
    shareCode: '',
    isShowInputCode: false,
    defaultImage: imgUrl.head,
    modalName: '',

  },
  //从云端根据分享码再获取一遍数据
  async updateItem(e) {
    wx.showLoading({
      title: '更新数据中',
      mask: true,
    });
    var index = e.currentTarget.id
    var friendsList = this.data.friendsList
    var shareCode = friendsList[index].shareCode
    var info = await userInfo.where({
      shareCode: shareCode
    }).get()
    friendsList[index].stores=info.data[0].stores
    wx.setStorageSync('friendsList', friendsList);
    this.setData({
      friendsList
    }, () => {
      wx.hideLoading();
      wx.navigateTo({
        url: '../list/list?friendsIndex=' + index,
      });
    })
  },
  topItem(e){
    var index = e.currentTarget.id
    var friendsList = this.data.friendsList
    friendsList = myApi.makeItemTop(friendsList,index)
    wx.setStorageSync('friendsList', friendsList);
    this.setData({
      friendsList
    },() => {
      wx.showToast({
        title: '置顶成功',
        icon: 'success',
      });
    })
  },
  deleteItem: function (e) {
    var index = e.currentTarget.id
    var friendsList = this.data.friendsList
    friendsList.splice(index, 1)
    wx.setStorageSync('friendsList', friendsList);
    this.setData({
      friendsList
    },() => {
      wx.showToast({
        title: '删除成功',
        icon: 'success',
      });
    })
  },
  addFriends() {
    this.setData({
      isShowInputCode: !this.data.isShowInputCode
    })
  },
  cancel() {
    this.setData({
      isShowInputCode: false
    })
    if (this.data.friendsList.length == 0) {
      wx.navigateBack({
        delta: 1
      });
    }
  },
  toList(e) {
    wx.showLoading({
      title: '加载中',
      mask: true,
    });
    var friendsIndex = e.currentTarget.id
    wx.navigateTo({
      url: '../list/list?friendsIndex=' + friendsIndex,
      success: (result) => {
        wx.hideLoading();
      },
    });
  },
  inputCode(e) {
    this.setData({
      shareCode: e.detail.value
    })
  },
  async confirmCode() {
    var shareCode = this.data.shareCode
    //先判断分享码格式是否符合规范
    if (shareCode.length != 6) {
      wx.showToast({
        title: '分享码错误，请重新输入',
        icon: 'none',
      });
      return
    }

    wx.showLoading({
      title: '加载中',
    });
    var friendsList = this.data.friendsList
    //需要判断当前分享码是否已经存在列表中,先取出所有分享码
    var shareCodesFromList = []
    friendsList.forEach(item => {
      shareCodesFromList.push(item.shareCode)
    })
    if (shareCodesFromList.indexOf(shareCode) != -1) {
      wx.showToast({
        title: '该美食好友已存在',
        icon: 'none',
      });
      this.setData({
        shareCode: ''
      })
      return
    }
    console.log(shareCodesFromList)
    console.log(friendsList)
    var info = await userInfo.where({
      shareCode: shareCode
    }).get()
    console.log(info)
    if (info.data.length != 0) {
      var storesArr = info.data[0].stores
      var friendInfo = {
        shareCode: shareCode,
        stores: storesArr
      }
      friendsList.push(friendInfo)
      wx.setStorageSync('friendsList', friendsList);
      this.setData({
        friendsList,
        isShowInputCode: false
      }, () => {
        wx.hideLoading();
        wx.navigateTo({
          url: '../list/list?friendsIndex=' + (friendsList.length - 1),
        });
      })
    } else {
      wx.showToast({
        title: '用户不存在',
        icon: 'none',
        image: '',
        duration: 1500,
        mask: false,
        success: (result) => {
          wx.hideLoading();
        }
      });
    }
    this.setData({
      shareCode:''
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var friendsList = wx.getStorageSync('friendsList');
    if (friendsList == '') {
      friendsList = []
    }
    this.setData({
      friendsList
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

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