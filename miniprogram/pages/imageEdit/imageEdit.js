// miniprogram/pages/imageEdit/imageEdit.js
const imgUrl = require('../../utils/imgUrl')
const myApi = require('../../utils/myApi')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tempPath: '',
    addImage: 'https://6c75-luo-r5nle-1301210100.tcb.qcloud.la/images/addImage2.png?sign=b0d7c542219248dd1f7d4880f30f89af&t=1588127495',
    isSuccess: false,
    backUrl:'https://6c75-luo-map-5mmfi-1301569935.tcb.qcloud.la/appImage/back.png?sign=e57d26b9780bae4156c3d5104b2168b9&t=1588148087',
    upUrl: 'https://6c75-luo-r5nle-1301210100.tcb.qcloud.la/images/up_circle.png?sign=1b2b10d086a5dfb8f93c62dea574ecba&t=1586520908',
    downUrl: 'https://6c75-luo-r5nle-1301210100.tcb.qcloud.la/images/down_circle.png?sign=ce154123a2bed97a4d5e77a3e6a465b9&t=1586520998',
    leftUrl: 'https://6c75-luo-r5nle-1301210100.tcb.qcloud.la/images/left_circle.png?sign=5e751fdb4d15b657d3ca5b51a204825b&t=1586521012',
    rightUrl: 'https://6c75-luo-r5nle-1301210100.tcb.qcloud.la/images/right_circle.png?sign=0d8c196fb08aec0f59869b4c19c096aa&t=1586521023',
    okUrl: 'https://6c75-luo-r5nle-1301210100.tcb.qcloud.la/images/ok.png?sign=1d012b65fa64227d239eabc657bea8bf&t=1586521037',
    addImageUrl: 'https://6c75-luo-r5nle-1301210100.tcb.qcloud.la/images/addImage.png?sign=2c6245180cef89a78d53c13bbbf70c82&t=1586521046',
    zoomInUrl: 'https://6c75-luo-r5nle-1301210100.tcb.qcloud.la/images/zoom_in.png?sign=1ed5243b897a0c43d862e27d615d883f&t=1586521699',
    zoomOutUrl: 'https://6c75-luo-r5nle-1301210100.tcb.qcloud.la/images/zoomOut.png?sign=d3d4f8839cee1b710a5b81c000c27211&t=1586521720',
    rotateUrl: 'https://6c75-luo-r5nle-1301210100.tcb.qcloud.la/images/rotate.png?sign=0fcfc5811537285156155c5e7c1b84ab&t=1586521744',
    src: '',
    width: 300, //宽度
    height: 300, //高度
    max_width: 400,
    max_height: 400,
    disable_rotate: true, //是否禁用旋转
    disable_ratio: false, //锁定比例
    limit_move: true, //是否限制移动

    action:'editUserAvatar'

  },
  back(){
    myApi.vibrate()
    wx.navigateBack({
      delta: 1
    });
  },
  submit() {
    myApi.vibrate()
    var action = this.data.action
    var that = this
    var openId = wx.getStorageSync('openId');
    this.cropper.getImg((obj) => {
      var imgSrc = obj.url
      console.log(imgSrc)
      // app.globalData.imgSrc = obj.url;
      /**
       * 上传文件到云存储
       */
      wx.showLoading({
        title: '安全检测中',
      })
      wx.cloud.uploadFile({
        filePath: imgSrc,
        cloudPath: "temp/TEMP_"+openId+".png"
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
          wx.hideLoading();
          /**
           * 调用检测
           */
          console.log("[info]:云端检测成功 ", res)
          if (res.result) {
            console.log(action)
            switch(action){
              case 'editUserAvatar':
                that.updateUserAvatar(imgSrc,openId)
                break
                case 'editGroupAvatar':
                that.setGroupAvatar(imgSrc,openId)
                break
            }
            //wx.setStorageSync('avatarUrl', imgSrc)
          } else {
            wx.showToast({
              title: '图片内容未通过安全检测，请重新选择图片',
            })
          }
          console.log(res.result)
        }).catch(err => {
          wx.hideLoading();
          console.error("[error]:函数调用错误", err)
        })
      }).catch(err => {
        wx.hideLoading();
        console.error("[error]:文件上传错误", err)
      })





    });
  },
  setGroupAvatar(imgSrc,openId){
    var that = this
    //TODO 头像缓存垃圾没有清理
    wx.cloud.uploadFile({
      filePath: imgSrc,
      cloudPath: "groupAvatar/AVATAR_"+new Date().getTime()+'.png'
    }).then(res => {
      console.log('groupAvatarUrl',res)
      const eventChannel = that.getOpenerEventChannel()
      eventChannel.emit('getAvatar', {avatarUrl: res.fileID});
      // wx.setStorageSync('groupAvatarUrl', res.fileID);
        wx.navigateBack({
          complete: (res) => {
            wx.showToast({
              title: '头像设置成功',
            })
          },
        })
    })
  },
  updateUserAvatar(imgSrc,openId){
    wx.cloud.uploadFile({
      filePath: imgSrc,
      cloudPath: "userAvatar/AVATAR_"+new Date().getTime()+'.png'
    }).then(res => {
        console.log('avatar',res)
        myApi.updateUserInfo(res.fileID,'avatarUrl')
       // wx.setStorageSync('avatarUrl', imgSrc)
        wx.navigateBack({
          complete: (res) => {
            wx.showToast({
              title: '头像设置成功',
            })
          },
        })
    })
  },
  onLoad: function (options) {
    var action = options.action
    console.log('options',options)
    console.log('options',action)
    if(action!=''&&action!=undefined){
      this.setData({
        action
      })
    }
    this.cropper = this.selectComponent("#image-cropper");
    this.cropper.upload(); //上传图片
  },
  cropperload(e) {
    console.log('cropper加载完成');
  },
  loadimage(e) {
    wx.hideLoading();
    console.log('图片');
    this.cropper.imgReset();
  },
  clickcut(e) {
    console.log(e.detail);
    //图片预览
    wx.previewImage({
      current: e.detail.url, // 当前显示图片的http链接
      urls: [e.detail.url] // 需要预览的图片http链接列表
    })
  },
  upload() {
    myApi.vibrate()
    let that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        wx.showLoading({
          title: '加载中',
        })
        const tempFilePaths = res.tempFilePaths[0];
        //重置图片角度、缩放、位置
        that.cropper.imgReset();
        that.setData({
          src: tempFilePaths
        });
      }
    })
  },
  setWidth(e) {
    this.setData({
      width: e.detail.value < 10 ? 10 : e.detail.value
    });
    this.setData({
      cut_left: this.cropper.data.cut_left
    });
  },
  setHeight(e) {
    this.setData({
      height: e.detail.value < 10 ? 10 : e.detail.value
    });
    this.setData({
      cut_top: this.cropper.data.cut_top
    });
  },
  switchChangeDisableRatio(e) {
    //设置宽度之后使剪裁框居中
    this.setData({
      disable_ratio: e.detail.value
    });
  },
  setCutTop(e) {
    this.setData({
      cut_top: e.detail.value
    });
    this.setData({
      cut_top: this.cropper.data.cut_top
    });
  },
  setCutLeft(e) {
    this.setData({
      cut_left: e.detail.value
    });
    this.setData({
      cut_left: this.cropper.data.cut_left
    });
  },
  switchChangeDisableRotate(e) {
    //开启旋转的同时不限制移动
    if (!e.detail.value) {
      this.setData({
        limit_move: false,
        disable_rotate: e.detail.value
      });
    } else {
      this.setData({
        disable_rotate: e.detail.value
      });
    }
  },
  switchChangeLimitMove(e) {
    //限制移动的同时锁定旋转
    if (e.detail.value) {
      this.setData({
        disable_rotate: true
      });
    }
    this.cropper.setLimitMove(e.detail.value);
  },
  switchChangeDisableWidth(e) {
    this.setData({
      disable_width: e.detail.value
    });
  },
  switchChangeDisableHeight(e) {
    this.setData({
      disable_height: e.detail.value
    });
  },

  rotate() {
    myApi.vibrate()
    //在用户旋转的基础上旋转90°
    this.cropper.setAngle(this.cropper.data.angle += 90);
  },
  top() {
    myApi.vibrate()
    this.data.top = setInterval(() => {

      this.cropper.setTransform({
        y: -3
      });
    }, 1000 / 60)
  },
  bottom() {
    myApi.vibrate()
    this.data.bottom = setInterval(() => {

      this.cropper.setTransform({
        y: 3
      });
    }, 1000 / 60)
  },
  left() {
    myApi.vibrate()
    this.data.left = setInterval(() => {

      this.cropper.setTransform({
        x: -3
      });
    }, 1000 / 60)
  },
  right() {
    myApi.vibrate()
    this.data.right = setInterval(() => {

      this.cropper.setTransform({
        x: 3
      });
    }, 1000 / 60)
  },
  narrow() {
    myApi.vibrate()
    this.data.narrow = setInterval(() => {

      this.cropper.setTransform({
        scale: -0.02
      });
    }, 1000 / 60)
  },
  enlarge() {
    myApi.vibrate()
    this.data.enlarge = setInterval(() => {

      this.cropper.setTransform({
        scale: 0.02
      });
    }, 1000 / 60)
  },
  end(e) {
    clearInterval(this.data[e.currentTarget.dataset.type]);
  },

  chooseImage: function (e) {
    var tempPath, that = this
    wx.chooseImage({
      count: 1, // 最多可以选择的图片张数，默认9
      sizeType: ['compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function (res) {
        console.log(res)
        tempPath = res.tempFilePaths[0]
        wx.getImageInfo({
          src: tempPath,
          success: (result) => {
            console.log(result)
            wx.getFileSystemManager().readFile({
              filePath: tempPath, //选择图片返回的相对路径
              encoding: 'base64', //编码格式
              success: res => { //成功的回调
                wx.cloud.callFunction({
                  name: 'databaseTest',
                  data: {
                    //path: 'pictures/' + util.vcode(new Date())+index+'.png',
                    requestType: 'airCropImage',
                    file: res.data
                  },
                  success(_res) {
                    console.log(_res)
                  },
                  fail(_res) {
                    console.log(_res)
                  }
                })
              }
            })
          },
          fail: () => {},
          complete: () => {}
        });
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })

  },
  /**
   * 由于此数据仅在逻辑层使用，因此定义一个tempData 进行存储
   */
  tempData: {
    path: null,
  },
  onClick() {
    var that = this
    /**
     * 选择文件
     */
    wx.chooseImage({
      count: 1, // 最多可以选择的图片张数，默认9
      sizeType: ['compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: res => {
        wx.showLoading({
          title: "智能裁剪中",
          mask: true,
        });
        /**
         * 获取文件路径，并传递给 tempData
         */
        let file = res.tempFiles[0].path
        this.tempData.path = file
        console.log("[info]:开始上传文件")
        /**
         * 上传文件到云存储
         */
        wx.cloud.uploadFile({
          filePath: file,
          cloudPath: "test1.jpg"
        }).then(res => {
          /**
           * 调用云函数
           */
          console.log("[info]:开始调用云端裁剪")
          wx.cloud.callFunction({
            name: "databaseTest",
            data: {
              requestType: 'airCropImage',
              file: res.fileID
            }
          }).then(res => {
            wx.hideLoading();
            /**
             * 调用裁剪
             */
            console.log("[info]:云端裁剪成功 ", res)
            console.log(res.result)
            this.crop(res.result);
            this.setData({
              isSuccess: true
            })
          }).catch(err => {
            console.error("[error]:函数调用错误", err)
          })
        }).catch(err => {
          console.error("[error]:文件上传错误", err)
        })
      },
      fail: err => {
        console.error("[error]:文件选择错误", err)
      }
    })
  },
  crop(cropOps) {
    /**
     * 获取 Context
     */
    let ctx = wx.createCanvasContext('aiCrop', this);
    /**
     * 判断是否成功裁剪
     */
    if (cropOps.results.length == 0) {
      return
    }
    /**
     * 计算裁剪的值
     */
    let crop = cropOps.results[0];
    let width = crop.cropRight - crop.cropLeft
    let height = crop.cropBottom - crop.cropTop
    /**
     * 绘制图像
     */
    ctx.drawImage(this.tempData.path, crop.cropLeft, crop.cropTop, width, height, 0, 0, 300, 300);
    ctx.draw()
    /* setTimeout(res=>{
       this.save()
    },1000) */

  },
  //保存到手机相册
  save: function () {
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: 300, //导出图片的宽
      height: 300, //导出图片的高
      destWidth: 300 * 750 / wx.getSystemInfoSync().windowWidth, //绘制canvas的时候用的是px， 这里换算成rpx ，导出后非常清晰
      destHeight: 300 * 750 / wx.getSystemInfoSync().windowWidth, //同上 px 换算成 rpx
      canvasId: 'aiCrop',
      success: function (res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
        })
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000
        })
      },
      fail: function (res) {
        wx.showToast({
          title: '系统繁忙，请重试',
          icon: 'success',
          duration: 2000
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
}) 
