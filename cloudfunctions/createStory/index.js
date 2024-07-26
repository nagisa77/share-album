// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const { albumID, userName, userAvatar, text, imageIDs } = event

  // 获取当前时间
  const time = new Date().toISOString().replace('T', ' ').substr(0, 16)

  // 创建新的记录
  const newRecord = {
    time: time,
    userName: userName,
    userAvatar: userAvatar,
    text: text,
    images: imageIDs,
  }

  // 将发布内容添加到 sendrecords 数组中
  const db = cloud.database()
  try {
    const res = await db.collection('albums').doc(albumID).update({
      data: {
        sendRecords: db.command.push(newRecord)
      }
    })
    return {
      success: true,
      data: newRecord
    }
  } catch (e) {
    return {
      success: false,
      errorMessage: e.message
    }
  }
}