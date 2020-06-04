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
    bar_bgImg1: imgUrl.bar_bg17,
    bar_bgImg2: imgUrl.bar_bg18,
    avatarUrl: imgUrl.head,
    nickName: '',
    createTime: '',
    secretKey: '',
    //---用于编辑
    isEdit: false,
    //---用于鉴别是群主还是成员
    isCreator: true,
    group: {
      nickName: '',
      groupAvatarUrl: imgUrl.head,
      createTime: '',
      //圈子初始化时，群主不加入成员列表
      //membersList: [openId],
      membersList: [],
      secretKey: '',
      stores: [],
      sign: ''
    },
    groupIndex: 0,
    isGetMembersDetail: false,
    membersDetailList: []
  },
  //获取成员详情
 async getMembersDetail() {
    myApi.vibrate()
    var isGetMembersDetail = this.data.isGetMembersDetail
    if (!isGetMembersDetail) {
      wx.showLoading({
        title: '加载中',
      });
      // 获取成员详情需要去云函数
      var that = this
      var membersList = this.data.group.membersList
      console.log(membersList)
      var res = await myApi.getMembersDetail(membersList)
      wx.hideLoading();
      //console.log(res)
      that.setData({
        membersDetailList: res,
        isGetMembersDetail: !that.data.isGetMembersDetail
      })
    } else {
      this.setData({
        isGetMembersDetail: !this.data.isGetMembersDetail
      })
    }


  },
  deleteMember(e) {
    myApi.vibrate()
    console.log(e)
    var that = this
    var index = Number(e.currentTarget.id)
    var group = this.data.group
    var membersDetailList = this.data.membersDetailList
    wx.showModal({
      title: '删除成员',
      content: '是否删除成员' + membersDetailList[index].nickName,
      showCancel: true,
      cancelText: '取消',
      cancelColor: '#000000',
      confirmText: '确定',
      confirmColor: '#3CC51F',
      success: (result) => {
        if (result.confirm) {
          membersDetailList.splice(index, 1)
          group.membersList.splice(index, 1)
          myApi.updateGroupsList(group.membersList, 'membersList', group._id)
          that.setData({
            membersDetailList,
            group
          })
        }
      },
      fail: () => {},
      complete: () => {}
    });

  },
  changeAvatar: function () {
    var that = this
    wx.navigateTo({
      url: '../../imageEdit/imageEdit?action=editGroupAvatar',
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据,把头像链接传过来
        getAvatar: function (data) {
          var group = that.data.group
          group.groupAvatarUrl = data.avatarUrl
          that.setData({
            group,
            //avatarUrl: data.avatarUrl
          })
          // console.log(data)
        }
      }
    })
  },
  inputContent(e) {
    var group = this.data.group
    var id = e.currentTarget.id
    switch (id) {
      case 'name':
        group.nickName = e.detail.value
        break;
      case 'remark':
        group.remark = e.detail.value
        break;
      default:
        group.sign = e.detail.value
        break;
    }

    this.setData({
      group,
      //nickName: e.detail.value
    })
  },
  clearContent(e) {
    myApi.vibrate()
    var group = this.data.group
    var id = e.currentTarget.id
    switch (id) {
      case 'name':
        group.nickName = ''
        break;
      case 'remark':
        group.remark = ''
        break;
      default:
        group.sign = ''
        break;
    }
    /*     if (id == 'name') {
          group.nickName = ''
        } else {
          group.sign = ''
        } */
    this.setData({
      group,
      //nickName: ''
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
    myApi.vibrate()
    var group = this.data.group
    group.secretKey = myApi.getRandomCode(4)
    myApi.requestSendMsg('newMemberToGroup')
    this.setData({
      group,
      //secretKey:group.secretKey
    })
  },
  copyCode() {
    myApi.vibrate()
    wx.setClipboardData({
      data: this.data.group.secretKey,
    });
  },
  async createGroup() {
    myApi.vibrate()
    var group = this.data.group
    //var nickName = this.data.nickName
    if (group.nickName == "") {
      wx.showToast({
        title: '名称不能为空',
        icon: 'none',
      });
      return
    }

    var that = this
    var My_GroupsList = wx.getStorageSync('My_GroupsList');
    var isMsgSafe = await myApi.doMsgSecCheck(group.nickName)
    if (isMsgSafe) {
      //var openId = wx.getStorageSync('openId');
      //var groupAvatarUrl = this.data.avatarUrl
      //判断是编辑还是创建
      if (this.data.isEdit) {
        var groupIndex = this.data.groupIndex
        var data = {}

        //是否创建者
        if (this.data.isCreator) {
          data.nickName = group.nickName
          data.groupAvatarUrl = group.groupAvatarUrl
          await myApi.updateGroupsList(data, 'name_avatar', this.data.group._id)
          myApi.updateGroupsList(group.secretKey, 'secretKey', this.data.group._id)
          myApi.updateGroupsList(group.sign, 'sign', this.data.group._id)
          My_GroupsList[groupIndex] = group
          wx.setStorageSync('My_GroupsList', My_GroupsList);
        } else {
          var groupNameRemarkList = wx.getStorageSync('groupNameRemarkList');
          var Joined_GroupsList = wx.getStorageSync('Joined_GroupsList');
          if (groupNameRemarkList == '') {
            groupNameRemarkList = []
          }
          var remarkObj = {
            groupId: group._id,
            remark: group.remark
          }
          var index = -1
          index = groupNameRemarkList.findIndex(element => {
            return element.groupId == group._id
          });
         // console.log(index)
          if (index == -1) {
            groupNameRemarkList.push(remarkObj)
          } else {
            groupNameRemarkList[index] = remarkObj
          }
          wx.setStorageSync('groupNameRemarkList', groupNameRemarkList);
          Joined_GroupsList[groupIndex] = group
          wx.setStorageSync('Joined_GroupsList', Joined_GroupsList);
        }

      } else {
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
    var group = this.data.group
    group.createTime = myApi.formatTime(new Date)
    group.secretKey = myApi.getRandomCode(4)
    this.setData({
      group
    })
    const eventChannel = this.getOpenerEventChannel()
    // 监听getGroupData事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('getGroupData', function (data) {
     // console.log(data)
      var group = data.group
      that.setData({
        group,
        groupIndex: data.groupIndex,
        isCreator: data.isCreator,
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