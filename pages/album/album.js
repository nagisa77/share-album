// album.js
Page({
  data: {
    albumId: '',
    album: {
      name: '默认相册名称',
      avatar: '../../images/default-avatar.jpg',
      default_album_background: '',
      records: []
    }
  },
  onLoad: function(options) {
    if (options.albumId) {
      console.info(`加入相册: ${options.albumId}`);
      this.setData({
        albumId: options.albumId
      });
      // this.loadAlbum(options.albumId);
    } else {
      console.error("未携带相册id进入页面");
      // todo: 处理异常逻辑
    }
  },
  loadAlbum: function(albumId) {
    // 根据 albumId 加载相册内容的逻辑
    wx.cloud.callFunction({
      name: 'getAlbum',
      data: {
        albumId: albumId
      },
      success: res => {
        console.log(res.result);
        // 设置相册内容到页面数据中
        this.setData({
          album: res.result.data
        });
      },
      fail: err => {
        console.error('加载相册失败', err);
      }
    });
  }
});