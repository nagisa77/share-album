const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const { albumID, openID, text, imageIDs } = event

  // 获取当前时间
  const time = new Date().toISOString().replace('T', ' ').substr(0, 16)

  // 创建新的记录
  const newRecord = {
    time: time,
    openID: openID, 
    text: text,
    images: imageIDs,
  }

  // 将发布内容添加到 sendRecords 数组的最前面
  const db = cloud.database()
  try {
    const res = await db.collection('albums').doc(albumID).update({
      data: {
        sendRecords: db.command.unshift(newRecord)
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