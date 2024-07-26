// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { openID } = event;

  try {
    // 根据 openID 查询特定用户信息
    const userRecord = await db.collection('users').where({ openid: openID }).get()
    if (userRecord.data.length > 0) {
      return {
        success: true,
        data: userRecord.data[0].userInfo
      }
    } else {
      return {
        success: false,
        errorMessage: '用户信息未找到'
      }
    }
  } catch (error) {
    return {
      success: false,
      error
    }
  }
}