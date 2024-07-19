// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const { name, coverImageID, authorOpenID } = event

  // 将相册信息存储到数据库中
  const db = cloud.database()
  try {
    const res = await db.collection('albums').add({
      data: {
        name: name,
        coverImageID: coverImageID,
        createdAt: new Date(),
        members: [authorOpenID], // 成员列表，包含作者的 openid
        author: authorOpenID, // 记录作者的 openid
        sendRecords: [] // 初始化发送记录为空数组
      }
    })
    return {
      success: true,
      data: {
        albumId: res._id, // 返回新插入记录的 _id
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