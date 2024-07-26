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
    console.log('Add image');
  },

  submitStory() {
    // 发表逻辑
    console.log('Submit story');
  }
});