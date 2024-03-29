const app = getApp();
const db = wx.cloud.database()
const store = db.collection('store');
const userInfo = db.collection('userInfo');
const imgUrl = require('../../utils/imgUrl')
const myApi = require('../../utils/myApi')

var touchStartX = 0; //触摸时的原点 
var touchStartY = 0; //触摸时的原点 
var touchMoveX = 0; // x轴方向移动的距离
var touchMoveY = 0; // y轴方向移动的距离
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderTag: '',
    bar_bgImg: imgUrl.bar_bg7,
    groupId: '',
    isAddItemToGroup: false,
    modalName: '',
    defaultImage: imgUrl.head,
    numbers: 0,
    searchNum: 0,
    stores: [], //用来显示的，搜索功能会导致二者有变化
    storesArr: [], //原始的店铺列表
    defaultSearchValue: '',
    condition: 'noData',
    shareCode: '',
    instantShareCode: '',
    isDataFromOthers: '0',
    action: 'viewSelf',
    friendsIndex: 'self',
    shareIndexList: [],
    isShowModal: false,
    isInstantShare: false,
    isChooseAll: false,
    //画布--------------------------------
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
    QrCodeUrl: '../../images/QrCode.jpg',
    posterUrl: '',
    isShowPoster: false,
    //---------------菜单动画
    isPopping: false,
    animMenu: {},
    animToInstant: {},
    animToForever: {},
    animToMap: {},

    isShowMenu: true,
    isChooseToDelete: false

  },
  chooseItemToDel() {
    wx.vibrateShort();
    this.setData({
      isChooseToDelete: true
    })
  },
  orderList(e) {
    var tag = e.currentTarget.id
    var stores = this.data.stores
    if (this.data.orderTag == tag) {
      tag = ''
      var temp = []
      stores = temp.concat(temp, this.data.storesArr)
    } else {
      stores = myApi.sortStoresByTag(stores, tag)
    }
    this.setData({
      orderTag: tag,
      stores
    })
  },
  //点击弹出
  openMenu: function () {
    myApi.vibrate()
    // console.log(this.data.isPopping)
    if (this.data.isPopping) {
      //缩回动画
      this.close();
    } else {
      //弹出动画
      this.pop();
    }
  },
  //弹出动画
  pop: function () {
    var animMenu = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-out'
    })
    var animToInstant = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-out'
    })
    var animToForever = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-out'
    })
    var animToMap = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-out'
    })
    var screenWidth = app.globalData.screenWidth
    //横向为x轴，向右为正方向。纵向为y轴，向下为正方向
    // console.log(screenWidth)
    animMenu.rotateZ(180).step();
    animToInstant.translate(-screenWidth * 0.22, -screenWidth * 0.16).opacity(1).step();
    animToForever.translate(screenWidth * 0.22, -screenWidth * 0.16).opacity(1).step();
    animToMap.translate(0, -screenWidth * 0.22).opacity(1).step();
    /*     animToInstant.translate(-80, -60).opacity(1).step();
        animToForever.translate(80, -60).opacity(1).step();
        animToMap.translate(0, -80).opacity(1).step(); */
    this.setData({
      animMenu: animMenu.export(),
      animToInstant: animToInstant.export(),
      animToForever: animToForever.export(),
      animToMap: animToMap.export(),
      isPopping: true
    })
  },
  //收回动画
  close: function () {
    //plus逆时针旋转
    var animMenu = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-out'
    })
    var animToInstant = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-out'
    })
    var animToForever = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-out'
    })
    var animToMap = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-out'
    })
    animMenu.rotateZ(0).step();
    animToInstant.translate(0, 0).opacity(0).step();
    animToForever.translate(0, 0).opacity(0).step();
    animToMap.translate(0, 0).opacity(0).step();
    this.setData({
      animMenu: animMenu.export(),
      animToInstant: animToInstant.export(),
      animToForever: animToForever.export(),
      animToMap: animToMap.export(),
      isPopping: false
    })
  },
  toFoodMap() {
    this.close()
    myApi.vibrate()
    var stores = this.data.storesArr
    wx.navigateTo({
      url: '../foodMap/foodMap',
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('getStores', {
          stores: stores
        })
      }
    });
  },
  copyShareCode() {
    wx.vibrateShort();
    wx.setClipboardData({
      data: this.data.shareCode,
    });
  },
  /**
   * 关闭保存海报图片的框
   */
  closePosterImage: function () {
    myApi.vibrate()
    //订阅消息提醒
    /*     wx.requestSubscribeMessage({
          tmplIds: ['UmS6i-0fJvfTjUcr4VgbE8bfw8whhTntV3dCerxOPJA','dwHciIp6G-I6CGPWaIckLXAufOVRV-1stoxHvk0EtjM','Jf_vPIyYSbrrGhWsKNQ8UyHforoywAQco4hO7Fw64J0'],
          success(res) {
            console.log(res)
          }
        }) */
    //myApi.requestSendMsg('viewList')
    this.setData({
      isShowPoster: false,
    });
    this.cancelChoose()
  },

  /**
   * 保存海报图片
   */
  savePosterImage: async function () {
    myApi.vibrate()
    myApi.requestSendMsg('viewList')
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
        //myApi.requestSendMsg('viewList')
        that.setData({
          isShowPoster: false,
        });
        that.cancelChoose()
      }
    })
  },
  /**
   * 生成海报
   */
  async createPoster(shareCode, storesArr) {
    wx.showLoading({
      title: '正在生成中',
    })
    var that = this;
    var textArr = []
    //生成海报文本内容
    storesArr.forEach(item => {
      textArr.push(item.name)
      // console.log(item.tagList) 
      //暂时不把标签也加入
      // textArr = textArr.concat(item.tagList)
    })
    //生成二维码URL
    var QrCodeUrl = this.data.QrCodeUrl
    myApi.makePosterImageCanvas('shareCanvas', '我的美食收藏', textArr, that.data.colorArr, that.data.fontArr, that.data.sizeArr, 600, 20, 20, 40, that.data.canvasWidth, that.data.canvasHeight, 120, 400, QrCodeUrl);
    /*     var posterImageUrl = await myApi.getQrCodeUrl(shareCode)
        // console.log(posterImageUrl)
        var QrCodeUrl = posterImageUrl.result
        if (QrCodeUrl == '') {
          QrCodeUrl = this.data.QrCodeUrl
          myApi.makePosterImageCanvas('shareCanvas', '我的美食收藏', textArr, that.data.colorArr, that.data.fontArr, that.data.sizeArr, 600, 20, 20, 40, that.data.canvasWidth, that.data.canvasHeight, 120, 400, QrCodeUrl);
        } else {
          wx.getImageInfo({
            src: posterImageUrl.result,
            success(res) {
              QrCodeUrl = res.path
              myApi.makePosterImageCanvas('shareCanvas', '我的美食收藏', textArr, that.data.colorArr, that.data.fontArr, that.data.sizeArr, 600, 20, 20, 40, that.data.canvasWidth, that.data.canvasHeight, 120, 400, QrCodeUrl);
            }
          })
        } */
    // console.log(textArr)

    setTimeout(function () {
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: that.data.canvasWidth,
        height: that.data.canvasHeight,
        canvasId: 'shareCanvas',
        success: function (res) {
          //console.log(res.tempFilePath);
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
  /**
   * 点击放大图片
   * @param {} e 
   */
  posterImageClick: function (e) {
    wx.previewImage({
      urls: [this.data.posterUrl],
    });
  },
  /**
   * 点击分享按钮,生成分享码分享---即时分享
   * stores为展示的数据---搜索会筛选数据
   * storesArr为原有的数据，二者本是一样的，因为搜索功能需要还原数据
   */
  async shareItems() {
    myApi.vibrate()
    var that = this
    var shareIndexList = this.data.shareIndexList
    var groupId = this.data.groupId
    var friendsIndex = this.data.friendsIndex
    //先检查是否一个也没有选择
    if (shareIndexList.length == 0) {
      wx.showToast({
        title: '请选择选择店铺',
        icon: 'none',
      });
      return
    }
    //这里用的是展示的数据，也就是可以使搜索之后的数据
    var stores = this.data.stores
    //console.log(stores)
    if (this.data.isChooseToDelete) {
      //console.log(storesArr)
      wx.showModal({
        title: '删除美食店铺',
        content: '删除后不可恢复，请确认',
        showCancel: true,
        cancelText: '取消',
        cancelColor: '#000000',
        confirmText: '确定',
        confirmColor: '#3CC51F',
        success: (result) => {
          if (result.confirm) {
            var storesArr = this.data.storesArr
            var starStoreIdList = wx.getStorageSync("starStoreIdList")
            //console.log(starStoreIdList)
            var starListLength = starStoreIdList.length
            for (let index = 0; index < shareIndexList.length; index++) {
              //console.log('deleteList', stores[shareIndexList[index]])
              storesArr.forEach((item, storeIndex) => {

                if (item.id == stores[shareIndexList[index]].id) {
                  //如果删除的条目为收藏的店铺，需要把店铺取消收藏
                  var id = item.id + ''
                  if (starStoreIdList.length != 0) {
                    var idIndex = starStoreIdList.indexOf(id)
                    //如果要删除的店铺为收藏进来的，
                    if (idIndex != -1) {
                      //先把id列表的的id删除
                      starStoreIdList.splice(idIndex, 1)
                    }
                  }
                  storesArr.splice(storeIndex, 1)
                }
              })
            }

            //没必要删除一次店铺就更新一次收藏id，最后一次性来更新一次
            if (starListLength != starStoreIdList.length) {
              myApi.updateUserInfo(starStoreIdList, 'starStoreIdList')
            }
            myApi.updateUserInfo(storesArr, 'stores')
            wx.showToast({
              title: '删除成功',
              icon: 'none',
              image: '',
              duration: 1500,
              mask: false,
              success: (result) => {
                that.cancelChoose()
              },
              fail: () => {},
              complete: () => {}
            });

          }
        },
        fail: () => {},
        complete: () => {}
      });
      /*       this.setData({
              storesArr
            }) */
    } else {
      var shareList = []
      for (let index = 0; index < shareIndexList.length; index++) {
        shareList.push(stores[shareIndexList[index]])
      }
     // console.log('shareList', shareList)

      switch (friendsIndex) {
        //解决 重复导入问题
        case 'MyGroup':
          //My_GroupsList-->groupId-->group-->stores
          var My_GroupsList = wx.getStorageSync('My_GroupsList');
          //通过groupId找到是哪个圈子
          var group = My_GroupsList.find(item => {
            return item._id == groupId
          })
          //获取这个圈子的所有店铺
          var stores = group.stores
          //将导入的店铺放在最前面
          stores = shareList.concat(stores)
         // console.log(stores)

          await myApi.updateGroupsList(stores, 'stores', groupId)
          wx.showToast({
            title: '导入成功！',
            icon: 'success',
          })
          setTimeout(() => {
            wx.navigateBack({})
          }, 500);
          break;
        case 'JoinedGroup':
          //My_GroupsList-->groupId-->group-->stores
          var Joined_GroupsList = wx.getStorageSync('Joined_GroupsList');
          //通过groupId找到是哪个圈子
          var group = Joined_GroupsList.find(item => {
            return item._id == groupId
          })
          //获取这个圈子的所有店铺
          var stores = group.stores
          //stores = stores.concat(shareList)
          stores = shareList.concat(stores)
         // console.log(stores)

          await myApi.updateGroupsList(stores, 'stores', groupId)

          wx.showToast({
            title: '导入成功！',
            icon: 'success',
          })
          setTimeout(() => {
            wx.navigateBack({})
          }, 500);
          break;
        default:
          var nickName = wx.getStorageSync('nickName');
          var avatarUrl = wx.getStorageSync('avatarUrl');
          var instantShareCode = myApi.getRandomCode(8)
          var shareCount = wx.getStorageSync('shareCount');
          if (shareCount == '') {
            shareCount = 5
          }
          db.collection('instantShare').add({
            // data 字段表示需新增的 JSON 数据
            data: {
              info: {
                nickName: nickName,
                avatarUrl: avatarUrl
              },
              instantShareCode: instantShareCode,
              createTime: myApi.formatTime(new Date()),
              stores: shareList,
              shareCount: shareCount
            },
            success: function (res) {
              // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
             // console.log(res)
              that.createPoster(instantShareCode, shareList)
              that.setData({
                shareCode: instantShareCode
              })
            },
            fail: console.error,
            complete: console.log
          })
          break;
      }
    }






  },
  /**
   * 打开即时分享
   */
  instantShare() {
    this.close()
    myApi.vibrate()
    this.setData({
      isShowModal: false,
      isInstantShare: true
    })
  },
  /**
   * 永久分享
   */
  foreverShare() {
    this.close()
    myApi.vibrate()
    var shareCode = wx.getStorageSync('shareCode')
    this.createPoster(shareCode, this.data.storesArr)

    this.setData({
      isShowModal: false,
      isInstantShare: false,
      shareCode
    })
    /*     wx.showModal({
          title: '您的美食分享码',
          content: shareCode,
          showCancel: true,
          cancelText: '取消',
          cancelColor: '#000000',
          confirmText: '确定',
          confirmColor: '#3CC51F',
          success: (result) => {
            if (result.confirm) {
              wx.setClipboardData({
                data: shareCode,
              });
            }
          },
        }); */

  },
  /**
   * 全选
   */
  chooseAllItem() {
    myApi.vibrate()
    var shareIndexList = []
    var isChooseAll = !this.data.isChooseAll
    if (isChooseAll) {
      this.data.stores.forEach((item, index) => {
        shareIndexList.push(index)
      });
    }
   // console.log(shareIndexList)
    this.setData({
      shareIndexList,
      isChooseAll
    })

  },
  /**
   * 取消选择
   */
  cancelChoose() {
    myApi.vibrate()
    var temp = []
    var storesArr = this.data.storesArr
    temp = temp.concat(temp, storesArr)
    this.setData({
      stores: temp,
      storesArr,
      isInstantShare: false,
      isChooseAll: false,
      isChooseToDelete: false,
      shareIndexList: []
    })
    if (this.data.isAddItemToGroup) {
      wx.navigateBack({
        delta: 1
      });
    }
  },
  /**
   * 点击CheckBox，挨个选择
   */
  chooseItem(e) {
    myApi.vibrate()
    //console.log(e)
    this.setData({
      shareIndexList: e.detail.value
    })
  },
  /**
   * item置顶
   */
  topItem: function (e) {
    myApi.vibrate()
    var index = e.currentTarget.id
    var friendsIndex = this.data.friendsIndex
    var stores = this.data.stores
    stores = myApi.makeItemTop(stores, index)
    if (friendsIndex == 'self') {
      myApi.updateUserInfo(stores, 'stores')
    }
    // console.log(stores)
    // console.log(this.data.storesArr)
    wx.showToast({
      title: '置顶成功',
    });
    this.setData({
      stores,
      modalName: null,
      ListTouchDirection: null
    })
  },
  /**
   * item删除
   */
  deleteItem: function (e) {
    wx.vibrateShort();
    var index = Number(e.currentTarget.id)
    var friendsIndex = this.data.friendsIndex
    var stores = this.data.stores
    var friendsList = wx.getStorageSync('friendsList');

    var storesArr = this.data.storesArr
    storesArr.forEach((item, storeIndex) => {
      if (item.id == stores[index].id) {
        storesArr.splice(storeIndex, 1)
      }
    })
    //如果是自身数据就更新到云端，如果是他人数据就更新本地

    if (friendsIndex == 'self') {
      //如果删除的条目为收藏的店铺，需要把店铺取消收藏
      //console.log(stores[index])
      var id = stores[index].id + ''
      var starStoreIdList = wx.getStorageSync("starStoreIdList")
      if (starStoreIdList.length != 0) {
        var idIndex = starStoreIdList.indexOf(id)
        //如果要删除的店铺为收藏进来的，
        if (idIndex != -1) {
          //先把id列表的的id删除
          starStoreIdList.splice(idIndex, 1)
          myApi.updateUserInfo(starStoreIdList, 'starStoreIdList')
          //wx.setStorageSync('starStoreIdList', starStoreIdList);
          //
        }
      }
      stores.splice(index, 1)
      myApi.updateUserInfo(stores, 'stores')
    } else {
      stores.splice(index, 1)
      friendsList[friendsIndex].stores = stores
      myApi.updateUserInfo(friendsList, 'friendsList')
      //wx.setStorageSync('friendsList', friendsList);
    }

    // console.log(stores)
    // console.log(this.data.storesArr)
    wx.showToast({
      title: '删除成功',
    });
    this.setData({
      storesArr,
      stores,
      modalName: null,
      ListTouchDirection: null
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //friendsIndex
    var friendsIndex = options.friendsIndex
    var storesArr = []
    var isAddItemToGroup = false
    var groupId = options.groupId==undefined?'':options.groupId
    
    switch (friendsIndex) {
      case 'self':
        storesArr = wx.getStorageSync('storesArr')
        break;
      case 'MyGroup':
        isAddItemToGroup = true
        storesArr = wx.getStorageSync('storesArr')
        var My_GroupsList = wx.getStorageSync('My_GroupsList');
        var group = My_GroupsList.find(item => {
          return item._id == groupId
        })
        // console.log(group)
        var groupStores = group.stores
        var newArr = []
        storesArr.forEach((store, index) => {
          var pushFlag = true
          groupStores.forEach(groupStore => {
            if (groupStore.id == store.id) {
              pushFlag = false
            }
          })
          if (pushFlag) {
            newArr.push(store)
          }
        });
        storesArr = newArr
        break;
      case 'JoinedGroup':
        isAddItemToGroup = true
        storesArr = wx.getStorageSync('storesArr')
        var Joined_GroupsList = wx.getStorageSync('Joined_GroupsList');
        var group = Joined_GroupsList.find(item => {
          return item._id == groupId
        })
        // console.log(group)
        var groupStores = group.stores
        var newArr = []
        storesArr.forEach((store, index) => {
          var pushFlag = true
          groupStores.forEach(groupStore => {
            if (groupStore.id == store.id) {
              pushFlag = false
            }
          })
          if (pushFlag) {
            newArr.push(store)
          }
        });
        storesArr = newArr
        break;
      default:
        var friendsList = wx.getStorageSync('friendsList')
        storesArr = friendsList[friendsIndex].stores
        break;
    }

    // console.log(friendsIndex)
    // console.log(storesArr)
    /*     if (friendsIndex == 'self') {
          storesArr = wx.getStorageSync('storesArr')
        } else {
          var friendsList = wx.getStorageSync('friendsList')
          storesArr = friendsList[friendsIndex].stores
        } */
    var stores = new Array();
    this.setData({
      stores: stores.concat(stores, storesArr),
      storesArr,
      defaultSearchValue: '',
      friendsIndex,
      isAddItemToGroup,
      groupId

    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.isChooseToDelete && !this.data.isAddItemToGroup && !this.data.isInstantShare) {
      wx.showToast({
        title: '到底啦~',
        icon: 'none',
        duration: 1000,
      });
    }

  },
  /**
   * 隐藏modal弹窗
   */
  hideShareModal(e) {
    this.setData({
      isShowModal: false
    })
  },
  /**
   * 打开modal弹窗
   */
  showShareModal() {
    var that = this
    that.setData({
      isShowModal: true
    })

    /*     wx.showModal({
          title: '是否接收通知',
          content: '当好友获取您的分享内容时，是否通知本人？',
          showCancel: true,
          cancelText: '取消',
          cancelColor: '#000000',
          confirmText: '确定',
          confirmColor: '#3CC51F',
          success: (result) => {
            if(result.confirm){
              wx.requestSubscribeMessage({
                tmplIds: ['UmS6i-0fJvfTjUcr4VgbE8bfw8whhTntV3dCerxOPJA','dwHciIp6G-I6CGPWaIckLXAufOVRV-1stoxHvk0EtjM','Jf_vPIyYSbrrGhWsKNQ8UyHforoywAQco4hO7Fw64J0'],
                success(res) {
                  that.setData({
                    isShowModal: true
                  })
                  console.log(res)
                   wx.cloud.callFunction({
                    name: 'sendMessage',
                    data: {
                      name1:wx.getStorageSync('nickName'),
                      thing2: '你好',
                      date3: myApi.formatTime(new Date()),
                      thing4: '已查看',
                      thing5: '啦啦啦啦啦啦',
                    }
                  }) 
                }
              })
            }else{
              that.setData({
                isShowModal: true
              })
            }
          },
          fail: ()=>{},
          complete: ()=>{}
        });
     */
  },

  backToMap() {
    wx.navigateBack({
      delta: 1
    });
  },
  toInfo(e) {
    //var id = e.currentTarget.id
    var index = e.currentTarget.dataset.index
    var store = this.data.stores[index]
    console.log(this.data.friendsIndex)
    wx.navigateTo({
      url: '../info/info?friendsIndex=' + this.data.friendsIndex,
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

  clearSearch() {
    var stores = []
    stores = stores.concat(stores, this.data.storesArr)
    this.setData({
      stores: stores,
      defaultSearchValue: ''
    })
  },
  storeSearch: function (e) {
    var keywords = e.detail.value
    var storesArr = this.data.storesArr

    function search(obj) {
      var str = JSON.stringify(obj);
      return str.search(keywords) != -1
    }
    this.setData({
      stores: storesArr.filter(search)
    })
  },

  // ListTouch触摸开始
  ListTouchStart(e) {
    touchStartX = e.touches[0].pageX; // 获取触摸时的原点 
    touchStartY = e.touches[0].pageY; // 获取触摸时的原点 
  },

  // ListTouch计算方向
  ListTouchMove(e) {
    touchMoveX = e.touches[0].pageX;
    touchMoveY = e.touches[0].pageY;
  },

  // ListTouch计算滚动
  ListTouchEnd(e) {
    var ListTouchDirection = ''
    var moveX = Math.abs(touchMoveX - touchStartX);
    var moveY = Math.abs(touchMoveY - touchStartY)
    if (moveX <= moveY && touchMoveY != 0) { // 上下
      // 向上滑动
      if (touchMoveY - touchStartY <= -100) {
        // console.log("向上滑动" + touchMoveY + '  |  ' + touchStartY + 'up')
      }
      // 向下滑动 
      if (touchMoveY - touchStartY >= 90) {
        //console.log('向下滑动-更新 ' + touchMoveY + '   |  ' + touchStartY);

      }
    } else if (touchMoveX != 0) { // 左右
      // 向左滑动
      if (touchMoveX - touchStartX <= -80) {
        // console.log("左滑页面" + touchMoveX + '  |  ' + touchStartX + 'left')
        ListTouchDirection = 'left'

      }
      // 向右滑动 
      if (touchMoveX - touchStartX >= 80) {
        //console.log('向右滑动' + touchMoveX + '  |  ' + touchStartX + 'left');
      }
    }
    var modalName = e.currentTarget.dataset.target
    if (ListTouchDirection == 'left') {
      /*       this.setData({
              modalName: e.currentTarget.dataset.target
            }) */
    } else {
      modalName = null
    }
    this.setData({
      modalName,
      ListTouchDirection: null
    })
  }
})