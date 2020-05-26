// miniprogram/pages/userInfo/userInfo.js
//获取实例
var app = getApp();
const myApi = require('../../utils/myApi')
const imgUrl = require('../../utils/imgUrl')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nickName: '',
    avatarUrl: '',
    shareCode: '',
    feedBackUrl: imgUrl.feedbackUrl,
    editUrl: imgUrl.bigWheel_edit,
    peopleUrl: imgUrl.human,
    touchUrl: imgUrl.touch,
    isVibrate_setting: false,
    openId: '',
    isEditName: false,
    dateSlogan: '',
    whereToEatList: [],
    defaultImg: imgUrl.share,
    isShowWhereToEat: false,
    storeData: {}
  },
  hideWhereToEat() {
    this.setData({
      isShowWhereToEat: false
    })
  },
  nextOne() {
    var whereToEatList = this.data.whereToEatList
    var randNum = Math.floor(Math.random() * whereToEatList.length)
    var storeData = whereToEatList[randNum]
    //console.log(storeData)
    this.setData({
      storeData
    })
  },
  chooseIt() {
    var storeData = this.data.storeData
    wx.navigateTo({
      url: '../info/info?friendsIndex=' + storeData.friendsIndex,
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('getStore', {
          store: storeData.store,
          groupId: storeData.groupId,
          secretKey: storeData.secretKey
        })
      }
    });
  },
  whereToEat() {

    var whereToEatList = this.data.whereToEatList
    if (whereToEatList.length == 0) {
      var My_GroupList = wx.getStorageSync('My_GroupsList');
      var Joined_GroupsList = wx.getStorageSync('Joined_GroupsList');
      var storesArr = wx.getStorageSync('storesArr');
      //从三个地方取店铺，
/*       My_GroupList.forEach(group => {
        group.stores.forEach(store => {
          var tempData = {}
          tempData.store = store
          tempData.groupId = group._id
          tempData.secretKey = group.secretKey
          tempData.friendsIndex = 'MyGroup'
          whereToEatList.push(tempData)
        });
      })
      Joined_GroupsList.forEach(group => {
        group.stores.forEach(store => {
          var tempData = {}
          tempData.store = store
          tempData.groupId = group._id
          tempData.secretKey = group.secretKey
          tempData.friendsIndex = 'JoinedGroup'
          whereToEatList.push(tempData)
        });
      }) */
      storesArr.forEach(store => {
        var tempData = {}
        tempData.store = store
        tempData.groupId = 'null'
        tempData.secretKey = 'null'
        tempData.friendsIndex = 'self'
        whereToEatList.push(tempData)
      });
      console.log(whereToEatList)
    }
    var randNum = Math.floor(Math.random() * whereToEatList.length)
    var storeData = whereToEatList[randNum]
    //console.log(storeData)
    this.setData({
      storeData,
      whereToEatList,
      isShowWhereToEat: true
    })
    /*     wx.navigateTo({
          url: '../info/info?friendsIndex=' + storeData.friendsIndex,
          success: function (res) {
            // 通过eventChannel向被打开页面传送数据
            res.eventChannel.emit('getStore', {
              store: storeData.store,
              groupId: storeData.groupId,
              secretKey: storeData.secretKey
            })
          }
        }); */
    /*     var newList = []
        //去除重复的店铺
        whereToEatList.forEach(store=>{
          var isPush = true
          newList.forEach(item=>{
            if(item.name==store.name){
              isPush =false
            }
          })
          if(isPush){
            newList.push(store)
          }
        })
        newList.sort(myApi.randomSort) */
    //模拟从群列表或者个人列表过来的状态



  },
  /**
   * 复制秘钥
   */
  copyCode() {
    wx.setClipboardData({
      data: this.data.shareCode,
      success: (result) => {

      },
      fail: () => {},
      complete: () => {}
    });
  },
  /**
   * 更新秘钥
   */
  refreshCode() {
    var newCode = myApi.getRandomCode(6)
    console.log(newCode)
    myApi.updateUserInfo(newCode, 'shareCode')
    this.setData({
      shareCode: newCode
    })
  },
  /**
   * 设置约饭口号
   */
  setSlogan(e) {
    var dateSlogan = e.detail.value
    wx.setStorageSync('dateSlogan', dateSlogan);
    this.setData({
      dateSlogan
    })
  },
  clearSlogan() {
    this.setData({
      dateSlogan: ''
    })
    wx.setStorageSync('dateSlogan', '');
  },
  changeAvatar: function () {
    wx.navigateTo({
      url: '../imageEdit/imageEdit',
    })
  },
  async stopEditName(e) {
    var nickName = e.detail.value
    wx.showLoading({
      title: '内容安全检测中',
      mask: true,
    });
    var res = await myApi.doMsgSecCheck(nickName)
    wx.hideLoading();
    if (res) {
      wx.showToast({
        title: '设置成功',
      });
      myApi.updateUserInfo(nickName, 'nickName')
      //wx.setStorageSync('nickName', nickName)
    } else {
      wx.showToast({
        title: '昵称不符合安全规范',
        icon: 'none',
      });
      nickName = ''
    }
    this.setData({
      nickName,
      isEditName: false
    })
  },
  editName() {
    this.setData({
      isEditName: true
    })
  },
  changeAvatar: function () {
    wx.navigateTo({
      url: '../imageEdit/imageEdit',
    })
  },
  switchChangeVibrate() {

    var isVibrate_setting = this.data.isVibrate_setting
    isVibrate_setting = isVibrate_setting ? false : true;
    wx.setStorageSync('isVibrate_setting', isVibrate_setting)
    app.globalData.isVibrate = isVibrate_setting
    this.setData({
      isVibrate_setting
    })
  },
  onGetUserInfo: function (e) {
    var that = this
    var nickName = e.detail.userInfo.nickName
    var avatarUrl = e.detail.userInfo.avatarUrl

    wx.showLoading({
      title: '加载中',
      mask: true,
    });
    //avatarUrl = 'https://6c75-luo-r5nle-1301210100.tcb.qcloud.la/%E4%B8%80%E8%B7%AF%E5%90%91%E8%A5%BF_bd%5B00-10-07%5D%5B20200408-115819131%5D.jpg?sign=ab6e6d6e9dd1b8195b2f4d3facd4b531&t=1586360917'
    //安全检测
    myApi.checkImgAndMsg(avatarUrl, nickName).then(res => {
      wx.hideLoading();
      //根据是否安全获取openId还是将openId置空
      // myApi.getOpenId(res)
      console.log(res)
      //如果是安全的，就存入
      if (res) {
        // wx.setStorageSync('nickName', nickName)
        // wx.setStorageSync('avatarUrl', avatarUrl)

      } else {
        wx.showModal({
          title: '内容安全检测',
          content: '您的用户名或头像存在安全问题，已为您设置成默认网名和头像',
          showCancel: false,
          confirmText: '我知道了',
          confirmColor: '#3CC51F',
          success: (result) => {
            if (result.confirm) {

            }
          },
          fail: () => {},
          complete: () => {}
        });
        nickName = '互联网冲浪选手'
        avatarUrl = 'https://6c75-luo-r5nle-1301210100.tcb.qcloud.la/images/f8.png?sign=631f4b204fb7014de0ff373a5f1a37a4&t=1586346749'
      }
      that.setData({
        nickName,
        avatarUrl
      })
      myApi.updateUserInfo(nickName, 'nickName')
      myApi.updateUserInfo(avatarUrl, 'avatarUrl')
    })

  },


  //订阅消息
  sendMessage: function () {
    wx.requestSubscribeMessage({
      tmplIds: ['v-91v-ZZU9IV2isP7r341HmKTRJ3GJehx_A6l8MxmGE'],
      success(res) {
        console.log(res)
        wx.cloud.callFunction({
          name: 'sendMessage',
          data: {
            thing1: '你好',
            number2: '999'
          }
        })

      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var dateSlogan = wx.getStorageSync('dateSlogan');
    var shareCode = wx.getStorageSync('shareCode');
    this.setData({
      dateSlogan,
      shareCode
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

    var nickName = wx.getStorageSync('nickName')
    var avatarUrl = wx.getStorageSync('avatarUrl')
    console.log(avatarUrl)
    var isVibrate_setting = wx.getStorageSync('isVibrate_setting')
    if (isVibrate_setting === '') {
      wx.setStorageSync('isVibrate_setting', false)
      isVibrate_setting = false
    }
    app.globalData.isVibrate = isVibrate_setting
    this.setData({
      isVibrate_setting,
      nickName,
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