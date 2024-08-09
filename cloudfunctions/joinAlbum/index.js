const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const { openID, albumId } = event;

  // 初始化数据库
  const db = cloud.database();
  const albumsCollection = db.collection('albums');

  try {
    // 查询指定的相册是否存在
    const albumRes = await albumsCollection.doc(albumId).get();

    // 检查用户是否已经是相册的成员
    if (albumRes.data.members.includes(openID)) {
      return {
        success: false,
        errorMessage: '用户已经是相册的成员'
      };
    }

    // 将用户添加到相册的成员列表中
    await albumsCollection.doc(albumId).update({
      data: {
        members: cloud.database().command.addToSet(openID)  // 使用 addToSet 防止重复添加
      }
    });

    return {
      success: true,
      data: {
        message: '成功加入相册'
      }
    };
  } catch (e) {
    return {
      success: false,
      errorMessage: e.message
    };
  }
}