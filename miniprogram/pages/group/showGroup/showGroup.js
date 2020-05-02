// miniprogram/pages/group/showGroup/showGroup.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupName:'',
    groupIndex:'0',
    groupType:'my',
    groupList :[],
    group:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var index  = options.index
    var type = options.type
    var groupList =[]
    index =0
    type = 'my'
    if(type=='my'){
       groupList = wx.getStorageSync('My_GroupsList');
    }else{
      groupList = wx.getStorageSync('Joined_GroupsList');
    }
   
    console.log(options)
    this.setData({
      groupList,
      groupIndex:index,
      group:groupList[index]
    })


  },
  toAdd(){
    wx.navigateTo({
      url: '../../add/add?requestType=MyGroup'
    });
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

  }
})