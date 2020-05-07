// 云函数入口文件
const cloud = require('wx-server-sdk')
const templateIds = {
  viewList_id: 'UmS6i-0fJvfTjUcr4VgbE8bfw8whhTntV3dCerxOPJA',
    //新成员加入通知
    newMembersToGroup_id: 'Jf_vPIyYSbrrGhWsKNQ8UyHforoywAQco4hO7Fw64J0'
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
    page = 'pages/map/map?test=666'
    msgData = {
      name1: {
        value: event.msgData.name1
      },
      thing2: {
        value: event.msgData.thing2
      },
      date3: {
        value: event.msgData.date3
      },
      thing4: {
        value: event.msgData.thing4
      },
      thing5: {
        value: event.msgData.thing5
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
        miniprogramState: 'developer'
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