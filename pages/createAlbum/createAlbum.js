Page({
  data: {
    albumName: '',
    coverImage: ''
  },
  onLoad: function() {
    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        console.info('openid: ', res.result.openid);
        this.setData({
          openid: res.result.openid
        });
      },
      fail: err => {
        console.error('获取 openid 失败', err);
        // todo: 处理登陆失败逻辑
      }
    });
  },
  onNameInput: function(e) {
    this.setData({ albumName: e.detail.value });
  },
  chooseImage: function() {
    wx.chooseImage({
      count: 1,
      success: res => {
        this.setData({ coverImage: res.tempFilePaths[0] });
      }
    });
  },
  createAlbum: function() {
    const { albumName, coverImage } = this.data;
    if (!albumName || !coverImage) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '创建中...' });
    wx.cloud.uploadFile({
      cloudPath: `album_covers/${Date.now()}-${Math.floor(Math.random(0, 1) * 1000)}.png`,
      filePath: coverImage,
      success: uploadImageRes => {
        const coverImageID = uploadImageRes.fileID;
        wx.cloud.callFunction({
          name: 'createAlbum',
          data: {
            name: albumName,
            coverImageID: coverImageID,
            authorOpenID: this.data.openid
          },
          success: updateAlbumRes => {
            wx.hideLoading();
            wx.showToast({
              title: '创建成功',
              icon: 'success',
              success: () => {
                wx.redirectTo({
                  url: `/pages/album/album?albumId=${updateAlbumRes.albumId}`
                });
              }
            });
          },
          fail: err => {
            wx.hideLoading();
            wx.showToast({
              title: '创建失败',
              icon: 'none'
            });
            console.error(err);
          }
        });
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({
          title: '封面上传失败',
          icon: 'none'
        });
        console.error(err);
      }
    });
  }
});