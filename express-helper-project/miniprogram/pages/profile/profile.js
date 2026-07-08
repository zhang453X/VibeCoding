const AI_QUICK_QUESTIONS = [
  "怎么抢单？",
  "为什么看不到完整取件码？",
  "订单完成后怎么评价？"
];

Page({
  data: {
    profile: {},
    authInfo: {},
    authText: "未认证",
    stats: {
      publishCount: 0,
      grabCount: 0,
      creditScore: 0
    },
    showAiDialog: false,
    aiMessages: [],
    aiInput: "",
    aiLoading: false,
    aiScrollIntoView: "",
    aiQuickQuestions: AI_QUICK_QUESTIONS
  },
  onShow() {
    const app = getApp();
    if (!app.ensureLogin()) {
      return;
    }
    app.refreshUnreadBadge();
    this.loadProfile();
  },
  loadProfile() {
    const app = getApp();
    app.request({
      url: `${app.globalData.baseUrl}/user/${app.globalData.userId}/profile`,
      success: (res) => {
        if (res.data.code === 0) {
          const profile = res.data.data || {};
          this.setData({
            profile,
            "stats.creditScore": profile.creditScore || 0
          });
          return;
        }
        wx.showToast({ title: res.data.message || "加载失败", icon: "none" });
      }
    });
    app.request({
      url: `${app.globalData.baseUrl}/auth/latest/${app.globalData.userId}`,
      success: (res) => {
        const auth = res.data.data || {};
        let authText = "未认证";
        if (auth.status === "PENDING") {
          authText = "审核中";
        } else if (auth.status === "APPROVED") {
          authText = "已通过";
        } else if (auth.status === "REJECTED") {
          authText = "已驳回";
        }
        this.setData({ authInfo: auth, authText });
      }
    });
    this.loadStats();
  },
  loadStats() {
    const app = getApp();
    app.request({
      url: `${app.globalData.baseUrl}/order/published/${app.globalData.userId}`,
      success: (res) => {
        const list = res.data.code === 0 ? (res.data.data || []) : [];
        this.setData({
          "stats.publishCount": list.length
        });
      }
    });
    app.request({
      url: `${app.globalData.baseUrl}/order/grabbed/${app.globalData.userId}`,
      success: (res) => {
        const list = res.data.code === 0 ? (res.data.data || []) : [];
        this.setData({
          "stats.grabCount": list.length
        });
      }
    });
  },
  chooseAvatar() {
    const app = getApp();
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.uploadAvatar(tempFilePath);
      }
    });
  },
  uploadAvatar(filePath) {
    const app = getApp();
    wx.showLoading({ title: "上传中..." });
    wx.uploadFile({
      url: `${app.globalData.baseUrl}/upload/avatar`,
      filePath: filePath,
      name: 'file',
      header: {
        ...(app.globalData.token ? { Authorization: `Bearer ${app.globalData.token}` } : {})
      },
      success: (res) => {
        wx.hideLoading();
        const data = JSON.parse(res.data);
        if (data.code === 0) {
          this.setData({
            'profile.avatar': data.data.url
          });
          wx.showToast({ title: "上传成功", icon: "success" });
        } else {
          wx.showToast({ title: data.message || "上传失败", icon: "none" });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: "上传失败", icon: "none" });
      }
    });
  },
  goToEdit() {
    wx.navigateTo({ url: "/pages/edit-profile/edit-profile" });
  },
  goToChangePassword() {
    wx.navigateTo({ url: "/pages/change-password/change-password" });
  },
  goToAddressBook() {
    wx.navigateTo({ url: "/pages/address-book/address-book" });
  },
  goToCreditRecord(e) {
    const type = e.currentTarget.dataset.type;
    wx.navigateTo({ url: `/pages/credit-record/credit-record?type=${type}` });
  },
  goToAuth() {
    wx.navigateTo({ url: "/pages/auth/auth" });
  },
  goToMyReviews() {
    wx.navigateTo({ url: "/pages/review/review" });
  },
  goToHelp() {
    wx.navigateTo({ url: "/pages/help/help" });
  },
  goToAbout() {
    wx.navigateTo({ url: "/pages/about/about" });
  },
  openAiDialog() {
    if (!this.data.showAiDialog) {
      this.setData({ showAiDialog: true });
    }
    if (this.data.aiMessages.length === 0) {
      this.appendAiMessage("assistant", "你好，我是AI客服。");
      return;
    }
    this.scrollAiToBottom();
  },
  closeAiDialog() {
    this.setData({ showAiDialog: false });
  },
  onAiInput(e) {
    this.setData({ aiInput: e.detail.value });
  },
  useAiQuickQuestion(e) {
    const text = e.currentTarget.dataset.text || "";
    if (!text) {
      return;
    }
    this.setData({ aiInput: text });
  },
  sendAiMessage() {
    if (this.data.aiLoading) {
      return;
    }
    const content = (this.data.aiInput || "").trim();
    if (!content) {
      wx.showToast({ title: "请输入问题", icon: "none" });
      return;
    }

    const history = this.data.aiMessages
      .filter((item) => item.role === "user" || item.role === "assistant")
      .map((item) => ({
        role: item.role,
        content: item.content
      }))
      .slice(-10);

    this.appendAiMessage("user", content);
    this.setData({ aiInput: "", aiLoading: true });

    const app = getApp();
    app.request({
      url: `${app.globalData.baseUrl}/user/${app.globalData.userId}/ai-chat`,
      method: "POST",
      timeout: 60000,
      data: {
        message: content,
        history
      },
      success: (res) => {
        if (res.data.code === 0) {
          const reply = (((res.data || {}).data || {}).reply || "").trim();
          this.appendAiMessage("assistant", reply || "AI客服暂时没有返回内容，请稍后再试。");
          return;
        }
        this.appendAiMessage("assistant", res.data.message || "AI客服暂时不可用，请稍后再试。");
      },
      fail: (err) => {
        const errMsg = (err && err.errMsg) || "";
        if (errMsg.includes("timeout")) {
          this.appendAiMessage("assistant", "请求超时，AI回复时间较长，请稍后重试。");
          return;
        }
        this.appendAiMessage("assistant", "网络异常，AI客服暂时不可用，请稍后再试。");
      },
      complete: () => {
        this.setData({ aiLoading: false });
      }
    });
  },
  appendAiMessage(role, content) {
    const messageId = `ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const messages = this.data.aiMessages.concat({
      id: messageId,
      role,
      content
    }).slice(-20);
    this.setData({ aiMessages: messages }, () => {
      this.scrollAiToBottom(messageId);
    });
  },
  scrollAiToBottom(messageId) {
    const target = messageId || (this.data.aiMessages.length ? this.data.aiMessages[this.data.aiMessages.length - 1].id : "");
    if (!target) {
      return;
    }
    this.setData({ aiScrollIntoView: target });
    setTimeout(() => {
      this.setData({ aiScrollIntoView: "" });
    }, 100);
  },
  comingSoon() {
    wx.showToast({ title: "功能开发中", icon: "none" });
  },
  logout() {
    const app = getApp();
    wx.showModal({
      title: "确认退出",
      content: "确定要退出当前账号并返回登录页吗？",
      success: (res) => {
        if (res.confirm) {
          app.logout();
        }
      }
    });
  }
});
