App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('Please use 2.2.3 or above base library to use cloud capabilities');
    } else {
      wx.cloud.init({
        traceUser: true,
      });
    }

    const albumId = wx.getStorageSync('albumID');
    if (albumId) {
      wx.redirectTo({
        url: `/pages/album/album?albumId=${albumId}`
      });
    } else {
      wx.redirectTo({
        url: '/pages/createAlbum/createAlbum'
      });
    }

    this.globalData = {}
  }
});