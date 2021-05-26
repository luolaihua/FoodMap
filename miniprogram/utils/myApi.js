const db = wx.cloud.database()
const _ = db.command
const app = getApp()
const templateIds = {
  //viewList_id: 'V09GAzDTujaHcRj78xkwlsVtWM9H0iZ0GK2OwU7ZV5M',
  viewList_id: 'subAzhXR7X1gWqXc759FsAo7Pi_j35vaxF3zqDbFdmc',
  //新成员加入通知
  newMembersToGroup_id: 'mBNg9kaQNWvgPPY9uraJix1D43Fvci8EoqwaOuSEg6E'
}

function vibrate() {
  if (app.globalData.isVibrate) {
    wx.vibrateShort({
      complete: (res) => {},
    })
  }
}

function checkMsgSec(content) {
  return wx.cloud.callFunction({
    name: 'checkSafeContent',
    data: {
      requestType: 'msgSecCheck',
      content: content
    }
  })
}

function checkImgSec(filePath) {
  /**
   * 上传文件到云存储
   */
  wx.cloud.uploadFile({
    filePath: filePath,
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
      if (res.result) {} else {
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
/**
 * 珊瑚图片内容安全
 */
async function doImgSecCheck(ImageUrl, type) {
  if (type == 'local') {
    // 用 CDN 方法标记要上传并转换成 HTTP URL 的文件
    ImageUrl = await new wx.serviceMarket.CDN({
      type: 'filePath',
      filePath: ImageUrl,
    })
  }
  var res = await wx.serviceMarket.invokeService({
    service: 'wxee446d7507c68b11',
    api: 'imgSecCheck',
    data: {
      "Action": "ImageModeration",
      // "Scenes": ["PORN", "POLITICS", "TERRORISM", "TEXT"],
      "Scenes": ["PORN", "POLITICS", "TERRORISM"],
      "ImageUrl": ImageUrl,
      "ImageBase64": "",
      "Config": "",
      "Extra": ""
    },
  })
  //console.log(res)
  if (Object.keys(res.data.Response).length < 3) {
    return true
  } else {
    var POLITICS = res.data.Response.PoliticsResult.Suggestion == "PASS" ? true : false
    var PORN = res.data.Response.PornResult.Suggestion == "PASS" ? true : false
    var TERRORISM = res.data.Response.TerrorismResult.Suggestion == "PASS" ? true : false
    // var TEXT = res.data.Response.TextResult.Suggestion == "PASS" ? true : false
    //console.log('POLITICS, PORN, TERRORISM, TEXT', POLITICS, PORN, TERRORISM, TEXT)
    console.log('POLITICS, PORN, TERRORISM', POLITICS, PORN, TERRORISM)
    if (POLITICS && PORN && TERRORISM) {

      console.log('图片内容安全')
      return true
    } else {
      console.log('图片内容不安全')
      return false
    }
  }

}
/**
 * 珊瑚文本内容安全
 */
async function doMsgSecCheck(content) {
  var res = await wx.serviceMarket.invokeService({
    service: 'wxee446d7507c68b11',
    api: 'msgSecCheck',
    data: {
      "Action": "TextApproval",
      "Text": content
    },
  })
  // console.log(res.data.Response.EvilTokens)
  if (res.data.Response.EvilTokens.length == 0) {
    console.log('内容安全')
    return true
  } else {
    console.log("内容不安全")
    return false
  }

}
/**
 * 安全检测头像和网名
 * @param {*头像链接} avatarUrl 
 * @param {*网名} nickName 
 */
async function checkImgAndMsg(avatarUrl, nickName) {
  //安全检测
  var res1 = await doImgSecCheck(avatarUrl, 'cloud')
  var res2 = await doMsgSecCheck(nickName)
  return res1 && res2
}


/**
 * 用于打乱数组元素
 * @param {*} a 
 * @param {*} b 
 */
function randomSort(a, b) {
  return Math.random() > 0.5 ? -1 : 1
}

/**
 * 获取随机码
 * @param {*随机码的长度} num 
 */
function getRandomCode(num) {
  var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  var code = "";
  for (var i = 0; i < num; i++) {
    var id = parseInt(Math.random() * 61);
    code += chars[id];
  }
  return code;
}
/**
 * 输出格式化时间
 * @param {*Date对象} date 
 */
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
/**
 * 输出格式化日期
 * @param {*Date对象} date 
 */
function formatDate(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  return [year, month, day].map(formatNumber).join('-');
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function dateToString(now) {
  var year = now.getFullYear();
  var month = (now.getMonth() + 1).toString();
  var day = (now.getDate()).toString();
  if (month.length == 1) {
    month = "0" + month;
  }
  if (day.length == 1) {
    day = "0" + day;
  }
  var dateTime = year + "-" + month + "-" + day;
  return dateTime;
}

function makeItemTop(arr, index) {
  var item = arr.slice(index, index + 1)[0]
  arr.splice(index, 1)
  arr.unshift(item)
  return arr
}
/**
 * 生成海报
 * 
 * @param {*画布ID名} canvasName 
 * @param {*标题} title 
 * @param {*内容数组} textArr 
 * @param {*字体颜色数组} colorArr 
 * @param {*字体样式数组} fontArr 
 * @param {*字体大小数组} sizeArr 
 * @param {*总数量} num 
 * @param {*一行数量--最大为5} rowNum 
 * @param {*同行中词的距离} distance 
 * @param {*第二行与第一行隔多少距离} spacing 
 * @param {*画布宽度} canvasWidth 
 * @param {*画布高度} canvasHeight 
 * @param {*中间宽度} midWidth 
 * @param {*中间高度} midHeight 
 * @param {*二维码图片路径} imgUrl 
 */
function makePosterImageCanvas(canvasName, title, textArr, colorArr, fontArr, sizeArr, num, rowNum, distance, spacing, canvasWidth, canvasHeight, midWidth, midHeight, imgUrl) {
  var that = this;
  var contentArr = [];
  for (var a = 0; a < num; a++) {
    var neirong = arrayRandomTakeOne(textArr); //内容
    contentArr.push(neirong);
  }
  //console.log(contentArr);

  const ctx = wx.createCanvasContext(canvasName)
  ctx.clearRect(0, 0, canvasWidth, canvasHeight) //清除画布区域内容
  ctx.setFillStyle('white') //填充背景色--白色
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  var daxiaoArr = [];
  for (var i = 0; i < contentArr.length; i++) {
    var hang = parseInt(i / rowNum) + 1; //第几行
    var hangDj = i % rowNum; //每行第几
    var yanse = arrayRandomTakeOne(colorArr); //颜色
    var ziti = arrayRandomTakeOne(fontArr); //字体
    var daxiao = arrayRandomTakeOne(sizeArr); //大小
    daxiaoArr.push(daxiao);
    //console.log(yanse, ziti, daxiao);

    var rowStart = 0; //水平起点
    var columnStart = hang * spacing; //竖直起点

    if (hangDj == 0) {
      rowStart = 0;
    } else if (hangDj > 0) {
      for (var e = 1; e < hangDj + 1; e++) {
        rowStart = rowStart + contentArr[i - e].length * daxiaoArr[i - e];
      }
      rowStart = rowStart + distance * hangDj;
    }
    //console.log('起点', rowStart);

    ctx.fillStyle = yanse; //字体颜色
    ctx.font = ziti + ' small-caps normal ' + daxiao + 'px Arial';
    ctx.fillText(contentArr[i], rowStart, columnStart)
  }

  ctx.setFillStyle('white') //填充背景色--白色
  ctx.fillRect((canvasWidth - midWidth) / 2, (canvasHeight - midHeight) / 2, midWidth, midHeight)

  var titleArr = [];
  for (var n = 0; n < title.length; n++) {
    titleArr.push(title[n]);
  }
  //console.log(titleArr);

  var titleHeight = midHeight - 10 - midWidth;
  var titleDaxiao = parseInt(titleHeight / title.length);
  //console.log(titleHeight, titleDaxiao);

  titleDaxiao = titleDaxiao > 50 ? 50 : titleDaxiao;

  for (var m = 0; m < titleArr.length; m++) {
    ctx.fillStyle = '#000000'; //字体颜色
    ctx.font = 'normal small-caps normal ' + titleDaxiao + 'px Arial';
    ctx.setTextAlign('center')
    ctx.fillText(titleArr[m], canvasWidth / 2, (canvasHeight - midHeight) / 2 + 5 + titleDaxiao * (m + 1))
  }

  ctx.drawImage(imgUrl, (canvasWidth - midWidth) / 2 + 5, canvasHeight - (midWidth + (canvasHeight - midHeight) / 2), midWidth - 10, midWidth - 10) //二维码
  /* ctx.draw(false,function(){
     wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: data.canvasWidth,
        height: data.canvasHeight,
        canvasId: 'shareCanvas',
        success: function (res) {
           console.log(res.tempFilePath);

           setData({
              showCanvasFlag: false,
              isShowPoster: true,
              posterUrl: res.tempFilePath,
           })
           wx.hideLoading();
        }
     })
  }) */
  wx.drawCanvas({
    canvasId: canvasName,
    actions: ctx.getActions()
  })
}
/**
 * 数组随机取出一个数
 * @param {*} array 
 */
function arrayRandomTakeOne(array) {
  var index = Math.floor((Math.random() * array.length + 1) - 1);
  return array[index];
}
/**
 * 生成小程序码
 * @param {*场景值} scene 
 */
function getQrCodeUrl(scene) {
  return wx.cloud.callFunction({
    name: 'checkSafeContent',
    data: {
      requestType: 'createQrCode',
      scene: scene
    }
  })
}
/**
 * 
 * @param {*需要更新的数据} data 
 * @param {*数据的类型} type 
 */
async function updateUserInfo(data, type) {
  const userInfo = db.collection('userInfo')
  var openId = wx.getStorageSync('openId');
  //更新数据
  var updateData = {}
  switch (type) {
    case 'stores':
      updateData.stores = data
      wx.setStorageSync('storesArr', data)
      break;
    case 'nickName':
      updateData = {
        info: {
          nickName: data
        }
      }
      wx.setStorageSync('nickName', data)
      break;
      /*     case 'avatarUrl':
            var res = await wx.cloud.getTempFileURL({
              fileList: [data],
            })
            console.log(res)
            updateData = {
              info: {
                avatarUrl: res.fileList[0].tempFileURL
              }
            }
            //用fileID做图片图片的链接缓存不会更新，不妥
            wx.setStorageSync('avatarUrl', res.fileList[0].tempFileURL)
            break; */
    case 'avatarUrl':
      updateData = {
        info: {
          avatarUrl: data
        }
      }
      wx.setStorageSync('avatarUrl', data)
      break;
    case 'friendsList':
      updateData.friendsList = data
      wx.setStorageSync('friendsList', data)
      break;
    case 'starStoreIdList':
      updateData.starStoreIdList = data
      wx.setStorageSync('starStoreIdList', data)
      break;
    case 'My_GroupsList':
      updateData.My_GroupsList = data
      wx.setStorageSync('My_GroupsList', data)
      break
    case 'shareCode':
      updateData.shareCode = data
      wx.setStorageSync('shareCode', data)
      break
    default:
      break;
  }
  //console.log(openId, "-->", type, data)
  console.log( "更新-->", type)
  var res = await userInfo.where({
    openId: openId
  }).update({
    data: updateData
  })

  //console.log("更新完成", res)
  console.log("更新完成UserInfo")

}
/**
 * 获取用户创建的圈子和加入的圈子
 * @param {*} openId 
 */
function getGroupsList(openId) {
  db.collection('groupsList').where({
    _openid: openId
  }).get().then(res => {
    //console.log('my', res.data)
    wx.setStorageSync('My_GroupsList', res.data)
  })
  db.collection('groupsList').where({
    membersList: _.all([openId])
  }).get().then(res => {
    // console.log('joined', res.data)
    //对备注预处理
    if (res.data.length != 0) {
      var groupNameRemarkList = wx.getStorageSync('groupNameRemarkList');
      if (groupNameRemarkList.length != 0) {
        res.data.forEach((group) => {
          groupNameRemarkList.forEach(remarkObj => {
            if (group._id == remarkObj.groupId) {
              group.remark = remarkObj.remark
            }
          })
        });
      }
    }
    wx.setStorageSync('Joined_GroupsList', res.data)
  })
}
/**
 * 获取云端最新的圈子数据
 * @param {*} groupId 
 */
async function getGroupData(groupId) {

  var res = await db.collection('groupsList').where({
    _id: groupId
  }).get()
  //console.log(res)
  return res
}
/**
 * 更新圈子数据
 * @param {*需要更新的数据} data 
 * @param {*数据类型} type 
 * @param {*圈子的_id} id 
 */
async function updateGroupsList(data, type, id) {
  const groupsList = db.collection('groupsList')
  // var openId = wx.getStorageSync('openId');
  /*   var My_GroupsList = wx.getStorageSync('My_GroupsList')
    var index = My_GroupsList.findIndex(item=>{
      return item._id==id
     }) */

  //更新数据
  var updateData = {}
  switch (type) {
    case 'stores':
      updateData.stores = data
      // My_GroupsList[index].stores=data
      // wx.setStorageSync('storesArr', data)
      break;
    case 'name_avatar':
      updateData.nickName = data.nickName
      updateData.groupAvatarUrl = data.groupAvatarUrl
      break;
    case 'secretKey':
      updateData.secretKey = data
      break;
    case 'sign':
      updateData.sign = data
      break;
    case 'membersList':
      updateData.membersList = data
      break;
    default:
      break;
  }
  // console.log(openId, "-->", type, data)
  var res = await groupsList.where({
    _id: id
  }).update({
    data: updateData
  })

  var openId = wx.getStorageSync('openId')
  getGroupsList(openId)
  //console.log("更新完成GroupsList", res)
  console.log("更新完成GroupsList")
}
/**
 * 请求发送订阅消息
 */
function requestSendMsg(type) {
  var tmplIds = []
  switch (type) {
    case 'viewList':
      tmplIds.push(templateIds.viewList_id)
      break
    case 'newMemberToGroup':
      tmplIds.push(templateIds.newMembersToGroup_id)
      break
    case 'all':
      tmplIds.push(templateIds.newMembersToGroup_id)
      tmplIds.push(templateIds.viewList_id)
      break
  }
  wx.requestSubscribeMessage({
    tmplIds: tmplIds,
    success(res) {
     // console.log(res)
    }
  })
}

function sendMsg(type, msgData) {
  var shareCode = wx.getStorageSync('shareCode');
  wx.cloud.callFunction({
    name: 'sendMessage',
    data: {
      type,
      msgData,
      scene: shareCode
    }
  })
}
/**
 * 计算两点直线距离
 * @param {*} lat1 
 * @param {*} lng1 
 * @param {*} lat2 
 * @param {*} lng2 
 */
function getDistance(lat1, lng1, lat2, lng2) {
  var radLat1 = lat1 * Math.PI / 180.0;
  var radLat2 = lat2 * Math.PI / 180.0;
  var a = radLat1 - radLat2;
  var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * 6378.137; // EARTH_RADIUS;---km
  //s = Math.round(s * 10000) / 10000;
  return s;
}
/**
 * 通过标签对店铺排序
 * @param {*} stores 
 * @param {*} tag 
 */
function sortStoresByTag(stores, tag) {
  switch (tag) {
    case 'distance':
      var myLat = app.globalData.latitude
      var myLnd = app.globalData.longitude
      stores.forEach(store => {
        store.distance = getDistance(myLat, myLnd, store.latitude, store.longitude)
      })
      stores.sort((store1, store2) => {
        return store1.distance - store2.distance
      })
      //console.log(stores)

      break;
    case 'price':
      stores.sort((store1, store2) => {
        return store1.price_per - store2.price_per
      })
      //console.log(stores)
      break;
    case 'favor':
      stores.sort((store1, store2) => {
        return store2.rateValue - store1.rateValue
      })
      // console.log(stores)

      break;

    default:
      break;
  }
  return stores
}
/**
 * 通过成员ID列表获取成员头像和昵称
 * @param {*} membersList 
 */
async function getMembersDetail(membersList) {

  var res = await wx.cloud.callFunction({
    name: 'checkSafeContent',
    data: {
      requestType: 'getMembersDetail',
      membersList: membersList
    }
  })
  //console.log(res)
  return res.result
}
/**
 * 使用帮助
 * @param {*} currentPage 
 */
function help(currentPage) {
  var content = '',
    tips = ''
  switch (currentPage) {
    case 0:
      tips = '主页'
      content = '长按 \"饭碗\" 按钮即可弹出 \"去哪吃\" 窗口哦~'
      break;
    case 1:
      tips = '个人信息'
      content = '1.更换头像：\n' +
      '点击正上方的头像可以更换头像\n' +
        '2.修改昵称：\n' +
        '点击正上方昵称可修改昵称\n' +
        '3.约饭口号：\n' +
        '约饭口号是向好友发送约饭链接时的标题文字\n' +
        '4.分享码：\n' +
        '为了保障用户隐私安全，用户可以随时更改自己的分享码，分享码更改后，好友将不能查看您的最新动态\n' +
        '5.\"今天去哪吃\"：\n'+
        '\"去哪吃\"的美食店铺来源于用户加入或创建的美食圈子以及用户自己的美食便签\n'+
        '6.即时分享次数：\n' +
        '上下滑动即时分享次数的数字区域可改变数值' 
      break;

    case 2:
      tips = '创建的美食圈子'
      content = 
      '1.更新数据：\n' +
      '向下滑动可以更新数据\n' +
        '2.切换内容：\n' +
        '左右滑动可切换内容\n' +
        '3.分享与删除：\n'+
        '向左滑动圈子条目进行相应操作'+
        '4.编辑圈子资料：\n' +
        '点击圈子头像可编辑圈子资料\n'+
        '5.删除圈子成员：\n' +
        '圈子资料->查看成员->长按该成员即可删除'
      break;
    case 3:
      tips = '加入的美食圈子'
      content = 
        '1.查看圈子资料：\n' +
        '点击圈子头像可查看圈子资料\n' +
        '2.退出圈子：\n' +
        '向左滑动圈子条目进行退出操作\n' +
        '3.为了方便测试，支持用户加入自己创建的美食圈子\n' +
        '4.由于小程序尚未上线，目前仅支持输入秘钥加入圈子，扫码加入圈子功能敬请期待'
      break;
    case 4:
      tips = '美食好友'
      content = 
      '1.好友更新、置顶和删除：\n' +
      '向左滑动条目可对好友进行好友相关操作\n' +
        '2.由于小程序尚未上线，小程序码功能暂不可用，目前仅支持输入分享码的方式加好友，扫码加好友的方式敬请期待。\n' +
        '3.为了方便测试，目前支持用户把自己添加为美食好友\n' +
        '4.好友因为分享码的关系分为即时好友和永久好友。永久好友可以通过更新数据，获取好友最新的美食动态。'
      break;

    case 5:
      tips = '美食地图'
      content = '点击美食图标上方气泡窗口可以跳转到美食店铺详情'
      break;
    case 6:
      tips = '添加美食'
      content = 
      '1.店铺名称-右侧定位按钮：\n' +
      '点击定位按钮可切换本地店铺和全国店铺\n' +
        '2.店铺地址-右侧地图按钮：\n' +
        '点击地图按钮在地图上选择位置\n' +
        '3.为了保证图片上传成功，请等图片上传完毕再点击保存店铺'
      break;
    case 7:
      tips = '美食便签'
      content = 
      '1.置顶与删除：\n' +
      '向左滑动条目可对美食店铺进行相关操作\n' +
      '2.批量删除：\n' +
      '长按正下方菜单按钮可批量删除\n' +
        '3.即时分享：\n' +
        '好友输入您的即时分享码后，只能查看您当前选择分享的美食店铺，而且分享码的使用次数有限制，当次数用完时，该即时分享码将失效\n' +
        '4.永久分享：\n' +
        '好友输入您的永久分享码后，能查看您美食便签里所有的美食店铺，并可通过更新获取您实时的美食动态\n' +
        '5.由于小程序未上线，分享海报中的小程序码现在仅供演示作用，后期用户可以扫码添加好友\n' +
        '6.点击海报下方划横线文字字即可复制分享码'
      break;

    default:
      break;
  }
  wx.showModal({
    title: tips + '-Tips',
    content: content,
    showCancel: false,
    confirmText: '我知道啦',
    confirmColor: '#3CC51F',
    success: (result) => {
      if (result.confirm) {

      }
    },
    fail: () => {},
    complete: () => {}
  });
}
module.exports = {
  help,
  getGroupData,
  getMembersDetail,
  sortStoresByTag,
  getDistance,
  templateIds,
  sendMsg,
  requestSendMsg,
  updateGroupsList,
  getGroupsList,
  vibrate,
  checkImgAndMsg,
  getQrCodeUrl,
  makePosterImageCanvas,
  arrayRandomTakeOne,
  makeItemTop,
  dateToString,
  formatTime,
  formatDate,
  getRandomCode,
  randomSort,
  updateUserInfo,
  doImgSecCheck,
  doMsgSecCheck,
  checkMsgSec,
  checkImgSec
}