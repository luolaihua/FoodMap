// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command
const userInfo = db.collection('userInfo')
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let openId = wxContext.OPENID
  switch (event.action) {
    case 'initInfo':
      return initInfo(event, openId)
    default:
      return {
        openId
      }
  }



}
async function initInfo(event, openId) {
  try {
    //先从成员列表中查看有无当前操作的openId
    let memberInfos = await userInfo.where({
      openId: openId
    }).get();
    console.log(memberInfos)
    //初始化
    if (memberInfos.data.length === 0) {
      //数据为空说明是新用户
      var initData = {
        info: event.info,
        stores: [],
        friendsList: [],
        My_GroupsList: [],
        starStoreIdList: [],
        Joined_GroupsList: [],
        openId: openId,
        shareCode: event.shareCode
      }
      let resAdd = await db.collection('userInfo').add({
        data: initData
      })
      initData._id = resAdd._id
      initData.test = '999999'
      //是否添加测试数据
      if (event.isGetTestData) {
        //测试用的朋友列表
        var testIdList = ['test-001', 'test-002', 'test-003', 'test-004', 'test-005', 'test-006']
        var tasks = []
        testIdList.forEach(id => {
          tasks.push(
            userInfo.where({
              openId: id
            }).get()
          )
        })
        var res = await Promise.all(tasks)
        var friendsList = []
        res.forEach(info => {
          var friendInfo = {
            shareCode: info.data[0].shareCode,
            stores: info.data[0].stores,
            avatarUrl: info.data[0].info.avatarUrl,
            nickName: info.data[0].info.nickName
          }
          friendsList.push(friendInfo)
        })
        //console.log(friendsList)
        initData.friendsList = friendsList
       // memberInfos.data.push(initData)

        //增加测试的店铺数据
        var resGetStores = await userInfo.where({
          _id: 'baada3ac5ed8da4a004c4c9f333755e1'
        }).get()  
        initData.stores = resGetStores.data[0].stores
        memberInfos.data.push(initData)

        //同时更新到数据库端
        userInfo.where({
          _id: resAdd._id
        }).update({
          data: {
            friendsList: friendsList,
            stores:resGetStores.data[0].stores
          }
        })


        //加入测试朋友圈
        var groupsIdList = ['f2a60d815ed9fdb50049a5f434591b49', '5a93cec95eda00e70045a87e0367e675','4d5a19345ed86b7a003189cf00e847e2']
        groupsIdList.forEach(id => {
          db.collection('groupsList').doc(id).update({
            data: {
              membersList: _.push([openId])
            }
          }).then(res => {
            console.log(res)
          })
        })


      }

    }

    return {
      openId,
      memberInfos
    }
  } catch (e) {}
}