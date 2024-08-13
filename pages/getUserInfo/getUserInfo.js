const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';

Page({
  data: {
    userName: '',
    userAvatarUrl: defaultAvatarUrl,
    openID: '', 
  },

  onLoad: function () {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        if (res.result && res.result.success) {
          // 成功调用，保存openID到本地
          wx.setStorageSync('openID', res.result.openid)
          console.log('openID存储成功: ', res.result.openid)

          this.data.openID = res.result.openid;
        } else {
          console.error('调用云函数失败: ', res)
        }
      },
      fail: err => {
        console.error('调用云函数失败: ', err)
      }
    })
  },

  onUserNameInput: function (e) {
    this.setData({
      userName: e.detail.value
    });
  },

  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    this.setData({
      userAvatarUrl: avatarUrl
    });
  },

  onConfirmClicked: function () {
    const { userName, userAvatarUrl } = this.data;

    if (!userName || !userAvatarUrl) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '上传用户信息...'
    });

    wx.cloud.callFunction({
      name: 'createUserInfo', 
      data: {
        userOpenID: this.data.openID,
        userName: this.data.userName,
        userAvatarUrl: this.data.userAvatarUrl
      },
      success: res => {
        if (res.result.success) {
          console.log('云函数调用成功，用户信息已更新或创建')
        } else {
          console.error('云函数调用失败:', res.result.errorMessage)
        }

        wx.hideLoading();

        // 获取页面传来的事件通道
        const eventChannel = this.getOpenerEventChannel();
        
        wx.navigateBack({
          success: function() {
            // 触发前一个页面的事件
            eventChannel.emit('userInfoUpdated');
          }
        });
      },
      fail: err => {
        console.error('云函数调用失败:', err);

        wx.hideLoading();
      }
    })
   
  }
});