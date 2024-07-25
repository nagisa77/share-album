Page({
  data: {
    albumId: '',
    album: {
      name: '默认相册名称',
      avatar: '../../images/default-avatar.jpg',
      album_background_cover: '',
      records: []
    },
    loading: false // 用于显示 loading 状态
  },

  onLoad: function(options) {
    if (options.albumId) {
      console.info(`加入相册: ${options.albumId}`);
      this.setData({
        albumId: options.albumId
      });
      this.loadAlbum(options.albumId);
    } else {
      console.error("未携带相册id进入页面");
      // todo: 处理异常逻辑
    }
  },

  loadAlbum: function(albumId) {
    wx.cloud.callFunction({
      name: 'getAlbumInfo',
      data: {
        albumId: albumId
      },
      success: res => {
        if (res.result.success) {
          console.log('获取相册信息成功', res.result.data);
          this.setData({
            albumId: res.result.data._id,
            album: {
              name: res.result.data.name,
              avatar: res.result.data.coverImageID,
              album_background_cover: res.result.data.backgroundImageID,
              records: res.result.data.sendRecords,
            }
          });
        } else {
          console.error('获取相册信息失败', res.result.errorMessage);
        }
      },
      fail: err => {
        console.error('加载相册失败', err);
      }
    });
  },

  onAlbumBackgroundClicked: function() {
    wx.showActionSheet({
      itemList: ['选择照片', '相机'],
      itemColor: '#000000',
      success: res => {
        if (!res.cancel) {
          this.setData({ loading: true }); // 显示 loading
          if (res.tapIndex === 0) {
            wx.chooseImage({
              count: 1,
              sizeType: ['original', 'compressed'],
              sourceType: ['album'],
              success: res => {
                var tempFilePaths = res.tempFilePaths;
                this.uploadImage(tempFilePaths[0]);
              },
              fail: () => {
                this.setData({ loading: false });
              }
            });
          } else if (res.tapIndex === 1) {
            wx.chooseImage({
              count: 1,
              sizeType: ['original', 'compressed'],
              sourceType: ['camera'],
              success: res => {
                var tempFilePaths = res.tempFilePaths;
                this.uploadImage(tempFilePaths[0]);
              },
              fail: () => {
                this.setData({ loading: false });
              }
            });
          }
        }
      },
      fail: res => {
        console.log(res.errMsg);
      }
    });
  },

  uploadImage: function(filePath) {
    const cloudPath = `album-background/${this.data.albumId}-${Date.now()}-${Math.floor(Math.random(0, 1) * 1000)}.png`;
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => {
        console.log('上传成功', res.fileID);
        this.updateAlbumBackground(res.fileID);
      },
      fail: err => {
        console.error('上传失败', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '上传失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  updateAlbumBackground: function(fileID) {
    wx.cloud.callFunction({
      name: 'updateAlbumBackground',
      data: {
        albumId: this.data.albumId,
        backgroundUrl: fileID
      },
      success: res => {
        console.log('更新相册背景成功', res);
        this.setData({
          'album.album_background_cover': fileID,
          loading: false
        });
        wx.showToast({
          title: '上传成功',
          icon: 'success',
          duration: 2000
        });
      },
      fail: err => {
        console.error('更新相册背景失败', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '更新失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  }
});