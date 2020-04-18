 function checkMsgSec(content) {
  return wx.cloud.callFunction({
    name: 'checkSafeContent',
    data:{
      requestType:'msgSecCheck',
      content:content
    }
  })
}
 function checkImgSec(filePath){
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
          if (res.result) {
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

module.exports = {
  checkMsgSec,
  checkImgSec
}