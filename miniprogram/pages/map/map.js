const app = getApp();
const config = require('../../config.js');
const db = wx.cloud.database()
const userInfo = db.collection('userInfo');
const myApi = require('../../utils/myApi')
const imgUrl = require('../../utils/imgUrl')
//TODO 食堂美食推荐
//test
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
    defaultScale:16,
    longitude: 113.3245211,
    latitude: 23.10229,
    mapSubKey: config.mapSubKey,
    hideMe: true,
    isPopping: true,
    animMenu: {},
    animAddStore: {},
    animToList: {},
    animInput: {},
    animCloud: {},
    animAddFriends: {},
    isHideFunction: false,
    stores: []

  },
  tapMap(e) {
    // console.log(e)
    this.close();
    this.setData({
      isPopping: false
    })
  },
  //去五个功能页面
  toFunctionPages(e) {
    this.close();
    this.setData({
      isPopping: false
    })
    switch (e.currentTarget.id) {
      case 'toAdd':
        wx.navigateTo({
          url: '../add/add?requestType=Mine',
        })
        break;
      case 'toGroup':
        wx.navigateTo({
          url: '../group/group',
        })
        break;
      case 'toFriends':
        wx.navigateTo({
          url: '../friends/friends',
        })
        break;
      case 'toList':
        //点击查看美食
        wx.navigateTo({
          url: '../list/list?friendsIndex=self',
        })
        break;
      case 'toUerInfo':
        wx.navigateTo({
          url: '../userInfo/userInfo',
        })
        break;
      default:
        break;
    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
/*     wx.showToast({
      title: '' + options.test,
    }) */
    //this.initData()
    //TODO 引导分享 暂时不做
    /*     setTimeout(() => {
          this.setData({
            hideMe: true
          })
        }, 3000); */
    //decodeURIComponent() 函数可对 encodeURIComponent() 函数编码的 URI 进行解码。
    if (options.scene) {
      console.log(options.scene)
      var scene = decodeURIComponent(options.scene);
      //根据长度判断是哪个，6-永久，8-即时,4-圈子;  美食详情分享： Rc3Z8f-1588951560206-List
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
                url: '../friends/friends?shareCode=' + scene,
                success: (result) => {

                },
                fail: () => {},
                complete: () => {}
              });
            }
          },
          fail: () => {},
          complete: () => {}
        });
      }else if(scene.length == 4){
        wx.showModal({
          title: '加入好友美食圈子',
          content: '已获取好友美食圈子秘钥，是否加入？',
          showCancel: true,
          cancelText: '取消',
          cancelColor: '#000000',
          confirmText: '确定',
          confirmColor: '#3CC51F',
          success: (result) => {
            if (result.confirm) {
              wx.navigateTo({
                url: '../group/group?secretKey=' + scene,
                success: (result) => {

                },
                fail: () => {},
                complete: () => {}
              }); 
            }
          },
          fail: () => {},
          complete: () => {}
        });
      }else{
        var codeList = scene.split('-')
      console.log(codeList)

        var ID = codeList[0]
        var store_id = codeList[1]
        var action = codeList[2]
        wx.navigateTo({
          url: '/pages/info/info?ID=' + ID + '&store_id=' + store_id + '&action=' + action,
        });
      }

    }
    this.openMenu()
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
  },
  async initData() {
    var that = this
    //获取openid,然后从云端获取该id的数据
    var openId = wx.getStorageSync('openId')
    var storesArr = []
    var avatarUrl = imgUrl.defaultAvatar
    var nickName = '美食网友'+myApi.getRandomCode(2)
    var friendsList = []
    var My_GroupsList = []
    var starStoreIdList = []
    //如果id为空
    if (openId == '') {
      //初始化
      var info = {
        //TODO 没有设置默认头像和昵称
        nickName: nickName,
        avatarUrl: avatarUrl,
        createTime: myApi.formatTime(new Date())
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
        //console.log(res)
        if (res.result.memberInfos.data.length != 0) {
          //云端数据不为空，本地数据为空
          shareCode = res.result.memberInfos.data[0].shareCode
          storesArr = res.result.memberInfos.data[0].stores
          friendsList = res.result.memberInfos.data[0].friendsList
          starStoreIdList = res.result.memberInfos.data[0].starStoreIdList
          nickName = res.result.memberInfos.data[0].info.nickName
          avatarUrl = res.result.memberInfos.data[0].info.avatarUrl
        }
        myApi.getGroupsList(res.result.openId)
        wx.setStorageSync('openId', res.result.openId)
      })
    } else {
      //如果有id 从云端更新数据
      //console.log(openId)
      myApi.getGroupsList(openId)
      var info = await userInfo.where({
        openId: openId
      }).get()
      //console.log(info)
      if (info.data.length != 0) {
        storesArr = info.data[0].stores
        nickName = info.data[0].info.nickName
        avatarUrl = info.data[0].info.avatarUrl
        shareCode = info.data[0].shareCode
        friendsList = info.data[0].friendsList
        starStoreIdList = info.data[0].starStoreIdList
        //wx.setStorageSync('shareCode', info.data[0].shareCode);
      }
    }
    wx.setStorageSync('shareCode', shareCode);
    wx.setStorageSync('nickName', nickName);
    wx.setStorageSync('avatarUrl', avatarUrl);
    wx.setStorageSync('storesArr', storesArr)
    wx.setStorageSync('friendsList', friendsList)
    wx.setStorageSync('starStoreIdList', starStoreIdList)

    //console.log(storesArr)
    this.setData({
      stores: storesArr,
    })
  },

  onShow: function () {
    var that = this
    that.initMap()
    this.initData()
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
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '这个美食地图可以记录和分享美食，你也看看吧！',
      path: '/pages/map/map',
      imageUrl: imgUrl.share
    }
  },
  //点击地图maker
  onMarkerTap: function (event) {
    console.log(event)
    var storeId = event.markerId
    var stores = this.data.stores
    //根据id在店铺列表中找到指定的店铺
    var store = stores.find(item => {
      return item.id == storeId
    })

    wx.navigateTo({
      url: '../info/info?friendsIndex=self',
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('getStore', {
          store: store
        })
      }
    })
  },
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
    animAddStore.translate(-85, -85).opacity(1).step();
    animToList.translate(-120, 0).opacity(1).step();
    animationInput.translate(120, 0).opacity(1).step();
    animationCloud.translate(85, -85).opacity(1).step();
    animAddFriends.translate(0, -120).opacity(1).step();
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
    animAddStore.translate(0, 0).opacity(0).step();
    animToList.translate(0, 0).opacity(0).step();
    animationInput.translate(0, 0).opacity(0).step();
    animationCloud.translate(0, 0).opacity(0).step();
    animAddFriends.translate(0, 0).opacity(0).step();
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