const db = wx.cloud.database()

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
      "Scenes": ["PORN", "POLITICS", "TERRORISM", "TEXT"],
      "ImageUrl": ImageUrl,
      "ImageBase64": "",
      "Config": "",
      "Extra": ""
    },
  })
  console.log(res)
  if (Object.keys(res.data.Response).length < 3) {
    return true
  } else {
    var POLITICS = res.data.Response.PoliticsResult.Suggestion == "PASS" ? true : false
    var PORN = res.data.Response.PornResult.Suggestion == "PASS" ? true : false
    var TERRORISM = res.data.Response.TerrorismResult.Suggestion == "PASS" ? true : false
    var TEXT = res.data.Response.TextResult.Suggestion == "PASS" ? true : false
    console.log('POLITICS, PORN, TERRORISM, TEXT', POLITICS, PORN, TERRORISM, TEXT)
    if (POLITICS && PORN && TERRORISM && TEXT) {

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

async function updateStore(stores) {
  const userInfo = db.collection('userInfo')
  var openId = wx.getStorageSync('openID');
  //更新数据
  console.log(openId, "-->", stores)
  var res = await userInfo.where({
    openId: openId
  }).update({
    data: {
      stores: stores
    }
  })
  wx.setStorageSync('storesArr', stores)
  console.log("更新完成",res)
  
}

function randomSort(a, b) {
  return Math.random() > 0.5 ? -1 : 1
}
function getRandomCode(num) {
  var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  var code = "";
  for (var i = 0; i < num; i++) {
      var id = parseInt(Math.random() * 61);
      code += chars[id];
  }
  return code;
} 
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

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
  var dateTime = year + "-" + month + "-" + day ;
  return dateTime;
}  
function makeItemTop(arr,index){
  var item = arr.slice(index, index + 1)[0]
  arr.splice(index, 1)
  arr.unshift(item)
  return arr
}

module.exports = {
  makeItemTop,
  dateToString,
  formatTime,
  formatDate,
  getRandomCode,
  randomSort,
  updateStore,
  doImgSecCheck,
  doMsgSecCheck,
  checkMsgSec,
  checkImgSec
}