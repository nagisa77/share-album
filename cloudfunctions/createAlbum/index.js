// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const { name, coverImageID, authorOpenID, userName, userAvatarUrl } = event

  // 初始化数据库
  const db = cloud.database()
  const usersCollection = db.collection('users')

  try {
    // 查询用户是否存在
    const userRes = await usersCollection.where({
      openID: authorOpenID
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
          openID: authorOpenID,
          userName: userName,
          userAvatarUrl: userAvatarUrl,
          createdAt: new Date()
        }
      })
    }

    // 将相册信息存储到数据库中
    const albumRes = await db.collection('albums').add({
      data: {
        name: name,
        coverImageID: coverImageID,
        backgroundImageID: '',
        createdAt: new Date(),
        members: [authorOpenID],
        author: authorOpenID,
        sendRecords: []
      }
    })
    return {
      success: true,
      data: {
        albumId: albumRes._id,
        name: name,
        coverImageID: coverImageID,
        authorOpenID: authorOpenID
      }
    }
  } catch (e) {
    return {
      success: false,
      errorMessage: e.message
    }
  }
}