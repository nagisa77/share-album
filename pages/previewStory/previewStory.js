Page({
  data: {
    imagePaths: [],
    current: 0,
  },

  onLoad(options) {
    console.log("onLoad options:", options);

    const { imagePaths, current } = options;

    try {
      const pathsArray = JSON.parse(imagePaths);
      console.log("Parsed imagePaths:", pathsArray);

      this.setData({
        imagePaths: pathsArray,
        current: parseInt(current, 10) || 0, // 默认第一个图片
      });
    } catch (error) {
      console.error("Failed to parse imagePaths:", error); 
    }
  },

  onSwiperChange(e) {
    console.log("Swiper changed to index:", e.detail.current);
    this.setData({
      current: e.detail.current,
    });
  },

  goBack() {
    console.log("Navigating back"); 
    wx.navigateBack();
  }
});