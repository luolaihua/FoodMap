// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  try {
    console.log(event)
    console.log(wxContext)
    const result = await cloud.openapi.subscribeMessage.send({
        touser: wxContext.OPENID,
        page: 'pages/map/map?test=666',
        lang: 'zh_CN',
        data: {
          name1: {
            value: event.name1
          },
          thing2: {
            value: event.thing2
          },
          date3: {
            value: event.date3
          },
          thing4: {
            value: event.thing4
          },
          thing5: {
            value: event.thing5
          }
        },
        templateId: 'UmS6i-0fJvfTjUcr4VgbE8bfw8whhTntV3dCerxOPJA',
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