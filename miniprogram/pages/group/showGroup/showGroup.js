// miniprogram/pages/group/showGroup/showGroup.js
const myApi = require('../../../utils/myApi')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupName: '',
    groupId: '',
    groupType: 'my',
    GroupsList: [],
    group: {},
    type: 'my',
    isStar: true
  },
  toFoodMap(){
    var stores = this.data.group.stores
    wx.navigateTo({
      url: '../../foodMap/foodMap',
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('getStores', {
          stores: stores
        })
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var groupId = options.groupId
    var type = options.type
    console.log(options)
    //type = 'my'
    /*     if (type == 'my') {
          GroupsList = wx.getStorageSync('My_GroupsList');
          var index = GroupsList.findIndex(item => {
            return item._id == groupId
          })
          group = GroupsList[index]
          for (let index = 0; index < group.stores.length; index++) {
           
            var id = group.stores[index].id+''
            console.log(id)
            if(starStoreIdList.indexOf(group.stores[index].id+'')!=-1){
              group.stores[index].isStar=true
            }else{
              group.stores[index].isStar=false
            }
            
          }
        } else {
          GroupsList = wx.getStorageSync('Joined_GroupsList');
        } */
    // console.log(group.stores)
    this.setData({
      groupId,
      type
    })


  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var GroupsList = []
    var group = []

    var starStoreIdList = wx.getStorageSync('starStoreIdList');
    if (this.data.type == 'MyGroup') {
      GroupsList = wx.getStorageSync('My_GroupsList');
    } else {
      GroupsList = wx.getStorageSync('Joined_GroupsList');
    }

    //根据groupId找到圈子
    var index = GroupsList.findIndex(item => {
      return item._id == this.data.groupId
    })
    group = GroupsList[index]

    //判断是否被收藏 
    for (let index = 0; index < group.stores.length; index++) {
      if (starStoreIdList.indexOf(group.stores[index].id + '') != -1) {
        group.stores[index].isStar = true
      } else {
        group.stores[index].isStar = false
      }
    }
    // console.log(group)
    this.setData({
      GroupsList,
      group,
    })
  },
  toAdd() {
    wx.navigateTo({
      url: '../../add/add?groupId=' + this.data.groupId + '&requestType=' + this.data.type
    });
  },
  toAddList() {
    wx.navigateTo({
      url: '../../list/list?groupId=' + this.data.groupId + '&friendsIndex=' + this.data.type
    });
  },
  toInfo(e) {
    var index = e.currentTarget.dataset.index
    var store = this.data.group.stores[index]
    var groupId = this.data.groupId
    var secretKey = this.data.group.secretKey
    wx.navigateTo({
      url: '../../info/info?friendsIndex=' + this.data.type,
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('getStore', {
          store: store,
          groupId:groupId,
          secretKey:secretKey
        })
      }
    });
  },
  deleteItem(e) {
    var index = e.currentTarget.dataset.index
    var groupId = this.data.groupId
    var group = this.data.group
    var that = this

    wx.showModal({
      title: '是否删除？',
      content: group.stores[index].name,
      showCancel: true,
      cancelText: '取消',
      cancelColor: '#000000',
      confirmText: '确定',
      confirmColor: '#3CC51F',
      success: (result) => {
        if (result.confirm) {
          group.stores.splice(index, 1)
          myApi.updateGroupsList(group.stores, 'stores', groupId)
          wx.showToast({
            title: '删除成功',
            duration: 800,
          });
          that.setData({
            group
          })
        }
      },
      fail: () => {},
      complete: () => {}
    });
    console.log(e)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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