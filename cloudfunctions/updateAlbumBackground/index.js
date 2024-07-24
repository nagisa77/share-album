// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const { albumId, backgroundUrl } = event

  // 初始化数据库
  const db = cloud.database()

  try {
    // 更新相册背景图片
    const res = await db.collection('albums').doc(albumId).update({
      data: {
        backgroundImageID: backgroundUrl
      }
    })
    return {
      success: true,
      data: {
        albumId: albumId,
        backgroundUrl: backgroundUrl
      }
    }
  } catch (e) {
    return {
      success: false,
      errorMessage: e.message
    }
  }
}