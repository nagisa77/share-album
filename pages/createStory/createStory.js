Page({
  data: {
    imagePaths: [],
    imageSize: 0
  },

  onLoad(options) {
    const res = wx.getSystemInfoSync();
    const imageSize = (res.windowWidth - 80) / 3;
    this.setData({
      imageSize
    });

    // 可以在这里处理传入的 filePaths 参数
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
    // 添加图片的逻辑
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
    // 发表逻辑
    console.log('Submit story');
  }
});