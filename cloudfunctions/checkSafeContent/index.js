// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
// 云函数入口函数
exports.main = async (event, context) => {
  requestType = event.requestType
        //文本内容安全检测
  if(requestType=='msgSecCheck'){
    console.log(event.content)
   try {
      let result = await cloud.openapi.security.msgSecCheck({
        content: event.content
      })
      console.log(result)
      if (result.errCode == 0) {
        return true;
      }
      return false
    } catch (err) {
      return false;
    } 


    
  }else if(requestType=='imgSecCheck'){
    const fileID = event.fileID
    const res = await cloud.downloadFile({
    fileID: fileID,
  })
  const buffer = res.fileContent
  try {
    var result = await cloud.openapi.security.imgSecCheck({
      media: {
        contentType: "image/png",
        value: buffer
      }
    })
    if (result.errCode == 0) {
      return true;
    }
    return false
  } catch (err) {
    return err
  }
  }
}