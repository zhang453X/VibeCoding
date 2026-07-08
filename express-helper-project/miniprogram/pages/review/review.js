Page({
  data: {
    activeTab: "written",
    writtenReviews: [],
    receivedReviews: [],
    showAppealModal: false,
    appealReason: "",
    appealLoading: false,
    currentAppealOrderId: null
  },

  onLoad() {
    const app = getApp();
    if (!app.ensureLogin()) {
      return;
    }
  },

  onShow() {
    this.loadReviewCenter();
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (!tab || tab === this.data.activeTab) {
      return;
    }
    this.setData({ activeTab: tab });
  },

  loadReviewCenter() {
    const app = getApp();
    wx.showLoading({ title: "加载中..." });
    app.request({
      url: `${app.globalData.baseUrl}/review/user/${app.globalData.userId}/center`,
      success: (res) => {
        wx.hideLoading();
        if (res.data.code !== 0) {
          wx.showToast({ title: res.data.message || "加载失败", icon: "none" });
          return;
        }
        const data = res.data.data || {};
        this.setData({
          writtenReviews: this.formatReviews(data.written || []),
          receivedReviews: this.formatReviews(data.received || [])
        });
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: "加载失败", icon: "none" });
      }
    });
  },

  formatReviews(list) {
    return list.map((item) => ({
      ...item,
      contentText: (item.content || "").trim() || "对方未填写文字评价",
      createdAtText: this.formatTime(item.createdAt),
      stars: this.buildStars(item.rating || 0),
      canAppeal: !item.appealStatus,
      appealStatusText: this.getAppealStatusText(item.appealStatus),
      appealStatusType: this.getAppealStatusType(item.appealStatus)
    }));
  },

  getAppealStatusText(status) {
    const map = {
      PENDING: "待处理",
      DONE: "已通过",
      RESOLVED: "已通过",
      REJECTED: "已驳回"
    };
    return map[status] || "";
  },

  getAppealStatusType(status) {
    const map = {
      PENDING: "pending",
      DONE: "done",
      RESOLVED: "done",
      REJECTED: "rejected"
    };
    return map[status] || "";
  },

  showAppealModal(e) {
    const orderId = e.currentTarget.dataset.orderId;
    if (!orderId || this.data.appealLoading) {
      return;
    }
    this.setData({
      showAppealModal: true,
      appealReason: "",
      currentAppealOrderId: orderId
    });
  },

  hideAppealModal() {
    if (this.data.appealLoading) {
      return;
    }
    this.setData({
      showAppealModal: false,
      appealReason: "",
      currentAppealOrderId: null
    });
  },

  onAppealInput(e) {
    this.setData({
      appealReason: e.detail.value
    });
  },

  submitAppeal() {
    const app = getApp();
    const reason = (this.data.appealReason || "").trim();
    if (!this.data.currentAppealOrderId) {
      wx.showToast({ title: "订单信息有误", icon: "none" });
      return;
    }
    if (reason.length < 10) {
      wx.showToast({ title: "申诉原因至少10个字", icon: "none" });
      return;
    }
    this.setData({ appealLoading: true });
    app.request({
      url: `${app.globalData.baseUrl}/appeal`,
      method: "POST",
      data: {
        orderId: this.data.currentAppealOrderId,
        initiatorId: app.globalData.userId,
        appealType: "APPEAL",
        description: reason
      },
      success: (res) => {
        this.setData({ appealLoading: false });
        if (res.data.code !== 0) {
          wx.showToast({ title: res.data.message || "申诉提交失败", icon: "none" });
          return;
        }
        wx.showToast({ title: "申诉提交成功", icon: "success" });
        this.setData({
          showAppealModal: false,
          appealReason: "",
          currentAppealOrderId: null
        });
        this.loadReviewCenter();
      },
      fail: () => {
        this.setData({ appealLoading: false });
        wx.showToast({ title: "申诉提交失败", icon: "none" });
      }
    });
  },

  buildStars(rating) {
    const value = Number(rating) || 0;
    return [1, 2, 3, 4, 5].map((item) => ({
      value: item,
      active: item <= value
    }));
  },

  formatTime(time) {
    if (!time) {
      return "";
    }
    const date = new Date(time);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hour}:${minute}`;
  }
});
