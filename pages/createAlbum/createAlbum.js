const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';

Page({
  data: {
    albumName: '',
    coverImage: '',
    userName: '',
    userAvatarUrl: defaultAvatarUrl,
  },

  onLoad: function () {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        if (res.result && res.result.success) {
          // 成功调用，保存openID到本地
          wx.setStorageSync('openID', res.result.openid)
          console.log('openID存储成功: ', res.result.openid)
        } else {
          console.error('调用云函数失败: ', res)
        }
      },
      fail: err => {
        console.error('调用云函数失败: ', err)
      }
    })
  },

  onNameInput: function (e) {
    this.setData({
      albumName: e.detail.value
    });
  },

  onUserNameInput: function (e) {
    this.setData({
      userName: e.detail.value
    });
  },

  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    this.setData({
      userAvatarUrl: avatarUrl
    });
  },

  chooseImage: function () {
    wx.chooseImage({
      count: 1,
      success: res => {
        this.setData({
          coverImage: res.tempFilePaths[0]
        });
      }
    });
  },

  createAlbum: function () {
    const { albumName, coverImage, userName, userAvatarUrl } = this.data;

    if (!albumName || !coverImage || !userName || !userAvatarUrl) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '创建中...'
    });

    wx.cloud.uploadFile({
      cloudPath: `album_covers/${Date.now()}-${Math.floor(Math.random() * 1000)}.png`,
      filePath: coverImage,
      success: uploadImageRes => {
        const coverImageID = uploadImageRes.fileID;

        wx.cloud.callFunction({
          name: 'createAlbum',
          data: {
            name: albumName,
            coverImageID: coverImageID,
            authorOpenID: wx.getStorageSync('openID'),
            userName: userName,
            userAvatarUrl: userAvatarUrl,
            openID: wx.getStorageSync('openID')
          },
          success: updateAlbumRes => {
            wx.hideLoading();
            wx.showToast({
              title: '创建成功',
              icon: 'success',
              success: () => {
                wx.setStorageSync('albumID', updateAlbumRes.result.data.albumId);
                wx.redirectTo({
                  url: `/pages/album/album?albumId=${updateAlbumRes.result.data.albumId}`
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