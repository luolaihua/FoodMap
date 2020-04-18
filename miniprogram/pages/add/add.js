const app = getApp();
const myApi = require('../../utils/myApi')
const db = wx.cloud.database()
const store = db.collection('store');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rateValue: 3.0,
    imgList: [],
    images: [],
    fileList: []
  },
  afterRead(event) {
    var that= this
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
   console.log(imgList)
   console.log(tempFilePath)
    /**
         * 上传文件到云存储
         */
        wx.cloud.uploadFile({
          filePath: tempFilePath,
          cloudPath: "temp/temp.png"
        }).then(res => {
          /**
           * 调用云函数
           */
          console.log("[info]:开始调用云端图片安全检测")
          wx.cloud.callFunction({
            name: "checkSafeContent",
            data: {
              requestType: 'imgSecCheck',
              fileID: res.fileID
            }
          }).then(res => {

            /**
             * 调用检测
             */
            console.log("[info]:云端检测成功 ", res)
            if (res.result) {
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
              })
              return
            }
            console.log(res.result)
          }).catch(err => {
            console.error("[error]:函数调用错误", err)
          })
        }).catch(err => {
          console.error("[error]:文件上传错误", err)
        })


  },
  setRateValue: function (e) {
    this.setData({
      rateValue: e.detail
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},
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
      wx.chooseLocation({
        success: res => {
          that.setData({
            address: res.address,
            latitude: res.latitude,
            longitude: res.longitude,
            name: res.name
          })
        }
      })
    }
  },
  createItem: async function (event) {
    let that = this
    let value = event.detail.value
    let content = value.notes

    //安全检测评论内容
    if (content.length != 0) {

      var isSafe = await myApi.checkMsgSec(content)
      if (!isSafe.result) {
        wx.showToast({
          title: '个人评论存在不安全内容',
          icon: 'none',
        });
        return
      }

    }
    if (value.title.length == 0) {
      wx.showToast({
        title: '请选择店铺',
        icon: 'none',
      });
      return
    }
    console.log(value)
    that.uploadData(value)
  },
  addData: function (value) {
    wx.showLoading({
      title: '安全检测中...',
    })
    store.add({
      data: {
        ...value,
        thumbs_up: 1,
        iconPath: "/images/food.png",
        longitude: this.data.longitude,
        latitude: this.data.latitude,
        label: {
          content: value.title
        },
        images: this.data.images
      }
    }).then(res => {
      wx.hideLoading({
        success: res => {
          wx.showToast({
            title: '创建成功！',
            icon: 'success',
            success: res => {
              wx.navigateBack({})
            }
          })
        }
      });

    }).catch(error => {
      console.error(error);
    })
  },
  ChooseImage() {
    var that = this
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        /**
         * 上传文件到云存储
         */
        var tempFilePaths = res.tempFilePaths
        wx.cloud.uploadFile({
          filePath: tempFilePaths[0],
          cloudPath: "temp/temp.png"
        }).then(res => {
          /**
           * 调用云函数
           */
          console.log("[info]:开始调用云端图片安全检测")
          wx.cloud.callFunction({
            name: "checkSafeContent",
            data: {
              requestType: 'imgSecCheck',
              fileID: res.fileID
            }
          }).then(res => {

            /**
             * 调用检测
             */
            console.log("[info]:云端检测成功 ", res)
            if (res.result) {

              if (that.data.imgList.length != 0) {
                that.setData({
                  imgList: that.data.imgList.concat(tempFilePaths)
                })
              } else {
                that.setData({
                  imgList: tempFilePaths
                })
              }
            } else {
              wx.showToast({
                title: '图片内容未通过安全检测，请重新选择图片',
              })
              return
            }
            console.log(res.result)
          }).catch(err => {
            console.error("[error]:函数调用错误", err)
          })
        }).catch(err => {
          console.error("[error]:文件上传错误", err)
        })


      }
    });
  },
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },
  DelImg(e) {
    wx.showModal({
      title: '删除图片',
      content: '确定要删除这张图片？',
      cancelText: '再看看',
      confirmText: '是的',
      success: res => {
        if (res.confirm) {
          this.data.fileList.splice(e.detail.index,1)
          this.data.imgList.splice(e.detail.index, 1);
          this.setData({
            fileList:this.data.fileList,
            imgList: this.data.imgList
          })
        }
      }
    })
  },
  uploadData: function (value) {
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
        wx.hideLoading();
        this.addData(value)
      })
    }).catch(() => {
      wx.showToast({
        title: '上传图片错误',
        icon: 'error'
      })
    })
  },
  uploadPhoto(filePath) {
    return wx.cloud.uploadFile({
      cloudPath: `userFoodImages/${Date.now()}-${Math.floor(Math.random(0, 1) * 10000000)}.png`,
      filePath
    })
  },
})