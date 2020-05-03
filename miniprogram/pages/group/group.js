// miniprogram/pages/group/group.js
const myApi = require('../../utils/myApi')
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalName: '',
    TabCur: 0,
    tabList:['创建的美食圈子','加入的美食圈子'],
    My_GroupsList:[]
  },
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id-1)*60
    })
  },
  toCreateGroup(){
    wx.navigateTo({
      url: '../group/createGroup/createGroup',
    });
  },
  toShowGroup(e){
    var index = e.currentTarget.id
    var groupId = this.data.My_GroupsList[index]._id
    wx.navigateTo({
      url: '../group/showGroup/showGroup?type=my&groupId='+groupId,
    });
  },
    /**
   * item置顶---先不做
   */
/*   topItem: function (e) {
    var index = e.currentTarget.id
    var My_GroupsList = this.data.My_GroupsList
    My_GroupsList = myApi.makeItemTop(My_GroupsList, index)
    myApi.updateUserInfo(My_GroupsList,'My_GroupsList')
    this.setData({
      My_GroupsList
    })
  }, */
  /**
   * item删除
   */
  deleteItem: function (e) {
    var that = this
    const groupsList = db.collection('groupsList')
    wx.showModal({
      title: '是否删除',
      content: '删除后不可恢复，请确认',
      showCancel: true,
      cancelText: '取消',
      cancelColor: '#000000',
      confirmText: '确定',
      confirmColor: '#3CC51F',
      success: (result) => {
        if(result.confirm){
          var index =Number(e.currentTarget.id) 
          var My_GroupsList = that.data.My_GroupsList
          var id = My_GroupsList[index]._id
          My_GroupsList.splice(index, 1)
          wx.setStorageSync('My_GroupsList', My_GroupsList);
          groupsList.where({
            _id: id
          }).remove().then(res=>{
            console.log(res)
          })
          that.setData({
            My_GroupsList
          })
        }
      },
      fail: ()=>{},
      complete: ()=>{}
    });

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
    var My_GroupsList = wx.getStorageSync('My_GroupsList');
    var openId = wx.getStorageSync('openId')
    myApi.getGroupsList(openId)
    this.setData({
      My_GroupsList
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