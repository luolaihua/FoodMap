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
    openId: '',
    //海报画布--------------------------------
    canvasWidth: 400,
    canvasHeight: 650,
    showCanvasFlag: true,
    colorArr: [
      '#EE534F',
      '#FF7F50',
      '#FFC928',
      '#66BB6A',
      '#42A5F6',
      '#5C6BC0',
      '#AA47BC',
      '#EC407A',
      '#FFB6C1',
      '#FFA827'
    ],
    fontArr: ['italic', 'oblique', 'normal'],
    sizeArr: [12, 14, 16, 18, 20, 22, 24, 26, 28],
    QrCodeUrl: '../../images/QrCode.png',
    posterUrl: '',
    isShowPoster: false,

  },
  //TODO 店铺为空会报错
  shareItem(e) {
    var id = e.currentTarget.id
    var group = this.data.GroupsList[id]
    this.createPoster(group)
    //this.data.secretKey=group.secretKey
    //console.log(group.secretKey)
    this.setData({
      secretKey: group.secretKey
    })
  },
  copyShareCode() {
    wx.setClipboardData({
      data: this.data.secretKey,
    });
  },
  /**
   * 关闭保存海报图片的框
   */
  closePosterImage: function () {
    this.setData({
      isShowPoster: false,
    });
  },

  /**
   * 保存海报图片
   */
  savePosterImage: function () {
    var that = this;
    var filePath = that.data.posterUrl;
    wx.saveImageToPhotosAlbum({
      filePath: filePath,
      success: function (res) {
        wx.showToast({
          title: '保存图片成功！',
          icon: 'none',
          duration: 1000,
          mask: true,
        })
        that.closePosterImage()
      }
    })
  },
  /**
   * 生成海报
   */
  async createPoster(group) {
    wx.showLoading({
      title: '正在生成中',
    })
    var that = this;
    var textArr = []
    var shareCode = group.secretKey
    var storesArr = group.stores
    if (storesArr.length == 0) {
      textArr.push(group.nickName)
    } else {
      //生成海报文本内容
      storesArr.forEach(item => {
        textArr.push(item.name)
        console.log(item.keywords)
        if (item.keywords != "") {
          textArr = textArr.concat(item.keywords.split(','))
        }
      })
    }

    //生成二维码URL
    var posterImageUrl = await myApi.getQrCodeUrl(shareCode)
    // console.log(posterImageUrl)
    var QrCodeUrl = posterImageUrl.result
    if (QrCodeUrl == '') {
      QrCodeUrl = this.data.QrCodeUrl
      myApi.makePosterImageCanvas('shareCanvas', '我的美食圈子', textArr, that.data.colorArr, that.data.fontArr, that.data.sizeArr, 600, 20, 20, 40, that.data.canvasWidth, that.data.canvasHeight, 120, 400, QrCodeUrl);
    } else {
      wx.getImageInfo({
        src: posterImageUrl.result,
        success(res) {
          QrCodeUrl = res.path
          myApi.makePosterImageCanvas('shareCanvas', '我的美食圈子', textArr, that.data.colorArr, that.data.fontArr, that.data.sizeArr, 600, 20, 20, 40, that.data.canvasWidth, that.data.canvasHeight, 120, 400, QrCodeUrl);
        }
      })
    }
    // console.log(textArr)

    setTimeout(function () {
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: that.data.canvasWidth,
        height: that.data.canvasHeight,
        canvasId: 'shareCanvas',
        success: function (res) {
          console.log(res.tempFilePath);
          that.setData({
            showCanvasFlag: false,
            isShowPoster: true,
            posterUrl: res.tempFilePath,
          })
          wx.hideLoading();
        }
      })
    }, 2000)
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
  async confirmCode(e) {
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
    var GroupsList = wx.getStorageSync('Joined_GroupsList');
    //需要判断当前分享码是否已经存在列表中,先取出所有分享码
    var secretKeysFromList = []
    GroupsList.forEach(item => {
      secretKeysFromList.push(item.secretKey)
    })
    if (secretKeysFromList.indexOf(secretKey) != -1) {
      wx.showToast({
        title: '该美食圈子已存在',
        icon: 'none',
      });
      this.setData({
        secretKey: ''
      })
      return
    }
    //  console.log(secretKeysFromList)
    //  console.log(GroupsList)

    var info = await groupsList.where({
      secretKey: secretKey
    }).get()

    console.log('getShareData', info)

    if (info.data.length != 0) {
      //给群主发消息，有人加入
      var nickName = wx.getStorageSync('nickName')
      var thing3 = '填写分享秘钥加入'
      /**
       *  用户昵称{{thing1.DATA}}
          温馨提示{{thing2.DATA}}
          加入方式{{thing3.DATA}}
       */
      //判断是从二维码进入还是填写秘钥进入
      if (e == 'fromQrCode') {
        thing3 = '扫二维码加入'
      }
      var msgData = {
        openId: info.data[0]._openid,
        thing1: nickName,
        thing2: nickName + '已加入您的美食圈子-' + info.data[0].nickName,
        thing3: thing3,
      }
      myApi.sendMsg('newMemberToGroup', msgData)


      //如果数据存在,就存入圈子，把id添加入成员列表中
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
        isShowInputCode: false,
        TabCur: 1
      }, () => {
        wx.hideLoading();
        wx.showToast({
          title: '已成功加入',
        });
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
    var secretKey = options.secretKey
    if (secretKey != undefined || secretKey != '') {
      var that = this
      this.setData({
        secretKey
      }, () => {
        that.confirmCode('fromQrCode')
      })
    }
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