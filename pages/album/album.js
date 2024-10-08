Page({
  data: {
    albumId: '',
    album: {
      name: '默认相册名称',
      avatar: '../../images/default-avatar.jpg',
      album_background_cover: '',
      records: []    
    },
    loading: false, // 用于显示 loading 状态
    topBarOpacity: 0, // 初始透明度为0
  },

  onShareAppMessage: function (options) {
    // 获取当前页面的路径
    const path = this.route;
    // 假设你的相册 ID 存储在页面的 data 中
    const albumId = this.data.albumId;

    return {
      title: '快来看我的相册！',
      path: `${path}?albumId=${this.data.albumId}&share=1`,
      imageUrl: this.data.album.avatar 
    };
  },

  onScroll: function(event) {
    const scrollTop = event.detail.scrollTop;
    const opacity = Math.min(1, scrollTop / 100); // 计算透明度，最大值为1
    this.setData({
      topBarOpacity: opacity
    });
  },

  // 预览图片功能
  previewImage(e) {
    const imageIndex = e.currentTarget.dataset.index;
    const recordIndex = e.currentTarget.dataset.recordIndex;
    const imagePaths = this.data.album.records[recordIndex].images;
    
    wx.navigateTo({
      url: `/pages/previewStory/previewStory?imagePaths=${JSON.stringify(imagePaths)}&current=${imageIndex}`
    });
  }, 

  onCameraIconClicked: function() {
    wx.showActionSheet({
      itemList: ['拍摄', '从手机相册选择'],
      itemColor: '#000000',
      success: res => {
        if (!res.cancel) {
          if (res.tapIndex === 0) {
            wx.chooseImage({
              count: 1,
              sizeType: ['original', 'compressed'],
              sourceType: ['camera'],
              success: res => {
                var tempFilePaths = res.tempFilePaths;
              },
              fail: () => {
              }
            });
          } else if (res.tapIndex === 1) {
            wx.chooseImage({
              count: 6,
              sizeType: ['original', 'compressed'],
              sourceType: ['album'],
              success: res => {
                var tempFilePaths = res.tempFilePaths;
                // 调起 story 页面，并传递选中的图片路径
                wx.navigateTo({
                  url: `/pages/createStory/createStory?filePaths=${JSON.stringify(tempFilePaths)}`,
                });
              },
              fail: () => {
                console.error('Image selection failed');
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

    if (options.share == 1) {
      console.log('is from share!');
      wx.cloud.callFunction({
        name: 'login',
        success: res => {
          if (res.result && res.result.success) {
            wx.setStorageSync('openID', res.result.openid)
            console.log('openID存储成功: ', res.result.openid)

            // 确认user 是否存在，不存在要补充信息
            return wx.cloud.callFunction({
              name: 'getUserInfo',
              data: {
                openID: res.result.openid
              }
            }).then(userRes => {
              if (userRes.result.success) {
                console.info('用户已经存在，加入此相册');

                this.joinAlbum(res.result.openid, options.albumId); 
              } else {
                console.info('用户不存在，要求用户提供信息后加入相册');

                // 获取用户信息页面完成后继续处理相册逻辑
                wx.navigateTo({
                  url: `/pages/getUserInfo/getUserInfo`,
                  events: {
                    userInfoUpdated: () => {
                      console.info("getUserInfo 页面确认"); 
                      this.joinAlbum(wx.getStorageSync('openID') , options.albumId);                     
                    }
                  }
                });
              }
            });
          } else {
            console.error('调用云函数失败: ', res)
          }
        },
        fail: err => {
          console.error('调用云函数失败: ', err)
        }
      })
    }
  },

  joinAlbum: function(openID, albumId) {
    wx.cloud.callFunction({
      name: 'joinAlbum',
      data: {
        openID: openID,
        albumId: albumId
      },
      success: function(res) {
        if (res.result.success) {
          wx.showToast({
            title: '加入相册成功',
            icon: 'success',
            duration: 2000
          });
          console.info("加入相册成功"); 
        } else {
          wx.showToast({
            title: '加入失败: ' + res.result.errorMessage,
            icon: 'none',
            duration: 2000
          });
          console.info('加入失败: ' + res.result.errorMessage); 
        }
      },
      fail: function(error) {
        wx.showToast({
          title: '调用失败',
          icon: 'none',
          duration: 2000
        });
        console.error("调用失败：", error);
      }
    });
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
          
          const albumData = res.result.data;
          const records = albumData.sendRecords;
          
          const promises = records.map(record => {
            return wx.cloud.callFunction({
              name: 'getUserInfo',
              data: {
                openID: record.openID
              }
            }).then(userRes => {
              if (userRes.result.success) {
                record.userName = userRes.result.data.userName;
                record.userAvatar = userRes.result.data.userAvatarUrl;
              } else {
                console.error('获取用户信息失败', userRes.result.errorMessage);
              }
              return record;
            });
          });
  
          Promise.all(promises).then(updatedRecords => {
            this.setData({
              albumId: albumData._id,
              album: {
                name: albumData.name,
                avatar: albumData.coverImageID,
                album_background_cover: albumData.backgroundImageID,
                records: updatedRecords
              }
            });
          }).catch(err => {
            console.error('加载用户信息失败', err);
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

  refreshPageData: function() {
    this.loadAlbum(this.data.albumId); // 重新加载相册数据
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
  },

  onPullDownRefresh: function() {
    this.loadAlbum(this.data.albumId); // 重新加载相册数据
    wx.stopPullDownRefresh(); // 停止下拉刷新
  }
});