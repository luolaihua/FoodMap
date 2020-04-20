const app = getApp();
const myApi = require('../../utils/myApi')
const db = wx.cloud.database()
const store = db.collection('store');
const userInfo = db.collection('userInfo')
var tabList=['火锅', '麻辣烫', '奶茶', '烧烤', '串串', '水果','自助', '海鲜', '农家乐', '烤鸭', '烤鸡', '烤鱼','小吃', '烧饼', '炒粉']
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rateValue: 3.0,
    imgList: [],
    images: [],
    fileList: [],
    address: '',
    latitude: '',
    longitude: '',
    name: '',
    stores: [],
    openId: '',
    notes:'',
    price_per: 50,
    tabList: [],
    tagList:[],
    colorList:["#f2826a","#7232dd","#ff4500"],
    isShow: true
  },
  inputNotes(e){
    this.setData({
      notes:e.detail.value
    })
  },
  inputName(e){
    this.setData({
      name:e.detail.value
    })
  },
  tagClose: function (e) {
    var index = Number(e.currentTarget.id)
    var tagList = this.data.tagList
    tagList.splice(index,1)
    this.setData({
      tagList
    })
  },
  tabClick(e) {
    var index = e.detail.index
    var tagList = this.data.tagList
    var tabList = this.data.tabList
    if(tagList.length>2){
      tagList.shift()
    }
    tagList.push(tabList[index])
    this.setData({
      tagList
    })
  },
  //price_per 人均消费
  onDrag(event) {
    this.setData({
      price_per: event.detail.value
    });
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
  //星星评分
  setRateValue: function (e) {
    this.setData({
      rateValue: e.detail
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    var storesArr = wx.getStorageSync('storesArr')
    if(storesArr==''){
      storesArr==[]
    }
    var openId = wx.getStorageSync('openID')
    console.log(storesArr)
    this.setData({
      stores: storesArr,
      openId,
      tabList:tabList.sort(myApi.randomSort)
    })
  },
  chooseLocation: function (event) {
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
          name= (name==''?res.name:name)
          that.setData({
            address: res.address,
            latitude: res.latitude,
            longitude: res.longitude,
            name
          })
        }
      })
    }
  },
  createItem: async function (event) {
    let that = this
    var name = this.data.name
    let content = this.data.notes

    //安全检测评论内容
    if (content.length != 0) {
      var isSafe = await myApi.doMsgSecCheck('content')
      //console.log(isSafe)
      if (!isSafe) {
        wx.showToast({
          title: '个人评论存在不安全内容',
          icon: 'none',
        });
        return
      }

    }
    if (name.length == 0) {
      wx.showToast({
        title: '请选择店铺',
        icon: 'none',
      });
      return
    }
    that.uploadData()
  },
  uploadData: function () {
    wx.showLoading({
      title: '安全检测中...',
    })
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
      console.log(result)

      let urls = [];
      for (const file of result) {
        urls.push(file.fileID);
      }
      this.setData({
        images: urls
      }, res => {
        this.addData()
      })
    }).catch(() => {
      wx.showToast({
        title: '上传图片错误',
        icon: 'error'
      })
    })
  },
  addData:async function () {
    var stores = this.data.stores
    var price_per = this.data.price_per * 2
    var keywords = this.data.tagList.toString()
    var name = this.data.name
    var address = this.data.address
    var rateValue = this.data.rateValue
    var notes = this.data.notes
    var storeData = {
      id:new Date().getTime(),
      address:address,
      name:name,
      rateValue:rateValue,
      price_per: price_per,
      keywords:keywords,
      notes:notes,
      thumbs_up: 1,
      iconPath: "/images/food.png",
      longitude: this.data.longitude,
      latitude: this.data.latitude,
      label: {
        content: name
      },
      images: this.data.images
    }
    //更新数据
    stores.push(storeData)
   await myApi.updateStore(stores)
   wx.showToast({
    title: '创建成功！',
    icon: 'success',
    success: res => {
      wx.navigateBack({})
    }
  })
  },
  DelImg(e) {
    var fileList = this.data.fileList
    var imgList = this.data.imgList
    wx.showModal({
      title: '删除图片',
      content: '确定要删除这张图片？',
      cancelText: '再看看',
      confirmText: '是的',
      success: res => {
        if (res.confirm) {
          if (fileList[e.detail.index].status == 'done') {
            imgList.splice(e.detail.index, 1);
          }
          fileList.splice(e.detail.index, 1)
          this.setData({
            fileList,
            imgList
          })
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