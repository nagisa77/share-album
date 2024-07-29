Page({
  data: {
    imagePaths: [],
    current: 0,
    scale: 1,
    minScale: 0.5,
  },

  onLoad(options) {
    const { imagePaths, current } = options;
    this.setData({
      imagePaths: JSON.parse(imagePaths),
      current: parseInt(current, 10),
    });
  },

  onSwiperChange(e) {
    this.setData({
      current: e.detail.current,
    });
  },

  goBack() {
    wx.navigateBack();
  },

  onImageLoad(e) {
    const { width, height } = e.detail;
    this.setData({
      originalWidth: width,
      originalHeight: height,
    });
  },

  onImageTap(e) {
    const { scale, minScale } = this.data;
    const newScale = scale === minScale ? 1 : minScale;
    this.setData({
      scale: newScale,
    });
  },
});