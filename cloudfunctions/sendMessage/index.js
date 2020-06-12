// 云函数入口文件
const cloud = require('wx-server-sdk')
const templateIds = {
  //viewList_id: 'V09GAzDTujaHcRj78xkwlsVtWM9H0iZ0GK2OwU7ZV5M',
  viewList_id: 'subAzhXR7X1gWqXc759FsAo7Pi_j35vaxF3zqDbFdmc',
    //新成员加入通知
    newMembersToGroup_id: 'mBNg9kaQNWvgPPY9uraJix1D43Fvci8EoqwaOuSEg6E'
}
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var templateId = ''
  var msgData = {}
  var page = ''
  switch(event.type){
    case 'viewList':
    templateId = templateIds.viewList_id
    //TODO 从订阅消息点进去的界面
    page = 'pages/map/map?scene='+event.scene
    msgData = {
      thing1: {
        value: event.msgData.thing1
      },
      phrase2: {
        value: event.msgData.phrase2
      },
      time3: {
        value: event.msgData.time3
      }
    }
    break
    case 'newMemberToGroup':
      page = 'pages/group/group?test=666'
      templateId = templateIds.newMembersToGroup_id
      msgData = {
        thing1: {
          value: event.msgData.thing1
        },
        thing2: {
          value: event.msgData.thing2
        },
        thing3: {
          value: event.msgData.thing3
        }
      }
      break

  }
  try {
    console.log(event)
    console.log(wxContext)
    const result = await cloud.openapi.subscribeMessage.send({
        touser: event.msgData.openId,
        templateId: templateId,
        page: page,
        lang: 'zh_CN',
        data: msgData,
        miniprogramState: 'trial'
      })
    console.log(result)
    return result
  } catch (err) {
    console.log(err)
    return err
  }
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}