Page({
  data: {
    form: {
      studentNo: "",
      username: "",
      nickname: "",
      phone: "",
      password: "",
      confirmPassword: ""
    },
    agree: true,
    loading: false
  },
  setField(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ [`form.${key}`]: e.detail.value });
  },
  toggleAgree() {
    this.setData({ agree: !this.data.agree });
  },
  validateForm() {
    const form = this.data.form;
    const studentNo = (form.studentNo || "").trim();
    const username = (form.username || "").trim();
    const nickname = (form.nickname || "").trim();
    const phone = (form.phone || "").trim();
    const password = (form.password || "").trim();
    const confirmPassword = (form.confirmPassword || "").trim();

    if (!studentNo || !nickname || !phone || !password || !confirmPassword) {
      return "请填写完整注册信息";
    }
    if (!/^[0-9A-Za-z]{6,20}$/.test(studentNo)) {
      return "学号需为 6-20 位字母或数字";
    }
    if (username && !/^[0-9A-Za-z_]{4,20}$/.test(username)) {
      return "用户名需为 4-20 位字母、数字或下划线";
    }
    if (nickname.length < 2 || nickname.length > 20) {
      return "昵称长度需为 2-20 位";
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return "手机号格式不正确";
    }
    if (password.length < 6 || password.length > 20) {
      return "密码长度需为 6-20 位";
    }
    if (password !== confirmPassword) {
      return "两次输入的密码不一致";
    }
    if (!this.data.agree) {
      return "请先确认注册说明";
    }
    return "";
  },
  toLogin() {
    wx.navigateBack();
  },
  submit() {
    if (this.data.loading) {
      return;
    }
    const app = getApp();
    const error = this.validateForm();
    if (error) {
      wx.showToast({ title: error, icon: "none" });
      return;
    }
    const payload = {
      studentNo: this.data.form.studentNo.trim(),
      username: (this.data.form.username || "").trim(),
      nickname: this.data.form.nickname.trim(),
      phone: this.data.form.phone.trim(),
      password: this.data.form.password.trim()
    };
    this.setData({ loading: true });
    app.request({
      url: `${app.globalData.baseUrl}/user/register`,
      method: "POST",
      data: payload,
      success: (res) => {
        if (res.data.code === 0) {
          wx.setStorageSync("pendingLoginAccount", payload.username || payload.studentNo);
          wx.showModal({
            title: "注册成功",
            content: "账号已创建成功。你现在可以登录使用发布功能，完成实名认证后可开启接单。",
            confirmText: "去登录",
            showCancel: false,
            success: () => {
              wx.navigateBack();
            }
          });
          return;
        }
        wx.showToast({ title: res.data.message || "注册失败", icon: "none" });
      },
      fail: () => wx.showToast({ title: "注册失败", icon: "none" }),
      complete: () => {
        this.setData({ loading: false });
      }
    });
  }
});
