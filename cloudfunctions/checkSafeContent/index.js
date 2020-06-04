// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
// 云函数入口函数
exports.main = async (event, context) => {
  //文本内容安全检测
  switch (event.requestType) {
    case 'msgSecCheck': {
      return doMsgSecCheck(event)
    }
    case 'imgSecCheck': {
      return doImgSecCheck(event)
    }
    case 'createQrCode': {
      return createQrCode(event)
    }
    case 'getMembersDetail': {
      return await getMembersDetail(event)
    }
    default:
      return '666' //cloud.getWXContext().OPENID
  }
}
async function doMsgSecCheck(event) {
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
}
async function doImgSecCheck(event) {
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
/**
 * 二维码生成
 * @param {} event 
 */
async function createQrCode(event) {
  //let scene = 'timestamp=' + event.timestamp;
  if (event.scene != '') {
    let result = await cloud.openapi.wxacode.getUnlimited({
      scene: event.scene,
      page: 'pages/map/map'
    })
    console.log(result)
    if (result.errCode === 0) {
      let upload = await cloud.uploadFile({
        cloudPath: 'temp/' + event.scene + '.png',
        fileContent: result.buffer,
      })
      console.log(upload)
      /*       let fileList = [upload.fileID]
            let resultUrl = await cloud.getTempFileURL({
              fileList,
            }) */
      return upload.fileID
    }
  }
  return []

}

async function getMembersDetail(event) {
  const db = cloud.database()
  const $ = db.command.aggregate
  var membersList = event.membersList

  //var testData = ['oV_S-4tXMVJ2NQw5b5JOXsKsfVyU','oV_S-4tXMVJ2NQw5b5JOXsKsfVyU','oV_S-4grLxma3nV7AUY6uq8MSeRQ']
  function getDetail(openId) {
    return db.collection('userInfo').where({
      openId: openId
    }).get()
  }
  var tasks = []
  membersList.forEach(item => {
    tasks.push(getDetail(item))
  })
  var res = await Promise.all(tasks)
  var infoList = []
  res.forEach(item => {
    infoList.push(item.data[0].info)
  })
  console.log(infoList)
  return infoList
}