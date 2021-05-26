const app = getApp();
const config = require('../../config.js');
const db = wx.cloud.database()
const userInfo = db.collection('userInfo');
const myApi = require('../../utils/myApi')
const imgUrl = require('../../utils/imgUrl')
//TODO 食堂美食推荐
//27.31815,115.44189,27.321657819648347,115.44098877777101
//var d =  myApi.getDistance(27.31815,115.44189,27.321657819648347,115.44098877777101)
//console.log(d)
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isBlackStyle: false,
    isShowWelcome: false,
    bgImgs: imgUrl.bgList,
    currentPage: 0,
    isTesting: false,
    Tester: '',
    isHideMap: false,
    defaultImg: imgUrl.bar_bg20,
    defaultImg2: '../../images/title.png',
    setting: {
      skew: 0,
      rotate: 0,
      showLocation: true,
      showScale: true,
      subKey: config.mapSubKey,
      layerStyle: -1,
      enableZoom: true,
      enableScroll: true,
      enableRotate: true,
      showCompass: true,
      enable3D: true,
      enableOverlooking: true,
      enableSatellite: false,
      enableTraffic: false,
    },
    scale: 16,
    longitude: 113.3245211,
    latitude: 23.10229,
    mapSubKey: config.mapSubKey,
    hideMe: true,
    isPopping: false,
    animMenu: {},
    animToGroup: {},
    animToUerInfo: {},
    animToList: {},
    animToAdd: {},
    animAddFriends: {},
    stores: [],
    //去哪吃
    whereToEatList: [],
    defaultFoodImg: imgUrl.share,
    isShowWhereToEat: false,
    storeData: {},
    randNum: 0
  },
  //去哪吃功能函数
  hideWhereToEat() {
    myApi.vibrate()
    this.setData({
      isShowWhereToEat: false
    })
  },
  nextOne() {
    myApi.vibrate()
    var whereToEatList = this.data.whereToEatList
    var randNum = Math.floor(Math.random() * whereToEatList.length)
    var storeData = whereToEatList[randNum]
    //console.log(storeData)
    this.setData({
      storeData
    })
  },
  chooseIt() {
    myApi.vibrate()
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
    this.setData({
      isShowWhereToEat: false
    })
  },
  whereToEat() {
    wx.vibrateShort()
    var whereToEatList = this.data.whereToEatList
    if (whereToEatList.length == 0) {
      var My_GroupList = wx.getStorageSync('My_GroupsList');
      var Joined_GroupsList = wx.getStorageSync('Joined_GroupsList');
      var storesArr = wx.getStorageSync('storesArr');
      //从三个地方取店铺，
      My_GroupList.forEach(group => {
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
      })
      storesArr.forEach(store => {
        var tempData = {}
        tempData.store = store
        tempData.groupId = 'null'
        tempData.secretKey = 'null'
        tempData.friendsIndex = 'self'
        whereToEatList.push(tempData)
      });
      // console.log(whereToEatList)
      if (whereToEatList.length == 0) {
        wx.showToast({
          title: '您还没有添加店铺或者加入美食圈呢',
          icon: 'none'
        });
        return
      }
    }
    var randNum = Math.floor(Math.random() * whereToEatList.length)
    //不重复抽取
    if (randNum == this.data.randNum) {
      randNum = Math.floor(Math.random() * whereToEatList.length)
    }
    var storeData = whereToEatList[randNum]
   // console.log(storeData)
    this.setData({
      randNum,
      storeData,
      whereToEatList,
      isShowWhereToEat: true
    })
  },
  previewFoodImg(){
    var storeData = this.data.storeData
   var foodImg =  storeData.store.images.length==0?this.data.defaultFoodImg:storeData.store.images[0]
   wx.previewImage({
    urls: [foodImg],
  });
  },
  // 控制地图缩放级别
  onIncreaseScale() {
    wx.vibrateShort();
    let scale = this.data.scale;
    // console.log(scale)
    if (scale == 20) {
      wx.showToast({
        title: '已是最大级别',
        icon: 'none',
      });
      return;
    }
    scale++;
    this.setData({
      scale: scale
    });
  },
  onDecreaseScale() {
    wx.vibrateShort();
    let scale = this.data.scale;
    // console.log(scale)
    if (scale == 3) {
      wx.showToast({
        title: '已是最小级别',
        icon: 'none',
      });
      return;
    } else {
      scale--;
      this.setData({
        scale: scale
      });
    }
  },
  onLocate() {
    wx.vibrateShort();
    this.initMap(16)
  },
  /**
   * 欢迎页
   * @param {*} e 
   */
  changePage(e) {
    //console.log(e)
    this.setData({
      currentPage: e.detail.current
    })
  },
  next() {
    this.setData({
      currentPage: this.data.currentPage + 1
    })
  },
  start() {
    this.setData({
      isShowWelcome: false
    })
    /*     wx.navigateTo({
          url: '../map/map'
        }) */
    //  wx.redirectTo({ url: '../index/index' })
  },
  skip() {
    this.start()
  },
  help() {
    var currentPage = this.data.currentPage
    myApi.help(currentPage) 
  },
  showMap(e) {
    var isHideMap = e.detail.value
    if (!isHideMap) {
      this.close();
    } else {
      this.initMenu()
    }
    this.setData({
      isHideMap
    })
  },
  tapMap(e) {
    // console.log(e)
    this.close();
  },
  //去五个功能页面
  toFunctionPages(e) {
    myApi.vibrate()
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
    var that = this

    //判断是否初次使用
    var isShowWelcome = wx.getStorageSync('isShowWelcome');
    if (!isShowWelcome) {
      wx.showToast({
        title: '向左滑动可查看更多介绍',
        icon:'none',
        duration:2500
      })
      wx.setStorageSync('isShowWelcome', true);
      this.setData({
        isShowWelcome: true
      })
    }
   // console.log(options)
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
     // console.log(options)
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
      } else if (scene.length == 4) {
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
      } else {
        var codeList = scene.split('-')
       // console.log(codeList)

        var ID = codeList[0]
        var store_id = codeList[1]
        var action = codeList[2]
        wx.navigateTo({
          url: '/pages/info/info?ID=' + ID + '&store_id=' + store_id + '&action=' + action,
        });
      }

    }
    /*     var Tester = wx.getStorageSync('Tester');
        this.setData({
          Tester
        })
        if (Tester == 'TEST') {
          this.openMenu()
        } else {
          userInfo.doc('27fa7e0e5ecd3edf0000caed5ba5d3e1').get().then(res => {
            console.log(res)
            var storesArr = res.data.stores
            wx.setStorageSync('storesArr', storesArr)
            //console.log(storesArr)
            that.setData({
              stores: storesArr,
              scale: 6
            })
          })
        }
        this.setData({
          Tester
        })
     */
    //this.initMenu()
    this.openMenu()
  },
  async initMap(scale) {
    var that = this
    //初始化 定位
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      altitude: 'true',
      isHighAccuracy: 'true',
      success(res) {
        //console.log(res)
        app.globalData.latitude = res.latitude
        app.globalData.longitude = res.longitude
        const latitude = res.latitude
        const longitude = res.longitude
        that.setData({
          latitude,
          longitude,
          scale: scale
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
    var nickName = '美食家' + myApi.getRandomCode(3)
    var friendsList = []
    var My_GroupsList = []
    var starStoreIdList = []
    //如果id为空
    if (openId == '') {
      //初始化
      var info = {
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
          shareCode: shareCode,
          //是否获取测试数据
          isGetTestData:true
        }
      }).then(res => {
       // console.log(res)
        //云端数据不为空，本地数据为空
        shareCode = res.result.memberInfos.data[0].shareCode
        storesArr = res.result.memberInfos.data[0].stores
        friendsList = res.result.memberInfos.data[0].friendsList
        starStoreIdList = res.result.memberInfos.data[0].starStoreIdList
        nickName = res.result.memberInfos.data[0].info.nickName
        avatarUrl = res.result.memberInfos.data[0].info.avatarUrl
        wx.setStorageSync('isUnLogin', true)
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
      // console.log(info)
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
    /*     if (this.data.Tester == 'TEST') {
          that.initMap()
          this.initData()
        } */
    that.initMap(5)
    this.initData()
    /*     var isBlackStyle = wx.getStorageSync('isBlack')
        console.log(isBlackStyle)

        this.setData({
          isBlackStyle
        }) */
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
    myApi.vibrate()
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
          store: store,
          groupId: 'null',
          secretKey: 'null'
        })
      }
    });
  },
  hideMe: function (res) {
    this.setData({
      hideMe: true
    })
  },
  //点击弹出
  openMenu: function () {
    // console.log(this.data.isPopping)
    /*     if (this.data.Tester != 'TEST') {
          wx.navigateTo({
            url: '../list/list?friendsIndex=self',
          });
        } else {
          if (this.data.isPopping) {
            //缩回动画
            this.close();
          } else {
            //弹出动画
            this.pop();
          }
        } */
    if (this.data.isPopping) {
      //缩回动画
      this.close();
    } else {
      //弹出动画
      this.pop();
    }
  },
  initMenu() {
    /*     var animMenu = wx.createAnimation({
          duration: 400,
          timingFunction: 'ease-out'
        }) */
    var animToGroup = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    var animToUerInfo = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    var animToList = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    var animToAdd = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    var animAddFriends = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    //animMenu.rotateY(180).step();

    animToUerInfo.scale(0.8).translate(-160, 0).opacity(1).step();
    animToGroup.scale(0.8).translate(-80, 0).opacity(1).step();
    animAddFriends.scale(0.8).translate(0, 0).opacity(1).step();
    animToAdd.scale(0.8).translate(80, 0).opacity(1).step();
    animToList.scale(0.8).translate(160, 0).opacity(1).step();
    this.setData({
      //animMenu: animMenu.export(),
      animToGroup: animToGroup.export(),
      animToUerInfo: animToUerInfo.export(),
      animToList: animToList.export(),
      animToAdd: animToAdd.export(),
      animAddFriends: animAddFriends.export(),
    })
  },
  //弹出动画
  pop: function () {
    var animMenu = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    var animToGroup = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    var animToUerInfo = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    var animToList = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    var animToAdd = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    var animAddFriends = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    var screenWidth = app.globalData.screenWidth
    //横向为x轴，向右为正方向。纵向为y轴，向下为正方向
    animMenu.scale(1.4).rotateZ(0).step();
    animToGroup.translate(-screenWidth*0.22, -screenWidth*0.22).scale(1.4).opacity(1).step();
    animToUerInfo.translate(-screenWidth*0.36, 0).scale(1.4).opacity(1).step();
    animToList.translate(screenWidth*0.36, 0).scale(1.4).opacity(1).step();
    animToAdd.translate(screenWidth*0.22, -screenWidth*0.22).scale(1.4).opacity(1).step();
    animAddFriends.translate(0, -screenWidth*0.36).scale(1.4).opacity(1).step();
/*     animMenu.scale(1.4).rotateZ(0).step();
    animToGroup.translate(-95, -95).scale(1.4).opacity(1).step();
    animToUerInfo.translate(-140, 0).scale(1.4).opacity(1).step();
    animToList.translate(140, 0).scale(1.4).opacity(1).step();
    animToAdd.translate(95, -95).scale(1.4).opacity(1).step();
    animAddFriends.translate(0, -140).scale(1.4).opacity(1).step(); */
    this.setData({
      animMenu: animMenu.export(),
      animToGroup: animToGroup.export(),
      animToUerInfo: animToUerInfo.export(),
      animToList: animToList.export(),
      animToAdd: animToAdd.export(),
      animAddFriends: animAddFriends.export(),
      isPopping: true
    })
  },
  //收回动画
  close: function () {
    //plus逆时针旋转
    var animMenu = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    var animToGroup = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    var animToUerInfo = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    var animToList = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    var animToAdd = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    var animAddFriends = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease-out'
    })
    animMenu.rotateZ(-180).step();
    animToGroup.translate(0, 0).opacity(0).step();
    animToUerInfo.translate(0, 0).opacity(0).step();
    animToList.translate(0, 0).opacity(0).step();
    animToAdd.translate(0, 0).opacity(0).step();
    animAddFriends.translate(0, 0).opacity(0).step();
    this.setData({
      animMenu: animMenu.export(),
      animToGroup: animToGroup.export(),
      animToUerInfo: animToUerInfo.export(),
      animToList: animToList.export(),
      animToAdd: animToAdd.export(),
      animAddFriends: animAddFriends.export(),
      isPopping: false
    })
  },

/*   testStart(e) {
    var startTime = e.timeStamp
    this.data.startTime = startTime
    //console.log(e)
  },
  testEnd(e) {
    var startTime = this.data.startTime
    var endTime = e.timeStamp
    if (endTime - startTime > 1000) {
      wx.vibrateShort()
      this.whereToEat()
    }else{
      this.openMenu()
    }
  }, */
/*   cancelInput() {
    this.setData({
      isTesting: false
    })
  },
  inputCode(e) {
    this.data.testCode = e.detail.value
  },
  confirmCode() {
    var testCode = this.data.testCode
    if (testCode === 'BigDipper') {
      wx.showToast({
        title: '成功切换为内测版',
      });
      this.setData({
        Tester: 'TEST'
      })
      wx.setStorageSync('Tester', 'TEST');
    }
    this.cancelInput()
  } */

})