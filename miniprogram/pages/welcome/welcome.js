// miniprogram/pages/welcome/welcome.js
const imgUrl = require('../../utils/imgUrl')
const myApi = require('../../utils/myApi')
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
    myApi.help(currentPage) 
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
  onLoad: function (options) {

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
    wx.showToast({
      title: '点击左上角帮助按钮，可查看使用技巧',
      icon: 'none',
      image: '',
      duration: 3000,
      mask: false,
      success: (result)=>{
        
      },
      fail: ()=>{},
      complete: ()=>{}
    });
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