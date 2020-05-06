// miniprogram/pages/foodMap/foodMap.js
const config = require('../../config.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mapHeight: app.globalData.MapHeight,
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
      showCompass: true,
      enable3D: true,
      enableOverlooking: true,
      enableSatellite: false,
      enableTraffic: false,
    },
    scale: 14,
    longitude: 113.3245211,
    latitude: 23.10229,
    mapSubKey: config.mapSubKey,
    hideMe: true,
    showAdmin: false,
    isPopping: false,
    animMenu: {},
    animAddStore: {},
    animToList: {},
    animInput: {},
    animCloud: {},
    animAddFriends: {},
    isHideFunction: false,
    stores: [],
    show: false,
    settingList: [{
        name: '指南针',
        value: true
      }, {
        name: '比例尺',
        value: true
      }, {
        name: '3D楼块',
        value: true
      }, {
        name: '定位按钮',
        value: true
      }, {
        name: '实时路况',
        value: false
      }, {
        name: '卫星地图',
        value: false
      },
      {
        name: '开启俯视',
        value: false
      }, {
        name: '气泡窗口',
        value: false
      }, {
        name: '缩放按钮',
        value: false
      }
    ]
  },
  // 控制地图缩放级别
  onIncreaseScale() {
    let scale = this.data.scale;
    console.log(scale)
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
/*     this.data.IncreaseScale = setInterval(() => {
      if (scale >= 19) {
        wx.showToast({
          title: '已是最大级别',
          icon: 'none',
        });
        return;
      }else{
              scale++;
      this.setData({
        scale: scale
      });
      }

    }, 300) */
  },
  onDecreaseScale() {
    let scale = this.data.scale;
    console.log(scale)
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

/*     this.data.DecreaseScale = setInterval(() => {
      if (scale <= 3) {
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

    }, 300) */
  },
/*   end(e) {
    clearInterval(this.data[e.currentTarget.dataset.type]);
  }, */
  switchChange(e) {
    var index = e.currentTarget.dataset.index
    var settingList = this.data.settingList
    var stores = this.data.stores
    settingList[index].value = e.detail.value

    //设置气泡窗口
    if (index == 7) {
      var display = 'BYCLICK'
      if (e.detail.value) {
        display = 'ALWAYS'
      }
      /*       for (let index = 0; index < stores.length; index++) {
             stores[index].callout.display = display    
            } */
      stores.forEach(item => {
        item.callout.display = display
      })

    }
    this.setData({
      settingList,
      stores
    })
    //console.log(e)
  },
  onClose() {
    this.setData({
      show: !this.data.show
    })
  },
  openPopup() {
    this.setData({
      show: !this.data.show
    })
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
      url: '../info/info',
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('getStore', {
          store: store
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    //使用eventChannel来通信
         const eventChannel = this.getOpenerEventChannel()
        eventChannel.on('getStores', function (data) {
          // console.log(data)
          that.setData({
            stores: data.stores,
            defaultScale: config.default_scale
          })
          that.initMap()
        }) 

  },
  initMap() {
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