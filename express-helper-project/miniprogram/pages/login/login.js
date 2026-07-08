Page({
  data: {
    username: "",
    password: "",
    loading: false
  },
  onShow() {
    const app = getApp();
    if (app.globalData.token) {
      wx.switchTab({ url: "/pages/index/index" });
      return;
    }
    const pendingAccount = wx.getStorageSync("pendingLoginAccount");
    if (pendingAccount) {
      this.setData({ username: pendingAccount });
      wx.removeStorageSync("pendingLoginAccount");
    }
  },
  onUsername(e) {
    this.setData({ username: e.detail.value });
  },
  onPassword(e) {
    this.setData({ password: e.detail.value });
  },
  submit() {
    if (this.data.loading) {
      return;
    }
    const app = getApp();
    const username = (this.data.username || "").trim();
    const password = (this.data.password || "").trim();
    if (!username || !password) {
      wx.showToast({ title: "请输入账号密码", icon: "none" });
      return;
    }
    this.setData({ loading: true });
    app.login(username, password, (res) => {
      this.setData({ loading: false });
      if (res.data.code === 0) {
        wx.showToast({ title: "登录成功" });
        wx.switchTab({ url: "/pages/index/index" });
        return;
      }
      wx.showToast({ title: res.data.message || "登录失败", icon: "none" });
    });
  },
  toRegister() {
    wx.navigateTo({ url: "/pages/register/register" });
  }
});
