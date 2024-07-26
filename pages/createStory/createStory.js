Page({
  data: {
    imagePaths: [],
    openID: wx.getStorageSync('openID'),
    imageSize: 0,
    inputText: '',
    albumID: wx.getStorageSync('albumID'),
    loading: false
  },

  onLoad(options) {
    const res = wx.getSystemInfoSync();
    const imageSize = (res.windowWidth - 80) / 3;
    this.setData({
      imageSize
    });

    if (options.filePaths) {
      const paths = JSON.parse(options.filePaths);
      if (paths.length > 6) {
        console.assert(false, "图片不能超过六张");
      } else {
        this.setData({ imagePaths: paths });
      }
    }
  },

  handleInput(e) {
    this.setData({
      inputText: e.detail.value
    });
  },

  addImage() {
    const remainingCount = 6 - this.data.imagePaths.length;

    if (remainingCount <= 0) {
      console.assert(false, "已经达到六张图片的上限");
      return;
    }

    wx.showActionSheet({
      itemList: ['拍摄', '从手机相册选择'],
      itemColor: '#000000',
      success: res => {
        if (!res.cancel) {
          if (res.tapIndex === 0) {
            wx.chooseImage({
              count: remainingCount,
              sizeType: ['original', 'compressed'],
              sourceType: ['camera'],
              success: res => {
                const tempFilePaths = res.tempFilePaths;
                this.setData({
                  imagePaths: this.data.imagePaths.concat(tempFilePaths)
                });
              },
              fail: () => {
                console.error('拍摄失败');
              }
            });
          } else if (res.tapIndex === 1) {
            wx.chooseImage({
              count: remainingCount,
              sizeType: ['original', 'compressed'],
              sourceType: ['album'],
              success: res => {
                const tempFilePaths = res.tempFilePaths;
                this.setData({
                  imagePaths: this.data.imagePaths.concat(tempFilePaths)
                });
              },
              fail: () => {
                console.error('从相册选择图片失败');
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

  submitStory() {
    const { imagePaths, openID, inputText, albumID } = this.data;

    // 显示loading状态
    this.setData({ loading: true });

    // 上传图片并获取 imageIDs
    const uploadTasks = imagePaths.map((path) => {
      return wx.cloud.uploadFile({
        cloudPath: `story_images/${Date.now()}-${Math.floor(Math.random(0, 1) * 1000)}`,
        filePath: path,
      });
    });

    Promise.all(uploadTasks)
      .then(results => {
        const imageIDs = results.map(res => res.fileID);

        return wx.cloud.callFunction({
          name: 'createStory',
          data: {
            albumID: albumID,
            openID: openID,
            text: inputText,
            imageIDs: imageIDs
          }
        });
      })
      .then(res => {
        this.setData({ loading: false });
        if (res.result.success) {
          wx.showToast({
            title: '发布成功',
            icon: 'success'
          });
          // 成功后返回上一页
          wx.navigateBack();
        } else {
          wx.showToast({
            title: '发布失败',
            icon: 'none'
          });
        }
      })
      .catch(error => {
        this.setData({ loading: false });
        wx.showToast({
          title: '发布失败',
          icon: 'none'
        });
        console.error('Error:', error);
      });
  },

  goBack() {
    wx.navigateBack();
  }
});