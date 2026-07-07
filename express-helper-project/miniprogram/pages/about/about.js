Page({
  data: {
    appName: "校园快递互助",
    intro: "校园快递互助平台致力于为同学提供便捷的快递代取、任务接单与评价服务，帮助校园内实现更高效、更安全的快递互助体验。",
    email: "2630879147@qq.com",
    phone: "18965665836"
  },

  copyEmail() {
    wx.setClipboardData({
      data: this.data.email,
      success: () => {
        wx.showToast({
          title: "邮箱已复制",
          icon: "success"
        });
      }
    });
  },

  callPhone() {
    wx.makePhoneCall({
      phoneNumber: this.data.phone,
      fail: () => {
        wx.showToast({
          title: "拨号失败",
          icon: "none"
        });
      }
    });
  }
});
