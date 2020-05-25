const app = getApp();
const db = wx.cloud.database()
const userInfo = db.collection('userInfo');
const groupsList = db.collection('groupsList')
const config = require('../../config.js');
const myApi = require('../../utils/myApi')
const imgUrl = require('../../utils/imgUrl')
import Poster from '../../miniprogram_npm/wxa-plugin-canvas/poster/poster';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardCur: 0,
    keywords_array: [],
    store: '',
    friendsIndex: 'self',
    thumbs_up: 1, //1表示未收藏，0表示已收藏
    store_id: '',
    isStar: false,
    shareImage:imgUrl.share,
    isBack: true,
    ID: '',
    action: '',
    isShowShareBtn: true,
    isShowPosterModal: false, //是否展示海报弹窗
    posterImageUrl: "", //海报地址
  },
  toAdd() {
    var store = this.data.store
    var that = this
    wx.navigateTo({
      url: '../add/add?requestType=editStore',
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        editStore: async function (data) {
          var newStore = data.store
          console.log(newStore)
          that.setData({
            store: newStore
          })

          //从本地拿数据，更新到云端
          var ID = that.data.ID
          var friendsIndex = that.data.friendsIndex
          var store_id = that.data.store_id
          var storesArr = []

          if (friendsIndex == 'self') {
            storesArr = wx.getStorageSync('storesArr');
            var index = storesArr.findIndex(item => {
              return item.id == store_id
            })
            storesArr[index] = newStore
            myApi.updateUserInfo(storesArr, 'stores')

          } else {

            if (friendsIndex == 'MyGroup') {
              var GroupsList = wx.getStorageSync('My_GroupsList');
            } else {
              var GroupsList = wx.getStorageSync('Joined_GroupsList');
            }

            //根据groupId找到圈子
            var index = GroupsList.findIndex(item => {
              return item._id == ID
            })
            var group = GroupsList[index]
            storesArr = group.stores
            var index1 = storesArr.findIndex(item => {
              return item.id == store_id
            })
            storesArr[index1] = newStore
            myApi.updateGroupsList(storesArr, 'stores', ID)
          }


          /*           console.log(info)
                    if (info.data.length != 0) {
                      storesArr = info.data[0].stores
                      store = storesArr.find(item => {
                        return item.id == store_id
                      })
                    }
           */

        }
      },
      success: (res) => {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('getStore', {
          store: store
        })
      },
      fail: () => {},
      complete: () => {}
    });
  },
  //收藏好友的店铺功能
  async star() {
    var myStores = wx.getStorageSync("storesArr")
    var friendsList = wx.getStorageSync('friendsList');
    var store_id = this.data.store_id
    var friendsIndex = this.data.friendsIndex
    //当前显示的店铺
    var store = this.data.store
    var isStar = this.data.isStar
    /*     //当前朋友的店铺列表
        var storesArr = friendsList[friendsIndex].stores
        //获取当前商铺的下标
        var storeIndex = storesArr.findIndex(item => {
          return item.id == store_id
        }) */
    var starStoreIdList = wx.getStorageSync("starStoreIdList")
    //未收藏状态就收藏
    if (!isStar) {
      // 压入我的店铺
      myStores.push(store)
      //置零表示已收藏
      starStoreIdList.push(store_id)
      wx.showToast({
        title: '已收藏',
        icon: 'success',
      });
    } else {
      //在我的店铺列表中找到当前收藏的店铺，删除
      var index = myStores.findIndex(item => {
        return item.id == store_id
      })
      myStores.splice(index, 1)
      starStoreIdList.splice(starStoreIdList.indexOf(store_id), 1)
      wx.showToast({
        title: '取消收藏',
        icon: 'success',
      });
    }
    //wx.setStorageSync('starStoreIdList', starStoreIdList);
    //更新我的店铺
    myApi.updateUserInfo(myStores, 'stores')
    myApi.updateUserInfo(starStoreIdList, 'starStoreIdList')
    //更新朋友列表
    //friendsList[friendsIndex].stores[storeIndex] = store
    //myApi.updateUserInfo(friendsList, 'friendsList')
    //wx.setStorageSync('friendsList', friendsList);
    this.setData({
      isStar: !isStar
    })
  },

  // cardSwiper
  cardSwiper(e) {
    this.setData({
      cardCur: e.detail.current
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    console.log(options)
    var that = this
    var store_id, store
    //判断当前是否为首页
    var pages = getCurrentPages()
    if (pages.length == 1) {
      var isBack = false
      this.setData({
        isBack
      })
    }

    //判断是不是从约饭那里过来的
    if (options.action == 'List' || options.action == 'Group') {
      var ID = options.ID
      store_id = options.store_id
      var storesArr = []

      if (options.action == 'List') {
        var info = await userInfo.where({
          shareCode: ID
        }).get()
      } else {
        var info = await groupsList.where({
          secretKey: ID
        }).get()
      }


      console.log(info)
      if (info.data.length != 0) {
        storesArr = info.data[0].stores
        store = storesArr.find(item => {
          return item.id == store_id
        })
      }else{
        wx.showToast({
          title: '你的好友已更换分享码',
          icon: 'none',
          image: '',
          duration: 1500,
          mask: false,
          success: (result)=>{
            
          },
          fail: ()=>{},
          complete: ()=>{}
        });
      }
      that.isStar(store_id)
      this.setData({
        store: store,
        store_id,
        ID,
        action:options.action
      })
    } else {
      //下面是正常情况
      var friendsIndex = options.friendsIndex

      //通过friendsIndex来判断是否显示约饭按钮
      var isShowShareBtn = true
      if (friendsIndex != 'self' && friendsIndex != 'MyGroup' && friendsIndex != 'JoinedGroup') {
        isShowShareBtn = false
      }

      var action = ''
      var ID = ''
      //使用eventChannel来通信
      const eventChannel = this.getOpenerEventChannel()
      eventChannel.on('getStore', function (data) {
        // console.log(data)
        store = data.store
        //console.log(data.groupId)
        if (data.groupId == undefined) {
          action = 'List'
          ID = wx.getStorageSync('shareCode');
        } else {
          action = 'Group'
          //ID = data.groupId
          ID = data.secretKey
        }

        //判断在收藏店铺id列表中是否有当前店铺id存在
        //判断是否收藏了主要是看收藏id列表中是否存在此id 
        store_id = store.id + ''
        that.isStar(store_id)
        // 切割逗号
        //let keywords_array = store.tagList.toString().split(',')
        var shareImage = that.data.shareImage
        //设置分享图片
        if (store.images.length != 0) {
          wx.cloud.getTempFileURL({
            fileList: [store.images[0]],
            success: res => {
              console.log(res)
              shareImage = res.fileList[0].tempFileURL
              that.setData({
                shareImage
              })
            },
            fail: error => {
              console.error("出现Bug了", error)
            }
          })
        }
        that.setData({
          action,
          shareImage,
          store: store,
          friendsIndex,
          store_id,
          ID,
          isShowShareBtn
        })
      })
    }
    /*     switch (friendsIndex) {
          case 'self':
            //根据id在店铺列表中找到指定的店铺
            var store = storesArr.find(item => {
              return item.id == store_id
            })
            break;
          case 'MyGroup':
            //My_GroupsList-->groupId-->group-->store_id-->store
            var groupId = options.groupId
            var My_GroupsList = wx.getStorageSync('My_GroupsList');
            //通过groupId找到是哪个圈子
            var index = My_GroupsList.findIndex(item => {
              return item._id == groupId
            })
            //获取这个圈子的所有店铺
            var group = My_GroupsList[index]
            storesArr = group.stores
            //根据id在店铺列表中找到指定的店铺
            var store = storesArr.find(item => {
              return item.id == store_id
            })
            break
          case 'JoinedGroup':
            //Joined_GroupsList-->groupId-->group-->store_id-->store
            var groupId = options.groupId
            var Joined_GroupsList = wx.getStorageSync('Joined_GroupsList');
            //通过groupId找到是哪个圈子
            var index = Joined_GroupsList.findIndex(item => {
              return item._id == groupId
            })
            //获取这个圈子的所有店铺
            var group = Joined_GroupsList[index]
            storesArr = group.stores
            //根据id在店铺列表中找到指定的店铺
            var store = storesArr.find(item => {
              return item.id == store_id
            })
            break

          default:
            //从好友列表过来的
            var friendsList = wx.getStorageSync('friendsList')
            //获取朋友的所有店铺
            storesArr = friendsList[friendsIndex].stores
            //根据id在店铺列表中找到指定的店铺
            var store = storesArr.find(item => {
              return item.id == store_id
            })
            break;
        } */
    /*     //判断在收藏店铺id列表中是否有当前店铺id存在
        //判断是否收藏了主要是看收藏id列表中是否存在此id
        that.isStar(store_id)


        // 切割逗号
        let keywords_array = store.keywords.split(',')
        this.setData({
          keywords_array,
          store: store,
          friendsIndex,
          store_id
        }) */

  },
  isStar(store_id) {
    //判断在收藏店铺id列表中是否有当前店铺id存在
    //判断是否收藏了主要是看收藏id列表中是否存在此id
    var starStoreIdList = wx.getStorageSync("starStoreIdList")
    var idIndex = starStoreIdList.indexOf(store_id + '')
    var isStar
    //如果存在,说明被收藏了
    if (idIndex == -1) {
      isStar = false
      console.log('未收藏')
    } else {
      isStar = true
      console.log('已收藏')
    }
    this.setData({
      isStar
    })
  },
  tapImage: function (e) {
    wx.previewImage({
      urls: this.data.store.images,
      current: e.currentTarget.id
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var title = wx.getStorageSync('dateSlogan');
    if (title == '') {
      title = '约饭吗'
    }
    return {
      title: title,
      path: '/pages/info/info?ID=' + this.data.ID + '&store_id=' + this.data.store_id + '&action=' + this.data.action,
      imageUrl: this.data.shareImage
    }
  },
  navigate: function (e) {
    wx.openLocation({
      latitude: this.data.store.latitude,
      longitude: this.data.store.longitude,
      name: this.data.store.name,
      address: this.data.store.address
    })
  },
  /**
   * 生成海报成功-回调
   * @param {} e 
   */
  onPosterSuccess(e) {
    //console.log(e)
    const {
      detail
    } = e;
    this.setData({
      posterImageUrl: detail,
      isShowPosterModal: true
    })
    console.info(detail)
  },
  /**
   * 生成海报失败-回调
   * @param {*} err 
   */
  onPosterFail(err) {
    console.info(err)
  },
  /**
   * 生成海报
   */
  onCreatePoster: async function () {
    wx.showLoading({
      title: '加载中',
    });
    let that = this;
    if (that.data.posterImageUrl !== "") {
      that.setData({
        isShowPosterModal: true
      },()=>{
        wx.hideLoading();
      })
      return;
    }

    var QrCodeUrl=''
    var imageUrl=this.data.shareImage
    console.log(imageUrl)
    var avatarUrl = wx.getStorageSync('avatarUrl')
    //无则默认
    if(avatarUrl==''){
      avatarUrl = imgUrl.head
    }

    //生成二维码URL
    var scene =this.data.ID+ '-' + this.data.store_id + '-' + this.data.action
    //console.log(scene.length)
    var posterImageUrl = await myApi.getQrCodeUrl(scene)
     //console.log(posterImageUrl)
    var QrCodeUrl = posterImageUrl.result
    if (QrCodeUrl == '') {
      QrCodeUrl = imgUrl.QrCodeUrl
    }else{
      var res1 = await wx.cloud.getTempFileURL({
        fileList: [QrCodeUrl],
      })
      //console.log(res1)
      QrCodeUrl =res1.fileList[0].tempFileURL
    }
    let posterConfig = {
      width: 750,
      height: 1200,
      backgroundColor: '#fff',
      debug: false
    }
    var blocks = [{
        width: 690,
        height: 808,
        x: 30,
        y: 183,
        borderWidth: 2,
        borderColor: '#f0c2a0',
        borderRadius: 20,
      },
      {
        width: 634,
        height: 74,
        x: 59,
        y: 680,
        backgroundColor: '#fff',
        opacity: 0.5,
        zIndex: 100,
      }
    ]
    var texts = [];
    var nickName = wx.getStorageSync('nickName')
    texts = [{
        x: 113,
        y: 61,
        baseLine: 'middle',
        text: nickName,
        fontSize: 32,
        color: '#8d8d8d',
        width: 570,
        lineNum: 1
      },
      {
        x: 32,
        y: 113,
        baseLine: 'top',
        text: '发现一家美食店铺',
        fontSize: 38,
        color: '#080808',
      },
      {
        x: 59,
        y: 770,
        baseLine: 'middle',
        text: that.data.store.name,
        fontSize: 38,
        color: '#080808',
        marginLeft: 30,
        width: 570,
        lineNum: 2,
        lineHeight: 50
      },
      {
        x: 59,
        y: 875,
        baseLine: 'middle',
        text: that.data.store.notes,
        fontSize: 28,
        color: '#929292',
        width: 560,
        lineNum: 2,
        lineHeight: 50
      },
      {
        x: 315,
        y: 1100,
        baseLine: 'top',
        text: '长按识别小程序码,立即查看',
        fontSize: 28,
        color: '#929292',
      }
    ];
    var images = [{
        width: 62,
        height: 62,
        x: 32,
        y: 30,
        borderRadius: 62,
        url: avatarUrl, //用户头像
      },
      {
        width: 634,
        height: 475,
        x: 59,
        y: 210,
        url: imageUrl, //海报主图
      },
      {
        width: 180,
        height: 180,
        x: 70,
        y: 1000,
        url: QrCodeUrl, //二维码的图
      }
    ];

    posterConfig.blocks = blocks; //海报内图片的外框
    posterConfig.texts = texts; //海报的文字
    posterConfig.images = images;

    that.setData({
      posterConfig: posterConfig
    }, () => {
      wx.hideLoading();
      Poster.create(true); //生成海报图片
    });

  },
  /**
   * 点击放大图片
   * @param {} e 
   */
  posterImageClick: function (e) {
    wx.previewImage({
      urls: [this.data.posterImageUrl],
    });
  },
  /**
   * 隐藏海报弹窗
   * @param {*} e 
   */
  hideModal(e) {
    this.setData({
      isShowPosterModal: false
    })
  },
  /**
   * 保存海报图片
   */
  savePosterImage: function () {
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
  },

})