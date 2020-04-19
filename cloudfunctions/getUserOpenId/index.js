// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let openId = wxContext.OPENID
  switch(event.action){
    case 'initInfo':
     return initInfo(event,openId)
      default :
      return {openId}
  }



}
async function initInfo(event, openId) {
  try {
    //先从成员列表中查看有无当前操作的openId
    let memberInfos = await db.collection('userInfo').where({
      openId: openId
    }).get();
    //初始化
    if (memberInfos.data.length === 0) {
    let test= await db.collection('userInfo').add({
        data: {
          info: event.info,
          stores: [],
          openId: openId,
        }
      })
      return {
        openId:openId,
        test
      }
    }else{
      return {openId}
    }
  } catch (e) {

  }
}