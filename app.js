App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('Please use 2.2.3 or above base library to use cloud capabilities');
    } else {
      wx.cloud.init({
        traceUser: true,
      });
    }

    this.globalData = {}
  }
});