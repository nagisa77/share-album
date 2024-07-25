// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { albumId } = event

  try {
    const albumRes = await db.collection('albums').doc(albumId).get()
    return {
      success: true,
      data: albumRes.data
    }
  } catch (error) {
    return {
      success: false,
      errorMessage: error.message
    }
  }
}