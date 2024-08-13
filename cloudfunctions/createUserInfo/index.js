// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const { userOpenID, userName, userAvatarUrl } = event

  // 初始化数据库
  const db = cloud.database()
  const usersCollection = db.collection('users')

  try {
    // 查询用户是否存在
    const userRes = await usersCollection.where({
      openID: userOpenID
    }).get()

    if (userRes.data.length > 0) {
      // 用户存在，更新用户信息
      await usersCollection.doc(userRes.data[0]._id).update({
        data: {
          userName: userName,
          userAvatarUrl: userAvatarUrl
        }
      })
    } else {
      // 用户不存在，创建新用户
      await usersCollection.add({
        data: {
          openID: userOpenID,
          userName: userName,
          userAvatarUrl: userAvatarUrl,
          createdAt: new Date()
        }
      })
    }

    return {
      success: true
    }
  } catch (e) {
    return {
      success: false,
      errorMessage: e.message
    }
  }
}