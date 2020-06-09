// miniprogram/pages/welcome/welcome.js
const imgUrl = require('../../utils/imgUrl')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bgImgs: imgUrl.bgList,
    currentPage: 0
  },
  help() {
    var currentPage = this.data.currentPage
    var content = ''
    switch (currentPage) {
      case 0:
        content = '长按 \"饭碗\" 按钮1秒以上可以弹出 \"去哪吃\" 窗口哦~'
        break;
        case 1:
          content = '1.点击正上方的头像可以更换头像\n'+
                    '2.点击昵称旁按钮编辑昵称(限6字)'
          break;
  
      default:
        break;
    }
    wx.showModal({
      title: 'Tips',
      content: content,
      showCancel:false,
      confirmText: '我知道了',
      confirmColor: '#3CC51F',
      success: (result) => {
        if (result.confirm) {

        }
      },
      fail: () => {},
      complete: () => {}
    });
  },
  changePage(e) {
    //console.log(e)
    this.setData({
      currentPage: e.detail.current
    })
  },
  next() {
    this.setData({
      currentPage: this.data.currentPage + 1
    })
  },
  start() {
    wx.redirectTo({
      url: '../map/map'
    })
    //  wx.redirectTo({ url: '../index/index' })
  },
  skip() {
    wx.redirectTo({
      url: '../map/map'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

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

  }
})