const app = getApp();
const db = wx.cloud.database()
const store = db.collection('store');
const userInfo = db.collection('userInfo');
const imgUrl = require('../../utils/imgUrl')
const myApi = require('../../utils/myApi')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalName: '',
    defaultImage: imgUrl.head,
    numbers: 0,
    searchNum: 0,
    stores: [],
    storesArr: [],
    defaultSearchValue: '',
    condition: 'noData',
    shareCode: '',
    instantShareCode:'',
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
    QrCodeUrl: '../../images/QrCode.png',
    posterUrl: '',
    isShowPoster: false,
    isHideFunction:false

  },
  copyShareCode(){
    wx.setClipboardData({
      data: this.data.shareCode,
    });
  },
  /**
   * 关闭保存海报图片的框
   */
  closePosterImage: function () {
    this.setData({
      isShowPoster: false,
    });
    this.cancelChoose()
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
      console.log(item.keywords)
      if (item.keywords != "") {
        textArr = textArr.concat(item.keywords.split(','))
      }
    })
    //生成二维码URL
    var posterImageUrl = await myApi.getQrCodeUrl(shareCode)
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
  /**
   * 点击分享按钮,生成分享码分享---即时分享
   * stores为展示的数据---搜索会筛选数据
   * storesArr为原有的数据，二者本是一样的，因为搜索功能需要还原数据
   */
  shareItems() {
    var that = this
    const db = wx.cloud.database()
    var shareIndexList = this.data.shareIndexList
    //这里用的是展示的数据，也就是可以使搜索之后的数据
    var stores = this.data.stores
    //console.log(stores)
    var shareList = []
    for (let index = 0; index < shareIndexList.length; index++) {
      shareList.push(stores[shareIndexList[index]])
    }
    var instantShareCode = myApi.getRandomCode(8)
    db.collection('instantShare').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        instantShareCode: instantShareCode,
        createTime: myApi.formatTime(new Date()),
        stores: shareList,
        shareCount: 6
      },
      success: function (res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        console.log(res)
        that.createPoster(instantShareCode,shareList)
        that.setData({
          shareCode:instantShareCode
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

    console.log(shareList)
  },
    /**
   * 打开即时分享
   */
  instantShare() {
    this.setData({
      isShowModal: false,
      isInstantShare: true
    })
  },
  /**
   * 永久分享
   */
  foreverShare() {
    var shareCode = wx.getStorageSync('shareCode')
    this.createPoster(shareCode,this.data.storesArr)
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
    console.log(e)
    this.setData({
      shareIndexList: e.detail.value
    })
  },
  /**
   * item置顶
   */
  topItem: function (e) {
    var index = e.currentTarget.id
    var friendsIndex = this.data.friendsIndex
    var stores = this.data.stores
    stores = myApi.makeItemTop(stores, index)
    if (friendsIndex == 'self') {
      myApi.updateStore(stores)
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
    var index = Number(e.currentTarget.id)
    var friendsIndex = this.data.friendsIndex
    var stores = this.data.stores
    var friendsList = wx.getStorageSync('friendsList');

    //如果是自身数据就更新到云端，如果是他人数据就更新本地
    //如果删除的条目为收藏的店铺，需要把店铺取消收藏
    var id = stores[index].id + ''
    var starStoreIdList = wx.getStorageSync("starStoreIdList")
    if (starStoreIdList != '') {
      var idIndex = starStoreIdList.indexOf(id)
      //如果要删除的店铺为收藏进来的，
      if (idIndex != -1) {
        //先把id列表的的id删除
        starStoreIdList.splice(idIndex, 1)
        wx.setStorageSync('starStoreIdList', starStoreIdList);
        //
      }
    }


    stores.splice(index, 1)
    if (friendsIndex == 'self') {
      myApi.updateStore(stores)
    } else {
      friendsList[friendsIndex].stores = stores
      wx.setStorageSync('friendsList', friendsList);
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
   var  isHideFunction = wx.getStorageSync('isHideFunction')
    //friendsIndex
    var friendsIndex = options.friendsIndex
    var storesArr = []

    //console.log(friendsIndex)
    if (friendsIndex == 'self') {
      storesArr = wx.getStorageSync('storesArr')
    } else {
      var friendsList = wx.getStorageSync('friendsList')
      storesArr = friendsList[friendsIndex].stores
      wx.setNavigationBarTitle({
        title: '好友的美食列表',
        success: (result) => {},
        fail: () => {},
        complete: () => {}
      });
    }

    this.setData({
      stores: storesArr,
      storesArr,
      defaultSearchValue: '',
      friendsIndex,
      isHideFunction
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
    this.setData({
      isShowModal: true
    })
  },

  backToMap() {
    wx.navigateBack({
      delta: 1
    });
  },
  toInfo(e) {
    var id = e.currentTarget.id
    console.log(this.data.friendsIndex)
    wx.navigateTo({
      url: '../info/info?id=' + id + '&friendsIndex=' + this.data.friendsIndex,
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
  /**
   * 保存海报图片
   */
  /*   savePosterImage: function () {
      let that = this
      wx.saveImageToPhotosAlbum({
        filePath: that.data.posterImageUrl,
        success(result) {
          console.log(result)
          wx.showModal({
            title: '提示',
            content: '二维码海报已存入手机相册，赶快分享到朋友圈吧',
            showCancel: false,
            success: function (res) {
              that.setData({
                isShowPosterModal: false,
                isShow: false
              })
            }
          })
        },
        fail: function (err) {
          console.log(err);
          if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
            console.log("再次发起授权");
            wx.showModal({
              title: '用户未授权',
              content: '如需保存海报图片到相册，需获取授权.是否在授权管理中选中“保存到相册”?',
              showCancel: true,
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  wx.openSetting({
                    success: function success(res) {
                      console.log('打开设置', res.authSetting);
                      wx.openSetting({
                        success(settingdata) {
                          console.log(settingdata)
                          if (settingdata.authSetting['scope.writePhotosAlbum']) {
                            console.log('获取保存到相册权限成功');
                          } else {
                            console.log('获取保存到相册权限失败');
                          }
                        }
                      })

                    }
                  });
                }
              }
            })
          }
        }
      });
    }, */

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