const app = getApp();
const config = require('../../config.js');
const db = wx.cloud.database()
const userInfo = db.collection('userInfo');
const myApi = require('../../utils/myApi')
const imgUrl = require('../../utils/imgUrl')
//TODO 海报功能
//TODO 食堂美食推荐

Page({

  /**
   * 页面的初始数据
   */
  data: {
    setting: {
      skew: 0,
      rotate: 0,
      showLocation: true,
      showScale: true,
      subKey: '',
      layerStyle: -1,
      enableZoom: true,
      enableScroll: true,
      enableRotate: true,
      showCompass: false,
      enable3D: false,
      enableOverlooking: false,
      enableSatellite: false,
      enableTraffic: false,
    },
    longitude: 113.3245211,
    latitude: 23.10229,
    mapSubKey: config.mapSubKey,
    hideMe: true,
    showAdmin: false,
    isPopping: false,
    animMenu: {},
    animAddStore: {},
    animToList: {},
    animInput: {},
    animCloud: {},
    animAddFriends: {},
    isHideFunction: false,

  },
  tapMap(e) {
    // console.log(e)
    this.close();
    this.setData({
      isPopping: false
    })
  },
  //去添加页面
  toAdd(e) {
    this.close();
    this.setData({
      isPopping: false
    })
    wx.navigateTo({
      url: '../add/add',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    var that = this
    //TODO 引导分享 暂时不做
    /*     setTimeout(() => {
          this.setData({
            hideMe: true
          })
        }, 3000); */
    //decodeURIComponent() 函数可对 encodeURIComponent() 函数编码的 URI 进行解码。
    if (options.scene) {
      var scene = decodeURIComponent(options.scene);
      if (scene.length == 6 || scene.length == 8) {
        wx.showModal({
          title: '获取好友美食分享',
          content: '已获取好友美食分享码，是否查看？',
          showCancel: true,
          cancelText: '取消',
          cancelColor: '#000000',
          confirmText: '确定',
          confirmColor: '#3CC51F',
          success: (result) => {
            if (result.confirm) {
              wx.navigateTo({
                url: '../friends/friends?shareCode='+scene,
                success: (result)=>{
                  
                },
                fail: ()=>{},
                complete: ()=>{}
              });
            }
          },
          fail: () => {},
          complete: () => {}
        });
      }

    }

    this.setData({
      defaultScale: config.default_scale
    })
  },
  async initMap() {
    var that = this
    //初始化 定位
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      altitude: 'true',
      isHighAccuracy: 'true',
      success(res) {
        //console.log(res)
        const latitude = res.latitude
        const longitude = res.longitude
        that.setData({
          latitude,
          longitude
        })
      }
    })

    //获取openid,然后从云端获取该id的数据
    var openId = wx.getStorageSync('openID')
    var storesArr = []
    //如果id为空
    if (openId == '') {
      //初始化
      //TODO 用户信息上传，暂时只上传初始化时间
      var info = {
        time: myApi.formatTime(new Date())
      }
      var shareCode = myApi.getRandomCode(6)
      await wx.cloud.callFunction({
        name: "getUserOpenId",
        data: {
          action: 'initInfo',
          info: info,
          shareCode: shareCode
        }
      }).then(res => {
        console.log(res)
        if (res.result.memberInfos.data.length != 0) {
          //云端数据不为空，本地数据为空
          shareCode = res.result.memberInfos.data[0].shareCode
          storesArr = res.result.memberInfos.data[0].stores
        }
        wx.setStorageSync('shareCode', shareCode);
        wx.setStorageSync('openID', res.result.openId)
      })
    } else {
      //如果有id 从云端更新数据
      console.log(openId)
      var info = await userInfo.where({
        openId: openId
      }).get()
      console.log(info)
      if (info.data.length != 0) {
        storesArr = info.data[0].stores
        //wx.setStorageSync('shareCode', info.data[0].shareCode);
      }
    }
    wx.setStorageSync('storesArr', storesArr)
    console.log(storesArr)
    this.setData({
      stores: storesArr,
    })
  },

  onShow: function () {
    var that = this
    that.initMap()
    /*     db.collection('isOpenFun').doc('isOpen').get().then(res => {
          // res.data 包含该记录的数据
         // console.log('Hide Function ?',res.data.isHide)
          that.setData({
            isHideFunction:res.data.isHide
          })
          wx.setStorageSync('isHideFunction',res.data.isHide)
          if(res.data.isHide){
            userInfo.doc('34f394f55ea3852200005dbc525a2040').get().then(res=>{
             // console.log(res)
              var storesArr = res.data.stores
              wx.setStorageSync('storesArr', storesArr)
              //console.log(storesArr)
              that.setData({
                stores: storesArr,
              })
            })
          }else{
            that.initMap()
          }
        }) */

  },
  //点击查看美食
  toList: function () {
    this.close();
    this.setData({
      isPopping: false
    })
    wx.navigateTo({
      url: '../list/list?friendsIndex=self',
    })
  },
  //长按查看美食
  toFriends: function () {
    this.close();
    this.setData({
      isPopping: false
    })
    wx.navigateTo({
      url: '../friends/friends',
    })
  },
  //TODO 获取用户信息 暂时不用
  /*   getUserInfo: function (e) {

      if (e.detail.userInfo) {
        var info = e.detail.userInfo
        var userInfo = wx.getStorageSync('userInfo')
        if (userInfo == '' || userInfo == undefined) {
          wx.setStorageSync('userInfo', info)
          //console.log(info)
          wx.cloud.callFunction({
            name: "getUserOpenId",
            data: {
              action: 'initInfo',
              info: info
            }
          }).then(res => {
            console.log(res)
            app.globalData.openId = res.result.openId
            wx.setStorageSync('openID', res.result.openId)
          })
        }
        wx.navigateTo({
          url: '../add/add',
        })
      } else {
        // 处理未授权的场景
        wx.showModal({
          title: '授权失败',
          content: '您尚未授权获取您的用户信息，是否开启授权界面？',
          success: res => {
            if (res.confirm) {
              wx.openSetting({})
            }
          }
        })
      }


    }, */
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '我在' + config.appName + '上发现了好吃的，你也看看吧！',
      path: '/pages/map/map',
      imageUrl: imgUrl.share
    }
  },
  //点击地图maker
  onMarkerTap: function (event) {
    console.log(event)
    wx.navigateTo({
      url: '../info/info?id=' + event.markerId + '&friendsIndex=self',
    })
  },
  //获取openid
  /*   getOpenID: function (event) {
      wx.cloud.callFunction({
        name: "getUserOpenId"
      }).then(res => {
        wx.setClipboardData({
          data: res.result.openid,
          success: res => {
            wx.showToast({
              title: 'openID已复制',
            })
          }
        })
      })
    }, */
  hideMe: function (res) {
    this.setData({
      hideMe: true
    })
  },
  //点击弹出
  openMenu: function () {
    var isHideFunction = this.data.isHideFunction
    if (isHideFunction) {
      this.toList()
    } else {
      if (this.data.isPopping) {
        //缩回动画
        this.close();
        this.setData({
          isPopping: false
        })
      } else {
        //弹出动画
        this.pop();
        this.setData({
          isPopping: true
        })
      }
    }

  },

  //弹出动画
  pop: function () {
    //plus顺时针旋转
    var animMenu = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    var animAddStore = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    var animToList = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    var animationInput = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    var animationCloud = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    var animAddFriends = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    animMenu.rotateZ(180).step();
    animAddStore.translate(-85, -85).rotateZ(360).opacity(1).step();
    animToList.translate(-120, 0).rotateZ(360).opacity(1).step();
    animationInput.translate(120, 0).rotateZ(360).opacity(1).step();
    animationCloud.translate(85, -85).rotateZ(360).opacity(1).step();
    animAddFriends.translate(0, -120).rotateZ(360).opacity(1).step();
    this.setData({
      animMenu: animMenu.export(),
      animAddStore: animAddStore.export(),
      animToList: animToList.export(),
      animInput: animationInput.export(),
      animCloud: animationCloud.export(),
      animAddFriends: animAddFriends.export(),
    })
  },
  //收回动画
  close: function () {
    //plus逆时针旋转
    var animMenu = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    var animAddStore = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    var animToList = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    var animationInput = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    var animationCloud = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    var animAddFriends = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    animMenu.rotateZ(0).step();
    animAddStore.translate(0, 0).rotateZ(0).opacity(0).step();
    animToList.translate(0, 0).rotateZ(0).opacity(0).step();
    animationInput.translate(0, 0).rotateZ(0).opacity(0).step();
    animationCloud.translate(0, 0).rotateZ(0).opacity(0).step();
    animAddFriends.translate(0, 0).rotateZ(0).opacity(0).step();
    this.setData({
      animMenu: animMenu.export(),
      animAddStore: animAddStore.export(),
      animToList: animToList.export(),
      animInput: animationInput.export(),
      animCloud: animationCloud.export(),
      animAddFriends: animAddFriends.export(),
    })
  },

})