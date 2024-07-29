Page({
  data: {
    imagePaths: [],
    current: 0
  },

  onLoad(options) {
    if (options.imagePaths) {
      const paths = JSON.parse(options.imagePaths);
      this.setData({
        imagePaths: paths,
        current: options.current || 0
      });
    }
  },

  onSwiperChange(e) {
    this.setData({
      current: e.detail.current
    });
  },

  closePreview() {
    wx.navigateBack();
  }
});