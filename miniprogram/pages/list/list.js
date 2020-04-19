const app = getApp();
const db = wx.cloud.database()
const store = db.collection('store');
const userInfo = db.collection('userInfo');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    numbers: 0,
    searchNum: 0,
    stores: [],
    defaultSearchValue: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.clearSearch()
    //this.loadData(this.data.numbers);
  },
  loadData: function (numbers) {
    console.log(numbers)
    if (numbers == undefined || numbers == '') {
      numbers = 0
    }
    store.skip(numbers).get().then(res => {
      /**
       * 如果没有数据，就提示没有商户了，并返回。
       */
      if (res.data.length == 0) {
        wx.showToast({
          title: '没有别的店铺了！',
          icon: 'none'
        });
        return;
      }
      if (numbers == 0) {
        this.setData({
          stores: res.data,
          numbers: numbers + res.data.length,
          defaultSearchValue: ''
        });
      } else {
        this.setData({
          stores: this.data.stores.concat(res.data),
          numbers: numbers + res.data.length,
          defaultSearchValue: ''
        });
      }

    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    //this.loadData(this.data.numbers);
  },
  clearSearch() {
    var storesArr = wx.getStorageSync('storesArr')
    this.setData({
      stores: storesArr,
      defaultSearchValue: ''
    })
  },
  storeSearch: function (e) {
    var keywords = e.detail.value
    var storesArr = wx.getStorageSync('storesArr')
    function search(obj) {
      var str = JSON.stringify(obj);
      return str.search(keywords) != -1
    }
    this.setData({
      stores: storesArr.filter(search)
    })



  }
})