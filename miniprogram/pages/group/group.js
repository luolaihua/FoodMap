// miniprogram/pages/group/group.js
const myApi = require('../../utils/myApi')
const db = wx.cloud.database()
const _ = db.command
const groupsList = db.collection('groupsList')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalName: '',
    TabCur: 0,
    tabList: ['创建的美食圈子', '加入的美食圈子'],
    GroupsList: [],
    isShowInputCode: false,
    secretKey: '',
    openId: ''
  },
  //TODO 通过二维码分享圈子+圈子设置，换头像名字
  inputCode(e) {
    this.setData({
      secretKey: e.detail.value
    })
  },
  cancel() {
    this.setData({
      isShowInputCode: false
    })
  },
  /**
   * 通过分享码先云端获取数据
   */
  async confirmCode() {
    var secretKey = this.data.secretKey
    //先判断分享码格式是否符合规范
    if (secretKey.length != 4) {
      wx.showToast({
        title: '分享码错误，请重新输入',
        icon: 'none',
      });
      return
    }

    wx.showLoading({
      title: '加载中',
    });
    var GroupsList = this.data.GroupsList
    //需要判断当前分享码是否已经存在列表中,先取出所有分享码
    var shareCodesFromList = []
    GroupsList.forEach(item => {
      shareCodesFromList.push(item.secretKey)
    })
    if (shareCodesFromList.indexOf(secretKey) != -1) {
      wx.showToast({
        title: '该美食圈子已存在',
        icon: 'none',
      });
      this.setData({
        secretKey: ''
      })
      return
    }
    //  console.log(shareCodesFromList)
    //  console.log(GroupsList)

    var info = await groupsList.where({
      secretKey: secretKey
    }).get()

    console.log('getShareData', info)
    //如果数据存在,就存入圈子，把id添加入成员列表中
    if (info.data.length != 0) {
      var nickName= wx.getStorageSync('nickName')
      /**
       *  用户昵称{{thing1.DATA}}
          温馨提示{{thing2.DATA}}
          加入方式{{thing3.DATA}}
       */
      var msgData = {
        openId : info.data[0]._openid,
        thing1: nickName,
        thing2: nickName+'已加入您的美食圈子-'+info.data[0].nickName,
        thing3: '填写分享秘钥加入',
      }
      myApi.sendMsg('newMemberToGroup',msgData)



      var openId = this.data.openId
      var id = info.data[0]._id
      GroupsList.push(info.data[0])
      groupsList.doc(id).update({
        data: {
          membersList: _.push([openId])
        }
      }).then(res => {
        myApi.getGroupsList(openId)
        console.log(res)
      })
      this.setData({
        GroupsList,
        isShowInputCode: false
      }, () => {
        wx.hideLoading();
      })
    } else {
      wx.showToast({
        title: '用户不存在',
        icon: 'none',
        success: (result) => {
          wx.hideLoading();
        }
      });
    }
    this.setData({
      shareCode: ''
    })
  },
  tabSelect(e) {
    myApi.getGroupsList(this.data.openId)
    wx.showLoading({
      title: '加载中',
    });
    var GroupsList = []
    var index = e.currentTarget.dataset.id
    var that = this
    setTimeout(() => {
      if (index == 1) {
        GroupsList = wx.getStorageSync('Joined_GroupsList');
      } else {
        GroupsList = wx.getStorageSync('My_GroupsList');
      }
      that.setData({
        GroupsList,
      }, () => {
        wx.hideLoading();
      })
    }, 300);

    this.setData({
      modalName: null,
      TabCur: index,
      scrollLeft: (index - 1) * 60
    })
  },
  toCreateGroup() {
    myApi.requestSendMsg('newMemberToGroup')
    if (this.data.TabCur == 0) {
      wx.navigateTo({
        url: '../group/createGroup/createGroup',
      });
    } else {
      this.setData({
        isShowInputCode: !this.data.isShowInputCode
      })
    }

  },
  toShowGroup(e) {
    var index = e.currentTarget.id
    var groupId = this.data.GroupsList[index]._id
    var TabCur = this.data.TabCur
    var type = TabCur == 0 ? 'MyGroup' : 'JoinedGroup'
    wx.navigateTo({
      url: '../group/showGroup/showGroup?groupId=' + groupId + '&type=' + type,
    });
  },

  /**
   * item删除
   */
  deleteItem: function (e) {
    var that = this

    var TabCur = this.data.TabCur
    var openId = wx.getStorageSync('openId')
    var content = TabCur == 0 ? "删除" : '退出'

    wx.showModal({
      title: "是否" + content,
      content: content + '后不可恢复，请确认',
      showCancel: true,
      cancelText: '取消',
      cancelColor: '#000000',
      confirmText: '确定',
      confirmColor: '#3CC51F',
      success: (result) => {
        if (result.confirm) {
          var index = Number(e.currentTarget.id)
          var GroupsList = that.data.GroupsList
          var id = GroupsList[index]._id
          GroupsList.splice(index, 1)
          if (TabCur == 0) {
            wx.setStorageSync('My_GroupsList', GroupsList);
            groupsList.where({
              _id: id
            }).remove().then(res => {
              console.log(res)
            })
          } else {
            groupsList.doc(id).update({
              data: {
                membersList: _.pull(openId)
              }
            }).then(res => {
              console.log(res)
            })
            wx.setStorageSync('Joined_GroupsList', GroupsList);
          }

          that.setData({
            GroupsList
          })
        }
      },
      fail: () => {},
      complete: () => {}
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
    var openId = wx.getStorageSync('openId')
    myApi.getGroupsList(openId)
    if (this.data.TabCur == 0) {
      var GroupsList = wx.getStorageSync('My_GroupsList');
    } else {
      var GroupsList = wx.getStorageSync('Joined_GroupsList');
    }

    this.setData({
      GroupsList,
      openId
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