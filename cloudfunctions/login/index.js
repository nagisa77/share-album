// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  // 从 event 中获取用户信息
  const { userInfo } = event
  const openid = wxContext.OPENID

  try {
    // 检查是否存在相同的 openid
    const userRecord = await db.collection('users').where({ openid }).get()

    if (userRecord.data.length > 0) {
      // 如果存在则更新信息
      await db.collection('users').where({ openid }).update({
        data: {
          userInfo: userInfo,
          appid: wxContext.APPID,
          unionid: wxContext.UNIONID
        }
      })
    } else {
      // 否则添加新用户信息
      await db.collection('users').add({
        data: {
          openid: wxContext.OPENID,
          appid: wxContext.APPID,
          unionid: wxContext.UNIONID,
          userInfo: userInfo
        }
      })
    }
  } catch (error) {
    return {
      success: false,
      error
    }
  }

  return {
    success: true,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID
  }
}