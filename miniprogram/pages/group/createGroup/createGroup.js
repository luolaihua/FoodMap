// miniprogram/pages/group/createGroup/createGroup.js
const myApi = require('../../../utils/myApi')
const db = wx.cloud.database()
const groupsList = db.collection('groupsList');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: '',
    nickName: ''
  },
  changeAvatar: function () {
    wx.navigateTo({
      url: '../../imageEdit/imageEdit?action=editGroupAvatar',
    })
  },
  inputName(e) {
    this.setData({
      nickName: e.detail.value
    })
  },
  async createGroup() {
    var My_GroupsList = wx.getStorageSync('My_GroupsList');
    var nickName = this.data.nickName
    var isMsgSafe = await myApi.doMsgSecCheck(nickName)
    if (isMsgSafe) {
      var openId = wx.getStorageSync('openId');
      var groupAvatarUrl = wx.getStorageSync('groupAvatarUrl');
      var group = {
        nickName:nickName,
        groupAvatarUrl: groupAvatarUrl,
        createTime:myApi.formatTime(new Date),
        membersList:[openId],
        secretKey:myApi.getRandomCode(4),
        stores:[]  
      }
      groupsList.add({
        // data 字段表示需新增的 JSON 数据
        data: group
      })
      .then(res => {
        console.log(res)
      })
      .catch(console.error)
      My_GroupsList.push(group)
      wx.setStorageSync('My_GroupsList', My_GroupsList)
     //await myApi.updateUserInfo(My_GroupsList,'My_GroupsList')
     wx.navigateBack({
      complete: (res) => {
        wx.showToast({
          title: '创建成功',
        })
      },
     });

    } else {
      wx.showToast({
        title: '名称不符合安全规范，请重新输入',
        icon: 'none',
      });
    }
    console.log(isMsgSafe)

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
    var avatarUrl = wx.getStorageSync('groupAvatarUrl');
    this.setData({
      avatarUrl
    })
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