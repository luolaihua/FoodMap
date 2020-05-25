// miniprogram/pages/group/createGroup/createGroup.js
const myApi = require('../../../utils/myApi')
const imgUrl = require('../../../utils/imgUrl')
const db = wx.cloud.database()
const groupsList = db.collection('groupsList');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: imgUrl.head,
    nickName: '',
    createTime: '',
    secretKey: '',
    //---用于编辑
    isEdit: false,
    group: {},
    groupIndex: 0,
    isGetMembersDetail:false,
    membersDetailList:[]
  },
  //获取成员详情
  getMembersDetail(){
    var isGetMembersDetail = this.data.isGetMembersDetail
    if(!isGetMembersDetail){
    wx.showLoading({
      title: '加载中',
    });
    // 获取成员详情需要去云函数
    var that = this
    var membersList = this.data.group.membersList
    console.log(membersList)
    wx.cloud.callFunction({
      name: 'checkSafeContent',
      data: {
        requestType: 'getMembersDetail',
        membersList: membersList
      }
    }).then(res=>{
      wx.hideLoading();
      console.log(res)
      that.setData({
        membersDetailList:res.result
      })
    })
    }
    this.setData({
      isGetMembersDetail:!this.data.isGetMembersDetail
    })

  },
  changeAvatar: function () {
    var that = this
    wx.navigateTo({
      url: '../../imageEdit/imageEdit?action=editGroupAvatar',
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据,把头像链接传过来
        getAvatar: function (data) {
          that.setData({
            avatarUrl: data.avatarUrl
          })
          // console.log(data)
        }
      }
    })
  },
  inputName(e) {
    this.setData({
      nickName: e.detail.value
    })
  },
  clearName() {
    this.setData({
      nickName: ''
    })
  },
  refreshCode() {
/*     if (this.data.isEdit) {
      var My_GroupsList = wx.getStorageSync('My_GroupsList');
      myApi.updateGroupsList(newCode, 'secretKey', this.data.group._id)
      My_GroupsList[this.data.groupIndex].secretKey = newCode
      wx.setStorageSync('My_GroupsList', My_GroupsList);
    }
 */
    this.setData({
      secretKey: myApi.getRandomCode(4)
    })
  },
  async createGroup() {
    var nickName = this.data.nickName
    if (nickName == "") {
      wx.showToast({
        title: '名称不能为空',
        icon: 'none',
      });
      return
    }

    var that = this
    var My_GroupsList = wx.getStorageSync('My_GroupsList');
    var isMsgSafe = await myApi.doMsgSecCheck(nickName)
    if (isMsgSafe) {
      var openId = wx.getStorageSync('openId');
      var groupAvatarUrl = this.data.avatarUrl
      //判断是编辑还是创建
      if (this.data.isEdit) {
        var groupIndex = this.data.groupIndex
        var data = {}
        data.nickName = nickName
        data.groupAvatarUrl = groupAvatarUrl
        await myApi.updateGroupsList(data, 'name_avatar', this.data.group._id)
        myApi.updateGroupsList(this.data.secretKey, 'secretKey', this.data.group._id)
        My_GroupsList[groupIndex].secretKey = this.data.secretKey
        My_GroupsList[groupIndex].nickName = nickName
        My_GroupsList[groupIndex].groupAvatarUrl = groupAvatarUrl
        wx.setStorageSync('My_GroupsList', My_GroupsList);

      } else {
        var group = {
          nickName: nickName,
          groupAvatarUrl: groupAvatarUrl,
          createTime: that.data.createTime,
          //圈子初始化时，群主不加入成员列表
          //membersList: [openId],
          membersList: [],
          secretKey: that.data.secretKey,
          stores: []
        }
        groupsList.add({
            // data 字段表示需新增的 JSON 数据
            data: group
          })
          .then(res => {
            console.log(res)
          })
          .catch(console.error)
        My_GroupsList.push(group)
        wx.setStorageSync('My_GroupsList', My_GroupsList)
      }

      //await myApi.updateUserInfo(My_GroupsList,'My_GroupsList')
      wx.navigateBack({
        complete: (res) => {
          wx.showToast({
            title: (that.data.isEdit ? '修改' : '创建') + '成功',
          })
        },
      });

    } else {
      wx.showToast({
        title: '名称不符合安全规范，请重新输入',
        icon: 'none',
      });
    }
    // console.log(isMsgSafe)

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var createTime = myApi.formatTime(new Date)
    var secretKey = myApi.getRandomCode(4)
    this.setData({
      createTime,
      secretKey
    })
    const eventChannel = this.getOpenerEventChannel()
    // 监听getGroupData事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('getGroupData', function (data) {
      console.log(data)
      var group = data.group
      that.setData({
        group,
        groupIndex: data.groupIndex,
        avatarUrl: group.groupAvatarUrl,
        nickName: group.nickName,
        createTime: group.createTime,
        secretKey: group.secretKey,
        isEdit: true
      })

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
    /*     var avatarUrl = wx.getStorageSync('groupAvatarUrl');
        this.setData({
          avatarUrl
        }) */
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