// story.js
Page({
  data: {
    filePaths: [],
  },

  onLoad(options) {
    if (options.filePaths) {
      const filePaths = JSON.parse(options.filePaths);
      if (filePaths.length > 6) {
        console.error('filePaths cannot exceed six elements');
        return;
      }
      this.setData({ filePaths });
    }
  },

  publish() {
    // Implement publish logic here
    console.log('Publish button clicked');
  },
});