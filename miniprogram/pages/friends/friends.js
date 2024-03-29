// miniprogram/pages/friends/friends.js
const db = wx.cloud.database()
const userInfo = db.collection('userInfo');
const instantShare = db.collection('instantShare')
const imgUrl = require('../../utils/imgUrl')
const myApi = require('../../utils/myApi')
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_bgImg: imgUrl.bar_bg2,
    friendsList: [],
    shareCode: '',
    isShowInputCode: false,
    defaultImage: imgUrl.head,
    modalName: '',
    isInstantShare: false,
    isBack: true

  },
  //从云端根据分享码再获取一遍数据
  async updateItem(e) {
    myApi.vibrate()
    wx.showLoading({
      title: '更新数据中',
      mask: true,
    });
    var index = e.currentTarget.id
    var friendsList = this.data.friendsList
    var storesLocal = friendsList[index].stores
    var shareCode = friendsList[index].shareCode
    try {
      var info = await userInfo.where({
        shareCode: shareCode
      }).get()
      // console.log(info)
      if (info.data.length != 0) {
        var storesCloud = info.data[0].stores
        friendsList[index].stores = storesCloud
        friendsList[index].avatarUrl = info.data[0].info.avatarUrl
        friendsList[index].nickName = info.data[0].info.nickName
       // console.log(friendsList)
        myApi.updateUserInfo(friendsList, 'friendsList')
        //wx.setStorageSync('friendsList', friendsList);
        this.setData({
          friendsList
        }, () => {
          wx.showToast({
            title: '更新成功',
          });
          setTimeout(() => {
             wx.navigateTo({
                url: '../list/list?friendsIndex=' + index,
              }); 
          }, 1000);
        })
      } else {
        wx.showToast({
          title: '更新失败，可能是好友已更换分享码',
          icon: 'none',
          image: '',
          duration: 1500,
          mask: false,
          success: (result) => {

          },
          fail: () => {},
          complete: () => {}
        });
      }

      /*       //需要一个收藏店铺id的列表。为的是防止更新数据的时候把收藏状态也初始化了
            var starStoreIdList = wx.getStorageSync("starStoreIdList")
            if (starStoreIdList != '') {
              for (let index = 0; index < storesCloud.length; index++) {
                //console.log(starStoreIdList.indexOf(storesCloud[index].id+''))
                //原始的id为number类型,存到starStoreIdList里面的是string类型，一开始indexOf不起作用，需要转换数据类型
                if (starStoreIdList.indexOf(storesCloud[index].id + '') != -1) {
                  storesCloud[index].thumbs_up = 0
                }
                // console.log(storesCloud)
                // console.log(storesLocal)
                friendsList[index].stores = storesCloud
                wx.setStorageSync('friendsList', friendsList);
                this.setData({
                  friendsList
                }, () => {
                  wx.navigateTo({
                    url: '../list/list?friendsIndex=' + index,
                  });
                })
              }
            } */
    } catch (e) {

    } finally {
      wx.hideLoading({
        complete: (res) => {},
      })
    }



  },
  topItem(e) {
    myApi.vibrate()
    var index = e.currentTarget.id
    var friendsList = this.data.friendsList
    friendsList = myApi.makeItemTop(friendsList, index)
    myApi.updateUserInfo(friendsList, 'friendsList')
    //wx.setStorageSync('friendsList', friendsList);
    this.setData({
      friendsList
    }, () => {
      wx.showToast({
        title: '置顶成功',
        icon: 'success',
      });
    })
  },
  deleteItem: function (e) {
    myApi.vibrate()
    var index = e.currentTarget.id
    var friendsList = this.data.friendsList
    friendsList.splice(index, 1)
    myApi.updateUserInfo(friendsList, 'friendsList')
    //wx.setStorageSync('friendsList', friendsList);
    this.setData({
      friendsList
    }, () => {
      wx.showToast({
        title: '删除成功',
        icon: 'success',
      });
    })
  },
  addFriends() {
    myApi.vibrate()
    this.setData({
      isShowInputCode: !this.data.isShowInputCode
    })
  },

  toList(e) {
    wx.showLoading({
      title: '加载中',
      mask: true,
    });
    var friendsIndex = e.currentTarget.id
    wx.navigateTo({
      url: '../list/list?friendsIndex=' + friendsIndex,
      success: (result) => {
        wx.hideLoading();
      },
    });
  },
  inputCode(e) {
    this.setData({
      shareCode: e.detail.value
    })
  },
  cancel() {
    myApi.vibrate()
    this.setData({
      isShowInputCode: false
    })
    if (this.data.friendsList.length == 0) {
      wx.navigateBack({
        delta: 1
      });
    }
  },
  /**
   * 通过分享码先云端获取数据
   */
  async confirmCode() {
    var shareCode = this.data.shareCode
    //先判断分享码格式是否符合规范,6位表示永久分享，8位是即时分享
    if (shareCode.length != 6 && shareCode.length != 8) {
      wx.showToast({
        title: '分享码错误，请重新输入',
        icon: 'none',
      });
      return
    }

    wx.showLoading({
      title: '加载中',
    });
    var friendsList = this.data.friendsList
    //需要判断当前分享码是否已经存在列表中,先取出所有分享码
    var shareCodesFromList = []
    friendsList.forEach(item => {
      shareCodesFromList.push(item.shareCode)
    })
    if (shareCodesFromList.indexOf(shareCode) != -1) {
      wx.showToast({
        title: '该美食好友已存在',
        icon: 'none',
      });
      this.setData({
        shareCode: ''
      })
      return
    }
    // console.log(shareCodesFromList)
    // console.log(friendsList)

    var isForever = true
    if (shareCode.length == 6) {
      //如果是永久分享
      var info = await userInfo.where({
        shareCode: shareCode
      }).get()
    } else {
      isForever = false
      //如果是即时分享，不存入好友列表
      var info = await instantShare.where({
        instantShareCode: shareCode
      }).get()
      //更新分享次数
      instantShare.where({
        instantShareCode: shareCode
      }).update({
        data: {
          shareCount: _.inc(-1)
        },
      }).then(res => {
        //删除分享次数为零的
        instantShare.where({
          shareCount: 0
        }).remove().then(result => {
          console.log(result)
        })
      })

    }
    wx.hideLoading();
    //console.log('getShareData', info)
    //如果数据存在,就存入朋友列表
    if (info.data.length != 0) {
      var nickName = wx.getStorageSync('nickName')
      /**
       *  邀请人{{name1.DATA}}
          邀请项目{{thing2.DATA}}
          时间{{date3.DATA}}
          状态{{thing4.DATA}}
          温馨提示{{thing5.DATA}
       */
      var msgData = {
        openId: isForever ? (info.data[0].openId) : (info.data[0]._openid),
        thing1: nickName,
        phrase2: isForever ? '永久分享' : '即时分享',
        time3: myApi.formatTime(new Date()),
      }
      //console.log(msgData)
      //发送订阅消息
      myApi.sendMsg('viewList', msgData)


      var storesArr = info.data[0].stores
      var nickName = info.data[0].info.nickName
      var avatarUrl = info.data[0].info.avatarUrl
      var friendInfo = {
        shareCode: shareCode,
        stores: storesArr,
        avatarUrl: avatarUrl,
        nickName: nickName
      }
      friendsList.push(friendInfo)
      myApi.updateUserInfo(friendsList, 'friendsList')
      //wx.setStorageSync('friendsList', friendsList);
      this.setData({
        friendsList,
        isShowInputCode: false
      }, () => {
        wx.hideLoading();
        wx.showModal({
          title: '获取美食店铺',
          content: '好友美食店铺已获取，是否查看',
          showCancel: true,
          cancelText: '取消',
          cancelColor: '#000000',
          confirmText: '确定',
          confirmColor: '#3CC51F',
          success: (result) => {
            if (result.confirm) {
              wx.navigateTo({
                url: '../list/list?friendsIndex=' + (friendsList.length - 1),
              });
            }
          },
        });
      })
    } else {
      wx.showToast({
        title: '用户不存在或者分享码已失效',
        icon: 'none',
        image: '',
        duration: 2000,
        mask: false,
        success: (result) => {

        }
      });
    }
    this.setData({
      shareCode: ''
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var friendsList = wx.getStorageSync('friendsList');
    //console.log(friendsList)
    if (friendsList == '') {
      friendsList = []
    }

    // var pages = getCurrentPages()
    // console.log(pages)
    //decodeURIComponent() 函数可对 encodeURIComponent() 函数编码的 URI 进行解码。
    if (options.shareCode) {
      var shareCode = options.shareCode
      //console.log(shareCode)
      this.setData({
        friendsList,
        shareCode
      }, () => {
        that.confirmCode()
      })
    } else {
      this.setData({
        friendsList
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
  onPullDownRefresh:async function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    wx.showToast({
      title: '到底啦~',
      icon: 'none',
    }); 
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
        modalName: e.currentTarget.dataset.target,
        ListTouchDirection: null
      })
    } else {
      this.setData({
        modalName: null,
        ListTouchDirection: null
      })
    }
/*     this.setData({
      ListTouchDirection: null
    }) */
  }
})