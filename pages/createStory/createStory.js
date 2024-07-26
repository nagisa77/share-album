Page({
  data: {
    imagePaths: [],
    imageSize: 0,
    userName: '用户1', // 示例用户名
    userAvatar: '', // 示例用户头像
    inputText: '', // 文本输入内容
    albumID: 'your-album-id' // 示例相册ID
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
    const { imagePaths, userName, userAvatar, inputText, albumID } = this.data;

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
            userName: userName,
            userAvatar: userAvatar,
            text: inputText,
            imageIDs: imageIDs
          }
        });
      })
      .then(res => {
        if (res.result.success) {
          wx.showToast({
            title: '发布成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: '发布失败',
            icon: 'none'
          });
        }
      })
      .catch(error => {
        wx.showToast({
          title: '发布失败',
          icon: 'none'
        });
        console.error('Error:', error);
      });
  }
});