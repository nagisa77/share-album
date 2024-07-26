Page({
  data: {
    albumName: '',
    coverImage: ''
  },
  onLoad: function () {},

  onNameInput: function (e) {
    this.setData({
      albumName: e.detail.value
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
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途
      success: res => {
        const userInfo = res.userInfo;

        wx.cloud.callFunction({
          name: 'login',
          data: {
            userInfo: userInfo
          },
          success: res => {
            console.info('login success, openid: ', res.result.openid);
            wx.setStorageSync('openID', res.result.openid);

            const {
              albumName,
              coverImage
            } = this.data;

            if (!albumName || !coverImage) {
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
          },
          fail: err => {
            console.error('获取 openid 失败', err);
            // todo: 处理登陆失败逻辑
          }
        });
      },
      fail: err => {
        console.error('获取用户信息失败', err);
        // todo: 处理获取用户信息失败逻辑
      }
    });
  }
});