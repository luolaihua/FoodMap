const app = getApp();
const db = wx.cloud.database()
const store = db.collection('store');
const userInfo = db.collection('userInfo');
const imgUrl = require('../../utils/imgUrl')
const myApi = require('../../utils/myApi')
//TODO 美食列表分类筛选，离我最近？价格？、、、
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

    isShowMenu: true

  },
  orderList(e) {
    var tag = e.currentTarget.id
    var stores = this.data.stores
    if (this.data.orderTag == tag) {
      tag = ''
      var temp = []
      stores = temp.concat(temp,this.data.storesArr)
    } else {
    stores=  myApi.sortStoresByTag(stores,tag)
/*       switch (tag) {
        case 'distance':
          var myLat = app.globalData.latitude
          var myLnd = app.globalData.longitude
          stores.forEach(store => {
            store.distance = myApi.getDistance(myLat, myLnd, store.latitude, store.longitude)
          })
          stores.sort((store1, store2) => {
            return store1.distance - store2.distance
          })
          console.log(stores)

          break;
        case 'price':
          stores.sort((store1, store2) => {
            return store1.price_per - store2.price_per
          })
          console.log(stores)

          break;
        case 'favor':
          stores.sort((store1, store2) => {
            return store2.rateValue - store1.rateValue
          })
          console.log(stores)

          break;

        default:
          break;
      } */
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

    animMenu.rotateZ(180).step();
    animToInstant.translate(-80, -60).opacity(1).step();
    animToForever.translate(80, -60).opacity(1).step();
    animToMap.translate(0, -80).opacity(1).step();
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
    myApi.vibrate()
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
    myApi.requestSendMsg('viewList')
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
    var shareList = []
    for (let index = 0; index < shareIndexList.length; index++) {
      shareList.push(stores[shareIndexList[index]])
    }
    console.log('shareList', shareList)


    switch (friendsIndex) {
      //TODO 重复导入问题
      case 'MyGroup':
        //My_GroupsList-->groupId-->group-->stores
        var My_GroupsList = wx.getStorageSync('My_GroupsList');
        //通过groupId找到是哪个圈子
        var group = My_GroupsList.find(item => {
          return item._id == groupId
        })
        //获取这个圈子的所有店铺
        var stores = group.stores
        stores = stores.concat(shareList)
        console.log(stores)

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
        stores = stores.concat(shareList)
        console.log(stores)

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
        if(shareCount==''){
          shareCount=5
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
            console.log(res)
            that.createPoster(instantShareCode, shareList)
            that.setData({
              shareCode: instantShareCode
            })
            /*         wx.showModal({
                      title: '即时美食分享码',
                      content: instantShareCode,
                      showCancel: true,
                      cancelText: '取消',
                      cancelColor: '#000000',
                      confirmText: '确定',
                      confirmColor: '#3CC51F',
                      success: (result) => {
                        if (result.confirm) {
                          that.cancelChoose()
                          wx.setClipboardData({
                            data: instantShareCode,
                          });
                        }
                      },
                    }); */
          },
          fail: console.error,
          complete: console.log
        })
        break;
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

    function getAllIndex(item, index) {
      shareIndexList.push(index)
    }
    this.data.stores.forEach(getAllIndex);
    console.log(shareIndexList)
    this.setData({
      shareIndexList,
      isChooseAll: true
    })

  },
  /**
   * 取消选择
   */
  cancelChoose() {
    myApi.vibrate()
    this.setData({
      isInstantShare: false,
      isChooseAll: false,
      shareIndexList: []
    })
  },
  /**
   * 点击CheckBox，挨个选择
   */
  chooseItem(e) {
    myApi.vibrate()
    console.log(e)
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
    this.setData({
      stores
    })
  },
  /**
   * item删除
   */
  deleteItem: function (e) {
    myApi.vibrate()
    var index = Number(e.currentTarget.id)
    var friendsIndex = this.data.friendsIndex
    var stores = this.data.stores
    var friendsList = wx.getStorageSync('friendsList');

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
    this.setData({
      stores
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
    var groupId = options.groupId
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
      stores: stores.concat(stores,storesArr),
      storesArr,
      defaultSearchValue: '',
      friendsIndex,
      isAddItemToGroup,
      groupId

    })
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
    var store = this.data.storesArr[index]
    //console.log(this.data.friendsIndex)
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
    this.setData({
      stores: this.data.storesArr,
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