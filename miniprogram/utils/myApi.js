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

 module.exports = {
   doImgSecCheck,
   doMsgSecCheck,
   checkMsgSec,
   checkImgSec
 }