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
    isShowInputCode:false,
    defaultImage: imgUrl.head,
    modalName: '',

  },
  addFriends(){
    this.setData({
      isShowInputCode:!this.data.isShowInputCode
    })
  },
  cancel(){
    this.setData({
      isShowInputCode:false
    })
  },
  toList(e){
    wx.showLoading({
      title: '加载中',
      mask: true,
      success: (result)=>{
        
      },
      fail: ()=>{},
      complete: ()=>{}
    });
    var friendsIndex = e.currentTarget.id
    wx.navigateTo({
      url: '../list/list?friendsIndex='+friendsIndex,
      success: (result)=>{
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
    wx.showLoading({
      title: '加载中',
    });
    var shareCode = this.data.shareCode
    var friendsList = this.data.friendsList
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
        isShowInputCode:false
      }, () => {
        wx.hideLoading();
        wx.navigateTo({
          url: '../list/list?friendsIndex='+(friendsList.length-1),
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
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var friendsList = wx.getStorageSync('friendsList');
    if(friendsList==''){
      friendsList=[]
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