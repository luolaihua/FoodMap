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
 function makePosterImageCanvas (canvasName, title, textArr, colorArr, fontArr, sizeArr, num, rowNum, distance, spacing, canvasWidth, canvasHeight, midWidth, midHeight, imgUrl) {
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
function getQrCodeUrl(scene){
  return wx.cloud.callFunction({
    name: 'checkSafeContent',
    data: {
      requestType: 'createQrCode',
      scene: scene
    }
  })
}


module.exports = {
  getQrCodeUrl,
  makePosterImageCanvas,
  arrayRandomTakeOne,
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