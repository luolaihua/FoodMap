const app = getApp();

const myApi = require('../../utils/myApi')
const imgUrl = require('../../utils/imgUrl')
const config = require('../../config')
// 引入SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk');

// 实例化API核心类
var qqmapsdk = new QQMapWX({
  key: config.mapSubKey // 必填
});

var tabList = ['火锅', '奶茶', '烧烤', '串串', '水果', '自助', '海鲜', '烤鸭', '烤鸡', '烤鱼', '小吃', '烧饼', '早点', '水饺', '馄饨', '面条', '香锅', '拌饭', '麻辣烫', '黄焖鸡']
Page({

  /**
   * 页面的初始数据
   */
  data: {
    icon_add: imgUrl.icon_add,
    icon_sub: imgUrl.icon_sub,
    bar_bgImg: imgUrl.bar_bg8,
    foodIconUrl: "/images/rice.png",
    foodIconList: imgUrl.foodIconLocal,
    rateValue: 3.0,
    imgList: [], //安全检测成功的图片本地链接
    images: [], //上传到云端后的fileID链接
    fileList: [], //用于显示添加图片
    address: '',
    latitude: '',
    longitude: '',
    name: '',
    stores: [],
    openId: '',
    notes: '',
    price_per: 50,
    tabList: tabList,
    tagList: [],
    colorList: ["#f2826a", "#7232dd", "#1cbbb4"],
    isShow: true,
    requestType: 'Mine',
    groupId: '',
    store: {
      id: '',
      creatorName: '',
      creatorAvatar: '',
      //创建者ID用于美食圈子动态鉴权
      creatorId: '',
      createTime: '',
      address: '',
      name: '',
      rateValue: 3,
      price_per: 50,
      keywords: '',
      notes: '',
      isStar: false,
      iconPath: "/images/rice.png",
      longitude: '',
      latitude: '',
      callout: {
        content: '',
        padding: 8,
        display: 'BYCLICK',
        fontSize: 12,
        textAlign: 'center',
        borderRadius: 30,
      },
      images: [],
      tagList: [],
      //---------增加菜品
      special_list: []
    },
    isShowMenu: true,
    suggestion: [],
    isShowCity:false,
    myCity:''

  },
  clearName(){
    var store = this.data.store
    store.name = ''
    this.setData({
      store,
      suggestion:[]
    });
  },
  getCity(){
    var isShowCity = this.data.isShowCity
    var myCity = this.data.myCity
    var that  = this
    var store = this.data.store
    var inputEvent = {
      detail:{
        value:store.name
      }
    }
    if(myCity==''){
      qqmapsdk.reverseGeocoder({
        //位置坐标，默认获取当前位置，非必须参数
        //location: '', //获取表单传入的位置坐标,不填默认当前位置,示例为string格式
        //get_poi: 1, //是否返回周边POI列表：1.返回；0不返回(默认),非必须参数
        success: function(res) {//成功后的回调
         // console.log(res);
          //var res = res.result;
          myCity = res.result.address_component.city
          that.setData({
            myCity
          },()=>{
            that.inputName(inputEvent)
          })
        },
        fail: function(error) {
          console.error(error);
        },
        complete: function(res) {
          console.log(res);
        }
      })
    }else{
      myCity = ''
      this.setData({
        myCity, 
      },()=>{
        that.inputName(inputEvent)
      })
    }

    this.setData({
      isShowCity:!this.data.isShowCity
    })
  },
  //数据回填方法
  backfill: function (e) {
    var store = this.data.store
    var id = e.currentTarget.id;
    console.log(this.data.suggestion)
    for (var i = 0; i < this.data.suggestion.length; i++) {
      if (i == id) {
        console.log(this.data.suggestion[i].title)
        store.name = this.data.suggestion[i].title
        store.latitude = this.data.suggestion[i].latitude
        store.longitude = this.data.suggestion[i].longitude
        store.callout.content = this.data.suggestion[i].title
        store.address =  this.data.suggestion[i].addr
        this.setData({
          store,
          suggestion:[]
        });
      }
    }
  },
  //输入店铺名称
  inputName(e) {
    var store = this.data.store
    var _this = this;
    var name = e.detail.value
    var myCity = this.data.myCity
    //console.log(myCity)
    if (name != '') {
      //调用关键词提示接口
      qqmapsdk.getSuggestion({
        //获取输入框值并设置keyword参数
        keyword: name, //用户输入的关键词，可设置固定值,如keyword:'KFC'
        region:myCity, //设置城市名，限制关键词所示的地域范围，非必填参数
        success: function (res) { //搜索成功后的回调
         // console.log(res);
          var sug = [];
          for (var i = 0; i < res.data.length; i++) {
            sug.push({ // 获取返回结果，放到sug数组中
              title: res.data[i].title,
              id: res.data[i].id,
              addr: res.data[i].address,
              city: res.data[i].city,
              district: res.data[i].district,
              latitude: res.data[i].location.lat,
              longitude: res.data[i].location.lng
            });
          }
          _this.setData({ //设置suggestion属性，将关键词搜索结果以列表形式展示
            suggestion: sug
          });
        },
        fail: function (error) {
         // console.error(error);
        },
        complete: function (res) {
          //console.log(res);
        }
      });
    }else{
      _this.setData({ //设置suggestion属性，将关键词搜索结果以列表形式展示
        suggestion: []
      });
    }

    store.name = name
    store.callout.content = name

    this.setData({
      store
    })
    // this.data.store.name = e.detail.value
    // this.data.store.callout.content = e.detail.value
    //console.log(this.data.store)
    /*     this.setData({
          name: e.detail.value
        }) */
  },

  //输入菜品
  checkSpecial(e) {
    var that = this,
      value = e.detail.value,
      index = e.currentTarget.dataset.index,
      store = that.data.store
    for (let i in store.special_list) {
      if (index == i) {
        store.special_list[i] = value
      }
    }
    // console.log(store)

    // console.log(special_list)
    that.setData({
      store
    })
  },
  //增加特色菜
  addSpecial() {
    myApi.vibrate()
    var that = this,
      store = that.data.store
    // console.log(special_list)
    store.special_list.push('');
    //console.log(store)

    that.setData({
      store
    })
  },
  //删除特色
  subSpecial(e) {
    myApi.vibrate()
    var that = this,
      index = e.currentTarget.dataset.index,
      store = that.data.store
    for (let i in store.special_list) {
      if (i == index) {
        store.special_list.splice(i, 1);
        break;
      }
    }
    //console.log(store)
    that.setData({
      store
    })
  },
  chooseLocation: function (event) {
    myApi.vibrate()
    var that = this
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success: res => {
              chooseLocation()
            }
          })
        } else {
          chooseLocation()
        }
      }
    })

    function chooseLocation() {
      var name = that.data.name

      wx.chooseLocation({
        success: res => {
          name = (name == '' ? res.name : name)
          var store = that.data.store
          store.name = name
          store.callout.content = name
          store.address = res.address
          store.latitude = res.latitude
          store.longitude = res.longitude
          that.setData({
            store
          })

          /*           that.setData({
                      address: res.address,
                      latitude: res.latitude,
                      longitude: res.longitude,
                      name
                    }) */
        }
      })
    }
  },
  //星星评分
  setRateValue: function (e) {
    var store = this.data.store
    store.rateValue = e.detail
    this.setData({
      store
    })
    //this.data.store.rateValue = e.detail
    /*     this.setData({
          rateValue: e.detail
        }) */
  },
  //选择个性图标
  chooseIcon(e) {
    var index = Number(e.currentTarget.id)
    var store = this.data.store
    store.iconPath = this.data.foodIconList[index]
    this.setData({
      store
    })
    //this.data.store.iconPath = this.data.foodIconList[index]
    /*     this.setData({
          foodIconUrl: this.data.foodIconList[index]
        }) */
  },
  //输入点评
  inputNotes(e) {
    var store = this.data.store
    store.notes = e.detail.value
    this.setData({
      store
    })
    //this.data.store.notes = e.detail.value
    /*     this.setData({
          notes: e.detail.value
        }) */
  },

  //关闭关键词标签
  tagClose: function (e) {
    myApi.vibrate()
    var index = Number(e.currentTarget.id)
    var tagList = this.data.tagList
    tagList.splice(index, 1)
    var store = this.data.store
    store.tagList = tagList
    this.setData({
      store
    })
    //this.data.store.tagList = tagList
    /*     this.setData({
          tagList
        }) */
  },
  //点击关键词选择
  tagClick(e) {
    myApi.vibrate()
    var index = e.currentTarget.id
    var tagList = this.data.tagList
    var tabList = this.data.tabList
    if (tagList.length > 2) {
      tagList.shift()
    }
    tagList.push(tabList[index])
    var store = this.data.store
    store.tagList = tagList
    this.setData({
      store
    })
    // this.data.store.tagList = tagList
    /*     this.setData({
          tagList
        }) */
  },
  //price_per 人均消费
  onDrag(event) {
    /*     var  eventChannel = this.getOpenerEventChannel()
        eventChannel.emit('acceptDataFromOpenedPage', {data: this.data.stores}); */
    var store = this.data.store
    store.price_per = event.detail.value
    this.setData({
      store
    })
    //console.log(event.detail.value)
    /*     this.setData({
          price_per: event.detail.value
        }); */
  },
  onChange(event) {
    var store = this.data.store
    store.price_per = event.detail
    this.setData({
      store
    })
  },
  //读取照片之后
  async afterRead(event) {
    var that = this
    var imgList = this.data.imgList
    const tempFilePath = event.detail.file.path;
    var fileList = this.data.fileList
    var length = fileList.length
    var file = {
      url: tempFilePath,
      status: 'uploading',
      message: '安全检测中'
    }
    fileList.push(file)
    this.setData({
      fileList
    })
    var imgSafe = await myApi.doImgSecCheck(tempFilePath, 'local')
    if (imgSafe) {
      fileList[length].status = 'done'
      fileList[length].message = '完成'
      imgList.push(tempFilePath)
      that.setData({
        fileList,
        imgList
      })
    } else {
      fileList[length].status = 'failed'
      fileList[length].message = '上传失败'
      that.setData({
        fileList,
      })
      wx.showToast({
        title: '图片内容未通过安全检测，请重新选择图片',
        icon: 'none'
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    /*     var Tester = wx.getStorageSync('Tester');
        if(Tester!='TEST'){
          this.setData({
            isShowMenu:false
          })
        } */
    var openId = wx.getStorageSync('openId')
    var requestType = options.requestType
    var that = this
    this.setData({
      requestType
    })
    // console.log('options', options)
    //是编辑店铺还是增加店铺
    if (requestType == 'editStore') {
      //使用eventChannel来通信
      const eventChannel = this.getOpenerEventChannel()
      eventChannel.on('getStore', function (data) {
        // console.log(data)
        var store = data.store
        //console.log(store)

        //接着要处理图片的问题
        var fileList = []
        fileList = fileList.concat(store.images)
        for (let index = 0; index < fileList.length; index++) {
          fileList[index] = {
            url: fileList[index],
            status: 'done',
            message: '完成'
          }

        }
        that.setData({
          fileList,
          store
        })
      })
    } else {
      var groupId = options.groupId
      var storesArr
      switch (requestType) {
        case 'Mine':
          storesArr = wx.getStorageSync('storesArr')
          if (storesArr == '') {
            storesArr == []
          }
          break;
        case 'MyGroup':
          var My_GroupsList = wx.getStorageSync('My_GroupsList')
          var index = My_GroupsList.findIndex(item => {
            return item._id == groupId
          })
          storesArr = My_GroupsList[index].stores
          break;
        case 'JoinedGroup':
          //Joined_GroupsList-->groupId-->group-->store_id-->store
          var Joined_GroupsList = wx.getStorageSync('Joined_GroupsList');
          //通过groupId找到是哪个圈子
          var index = Joined_GroupsList.findIndex(item => {
            return item._id == groupId
          })
          //获取这个圈子的所有店铺
          storesArr = Joined_GroupsList[index].stores
          break
        default:
          break;
      }
      // console.log('已存在店铺：', storesArr)
      this.setData({
        groupId,
        requestType,
        stores: storesArr,
        openId,
        //tabList: tabList //.sort(myApi.randomSort)
      })
    }



  },

  createItem: async function (event) {
    myApi.vibrate()
    let that = this
    var store = this.data.store
    /**
     * 店铺内容预处理
     */

    //安全检测评论内容
    if (store.notes.length != 0) {
      var isSafe = await myApi.doMsgSecCheck(store.notes)
      //console.log(isSafe)
      if (!isSafe) {
        wx.showToast({
          title: '个人评论存在不安全内容',
          icon: 'none',
        });
        return
      }
    }
    //名称不能为空
    if (store.name.length == 0) {
      wx.showToast({
        title: '请选择店铺',
        icon: 'none',
      });
      return
    }
    //检查特色菜是否有空项目
    store.special_list.forEach((element, index) => {
      if (element == "") {
        store.special_list.splice(index, 1)
      }
    });
    this.setData({
      store
    })

    that.uploadData()
  },
  //上传图片
  uploadData: function () {
    wx.showLoading({
      title: '安全检测中...',
    })
    var that = this
    var tempFilePaths = this.data.imgList
    let items = [];
    for (const tempFilePath of tempFilePaths) {
      items.push({
        src: tempFilePath
      })
    }
    /**map() 方法返回一个新数组，数组中的元素为原始数组元素调用函数处理后的值。
        map() 方法按照原始数组元素顺序依次处理元素。
        注意： map() 不会对空数组进行检测。
        注意： map() 不会改变原始数组。 */

    const uploadTask = items.map(item => this.uploadPhoto(item.src))

    Promise.all(uploadTask).then(result => {
      //console.log(result)

      let urls = [];
      for (const file of result) {
        urls.push(file.fileID);
      }
      //将fileID换成https链接
      wx.cloud.getTempFileURL({
        fileList: urls
      }).then(res => {
        var tempUrlList = []
        // get temp file URL
        console.log(res.fileList)
        res.fileList.forEach(item => {
          tempUrlList.push(item.tempFileURL)
        })

        that.setData({
          images: tempUrlList
        }, res => {
          wx.hideLoading();
          that.addData()
        })
      })

    }).catch(() => {
      wx.showToast({
        title: '上传图片错误',
        icon: 'error'
      })
    })
  },
  addData: async function () {
    var requestType = this.data.requestType

    //无论是编辑还是创建，创建者都要是该用户
    var creatorId = wx.getStorageSync('openId')
    var creatorName = wx.getStorageSync('nickName')
    var creatorAvatar = wx.getStorageSync('avatarUrl')


    if (requestType == 'editStore') {
      var store = this.data.store
      //编辑过了之后,创建者也变了
      store.creatorId = creatorId
      store.creatorName = creatorName
      store.creatorAvatar = creatorAvatar
      if (this.data.images.length != 0) {
        store.images = store.images.concat(this.data.images)
      }
      var eventChannel1 = this.getOpenerEventChannel()
      eventChannel1.emit('editStore', {
        store: store
      });
      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        });
      }, 500);



    } else {
      var date = new Date()
      var stores = this.data.stores
      this.data.store.creatorId = creatorId
      this.data.store.creatorName = creatorName
      this.data.store.creatorAvatar = creatorAvatar
      this.data.store.createTime = myApi.formatTime(date)
      this.data.store.id = date.getTime()
      this.data.store.images = this.data.images
      //更新数据
      stores.push(this.data.store)
      //判断是添加到哪里
      switch (requestType) {
        case 'Mine':
          await myApi.updateUserInfo(stores, 'stores')
          wx.showToast({
            title: '创建成功！',
            icon: 'success',
            success: res => {
              wx.navigateBack({})
            }
          })
          break;
        default:
          await myApi.updateGroupsList(stores, 'stores', this.data.groupId)
          setTimeout(() => {
            wx.showToast({
              title: '创建成功！',
              icon: 'success',
              success: res => {
                wx.navigateBack({})
              }
            })
          }, 500);
          break;
      }

    }


  },
  DelImg(e) {
    var fileList = this.data.fileList
    var imgList = this.data.imgList
    var requestType = this.data.requestType
    var index = e.detail.index
    var that = this
    console.log(fileList, imgList)
    wx.showModal({
      title: '删除图片',
      content: '确定要删除这张图片？',
      cancelText: '再看看',
      confirmText: '是的',
      success: res => {
        if (res.confirm) {
          if (requestType == 'editStore') {
            var store = this.data.store
            var length = fileList.length - imgList.length //原来就有的图片数目
            fileList.splice(index, 1)
            if (index + 1 <= length) {
              //说明删除的是原来的照片
              store.images.splice(index, 1)

            } else {
              //删除的是新添加的
              if (fileList[index].status == 'done') {
                var len = index - length
                imgList.splice(len, 1);
              }
            }
            that.setData({
              store,
              fileList,
              imgList
            })


          } else {
            if (fileList[index].status == 'done') {
              imgList.splice(index, 1);
            }
            fileList.splice(index, 1)
            this.setData({
              fileList,
              imgList
            })
          }

          //console.log(fileList,imgList)
        }
      }
    })
  },
  uploadPhoto(filePath) {
    return wx.cloud.uploadFile({
      cloudPath: `userFoodImages/${Date.now()}-${Math.floor(Math.random(0, 1) * 10000000)}.png`,
      filePath
    })
  },
})