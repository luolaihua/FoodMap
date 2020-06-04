// miniprogram/pages/group/showGroup/showGroup.js
const myApi = require('../../../utils/myApi')
const imgUrl = require('../../../utils/imgUrl')
/**
 * 美食动态删除权限：群主可以删除所有，成员只能删除自己发的
 * 美食动态编辑权限：所有人只能编辑自己发的
 */
//TODO 当用户改了头像和名字，动态里的创建人还是旧数据，好友列表那里也是旧数据
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tag: '',
    stores: [],
    defaultImg: imgUrl.share3,
    bar_bgImg: imgUrl.bar_bg4,
    groupName: '',
    groupId: '',
    GroupsList: [],
    group: {},
    type: 'MyGroup',
    isStar: true,
    //---------------菜单动画
    isPopping: false,
    animMenu: {},
    animToAdd: {},
    animToListAdd: {},
    animToMap: {},
  },
  orderList(e) {
    var tag = e.currentTarget.id
    var group = this.data.group
    if (this.data.orderTag == tag) {
      tag = ''
      var temp = []
      group.stores = temp.concat(temp, this.data.stores)
    } else {
      group.stores = myApi.sortStoresByTag(group.stores, tag)
    }
    this.setData({
      orderTag: tag,
      group
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
    var animToAdd = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-out'
    })
    var animToListAdd = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-out'
    })
    var animToMap = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-out'
    })

    animMenu.rotateZ(180).step();
    animToAdd.translate(0, -60).opacity(1).step();
    animToListAdd.translate(0, -140).opacity(1).step();
    animToMap.translate(0, -220).opacity(1).step();
    this.setData({
      animMenu: animMenu.export(),
      animToAdd: animToAdd.export(),
      animToListAdd: animToListAdd.export(),
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
    var animToAdd = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-out'
    })
    var animToListAdd = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-out'
    })
    var animToMap = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-out'
    })
    animMenu.rotateZ(0).step();
    animToAdd.translate(0, 0).opacity(0).step();
    animToListAdd.translate(0, 0).opacity(0).step();
    animToMap.translate(0, 0).opacity(0).step();
    this.setData({
      animMenu: animMenu.export(),
      animToAdd: animToAdd.export(),
      animToListAdd: animToListAdd.export(),
      animToMap: animToMap.export(),
      isPopping: false
    })
  },
  toFoodMap() {
    myApi.vibrate()
    var stores = this.data.group.stores
    wx.navigateTo({
      url: '../../foodMap/foodMap',
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('getStores', {
          stores: stores
        })
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var groupId = options.groupId
    var type = options.type
    console.log(options)
    wx.showLoading({
      title: '加载中',
    });
    //type = 'my'
    /*     if (type == 'my') {
          GroupsList = wx.getStorageSync('My_GroupsList');
          var index = GroupsList.findIndex(item => {
            return item._id == groupId
          })
          group = GroupsList[index]
          for (let index = 0; index < group.stores.length; index++) {
           
            var id = group.stores[index].id+''
            console.log(id)
            if(starStoreIdList.indexOf(group.stores[index].id+'')!=-1){
              group.stores[index].isStar=true
            }else{
              group.stores[index].isStar=false
            }
            
          }
        } else {
          GroupsList = wx.getStorageSync('Joined_GroupsList');
        } */
    // console.log(group.stores)
    this.setData({
      groupId,
      type
    })


  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    var GroupsList = []
    var group = []

    var starStoreIdList = wx.getStorageSync('starStoreIdList');
    if (this.data.type == 'MyGroup') {
      GroupsList = wx.getStorageSync('My_GroupsList');
    } else {
      GroupsList = wx.getStorageSync('Joined_GroupsList');
    }

    //根据groupId找到圈子
    var index = GroupsList.findIndex(item => {
      return item._id == this.data.groupId
    })
    group = GroupsList[index]

    //判断是否被收藏 
    for (let index = 0; index < group.stores.length; index++) {
      if (starStoreIdList.indexOf(group.stores[index].id + '') != -1) {
        group.stores[index].isStar = true
      } else {
        group.stores[index].isStar = false
      }
    }
    var openId = wx.getStorageSync('openId');
    var avatarUrl = wx.getStorageSync('avatarUrl');
    var nickName = wx.getStorageSync('nickName');
    //更新动态里的用户头像和昵称,有店铺的时候才做更新
    if (group.stores.length > 0) {
      var membersList = group.membersList
      if(membersList.length>0){
        var membersDetail = await myApi.getMembersDetail(membersList)
        console.log(membersDetail)
      }
      group.stores.forEach((store) => {
        //先判断群主的信息
        if(store.creatorId==openId){
          store.creatorName = nickName
          store.creatorAvatar = avatarUrl
        }
        membersList.forEach((memberId,index)=>{
            if(memberId==store.creatorId){
              store.creatorName = membersDetail[index].nickName
              store.creatorAvatar = membersDetail[index].avatarUrl
            }
        })
          
      });

    }
 
    //店铺数据单独拿出来放在一个数组中备用
    var stores = []
    //stores = stores.concat([], group.stores)
    // console.log(group)
    wx.hideLoading();
    this.setData({
      GroupsList,
      group,
      stores: stores.concat([], group.stores)
    })
    myApi.updateGroupsList(group.stores,'stores',group._id)

  },
  toAdd() {
    myApi.vibrate()
    wx.navigateTo({
      url: '../../add/add?groupId=' + this.data.groupId + '&requestType=' + this.data.type
    });
  },
  toAddList() {
    myApi.vibrate()
    wx.navigateTo({
      url: '../../list/list?groupId=' + this.data.groupId + '&friendsIndex=' + this.data.type
    });
  },
  toInfo(e) {
    var index = e.currentTarget.dataset.index
    var store = this.data.group.stores[index]
    var groupId = this.data.groupId
    var secretKey = this.data.group.secretKey
    wx.navigateTo({
      url: '../../info/info?friendsIndex=' + this.data.type,
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('getStore', {
          store: store,
          groupId: groupId,
          secretKey: secretKey
        })
      }
    });
  },
  deleteItem(e) {
    var index = e.currentTarget.dataset.index
    var groupId = this.data.groupId
    var group = this.data.group
    var that = this
    var type = this.data.type

    wx.showModal({
      title: '是否删除？',
      content: group.stores[index].name,
      showCancel: true,
      cancelText: '取消',
      cancelColor: '#000000',
      confirmText: '确定',
      confirmColor: '#3CC51F',
      success: (result) => {
        if (result.confirm) {
          function deleteGroup() {
            group.stores.splice(index, 1)
            myApi.updateGroupsList(group.stores, 'stores', groupId)
            wx.showToast({
              title: '删除成功',
              duration: 800,
            });
            that.setData({
              group
            })
          }
          //需要进行用户鉴权,群主都可删
          if (type == 'MyGroup') {
            deleteGroup()
          } else {
            var openId = wx.getStorageSync('openId');
            //当前用户id等于店铺创建者id才可删除
            if (openId == group.stores[index].creatorId) {
              deleteGroup()
            } else {
              wx.showToast({
                title: '无权限删除',
                icon: 'none'
              });
            }
          }

        }
      },
      fail: () => {},
      complete: () => {}
    });
    console.log(e)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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