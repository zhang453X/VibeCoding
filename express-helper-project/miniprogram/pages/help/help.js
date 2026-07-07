Page({
  data: {
    feedbackDialogVisible: false,
    submitting: false,
    feedbackTypeIndex: 0,
    feedbackTypeLabel: "功能异常",
    feedbackTypeOptions: [
      { label: "功能异常", value: "BUG" },
      { label: "页面建议", value: "SUGGESTION" },
      { label: "账号问题", value: "ACCOUNT" },
      { label: "其他反馈", value: "OTHER" }
    ],
    feedbackForm: {
      feedbackType: "BUG",
      content: ""
    },
    faqList: [
      {
        id: 1,
        question: '如何发布订单？',
        answer: '点击底部导航栏的"发布订单"，然后点击"发布新订单"按钮，填写订单信息后提交即可。',
        open: false
      },
      {
        id: 2,
        question: '如何抢单？',
        answer: '在首页（抢单大厅）查看可抢订单，点击"抢单"按钮即可。需要先完成实名认证并通过审核。',
        open: false
      },
      {
        id: 3,
        question: '实名认证需要多长时间审核？',
        answer: '实名认证通常在1-2个工作日内完成审核，请耐心等待。审核结果会通过消息通知您。',
        open: false
      },
      {
        id: 4,
        question: '订单状态有哪些？',
        answer: '订单状态包括：待抢单、已抢单、已取件、配送中、已完成、已取消。',
        open: false
      },
      {
        id: 5,
        question: '如何取消订单？',
        answer: '在"发布订单"页面，找到待抢单的订单，点击"取消"按钮即可取消。已被抢的订单无法取消。',
        open: false
      },
      {
        id: 6,
        question: '订单完成后如何评价？',
        answer: '订单完成后，在"我的订单"或"发布订单"页面找到该订单，点击"确认收到"即可跳转到评价页面。',
        open: false
      }
    ]
  },

  onLoad() {
    const app = getApp();
    if (!app.ensureLogin()) {
      return;
    }
  },

  goBack() {
    wx.navigateBack();
  },

  toggleFaq(e) {
    const index = e.currentTarget.dataset.index;
    const faqList = this.data.faqList;
    faqList[index].open = !faqList[index].open;
    this.setData({ faqList });
  },

  openFeedbackDialog() {
    this.setData({ feedbackDialogVisible: true });
  },

  closeFeedbackDialog() {
    if (this.data.submitting) {
      return;
    }
    this.setData({ feedbackDialogVisible: false });
  },

  handleFeedbackTypeChange(e) {
    const index = Number(e.detail.value || 0);
    const selected = this.data.feedbackTypeOptions[index] || this.data.feedbackTypeOptions[0];
    this.setData({
      feedbackTypeIndex: index,
      feedbackTypeLabel: selected.label,
      "feedbackForm.feedbackType": selected.value
    });
  },

  setFeedbackContent(e) {
    this.setData({ "feedbackForm.content": e.detail.value });
  },

  resetFeedbackForm() {
    this.setData({
      feedbackDialogVisible: false,
      submitting: false,
      feedbackTypeIndex: 0,
      feedbackTypeLabel: this.data.feedbackTypeOptions[0].label,
      feedbackForm: {
        feedbackType: this.data.feedbackTypeOptions[0].value,
        content: ""
      }
    });
  },

  submitFeedback() {
    if (this.data.submitting) {
      return;
    }

    const content = (this.data.feedbackForm.content || "").trim();
    if (!content) {
      wx.showToast({ title: "请填写反馈内容", icon: "none" });
      return;
    }

    this.setData({ submitting: true });
    const app = getApp();
    app.request({
      url: `${app.globalData.baseUrl}/feedback`,
      method: "POST",
      data: {
        feedbackType: this.data.feedbackForm.feedbackType,
        content
      },
      success: (res) => {
        if (res.data.code === 0) {
          wx.showToast({ title: "反馈已提交", icon: "success" });
          this.resetFeedbackForm();
          return;
        }
        wx.showToast({ title: res.data.message || "提交失败", icon: "none" });
      },
      fail: () => {
        wx.showToast({ title: "提交失败，请稍后重试", icon: "none" });
      },
      complete: () => {
        if (this.data.feedbackDialogVisible) {
          this.setData({ submitting: false });
        }
      }
    });
  }
});
