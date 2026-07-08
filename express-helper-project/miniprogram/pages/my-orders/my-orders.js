Page({
  data: {
    mode: "published",
    list: [],
    sections: [],
    showRatingModal: false,
    ratingIndex: 0,
    rating: 5,
    ratingContent: "",
    ratingLoading: false,
    showViewReviewModal: false,
    currentReview: null,
    showAppealModal: false,
    appealType: "APPEAL",
    appealTitle: "申诉评价",
    appealLabel: "申诉原因：",
    appealPlaceholder: "请输入申诉原因，至少10个字",
    appealSubmitText: "提交申诉",
    appealReason: "",
    appealLoading: false,
    currentOrderId: null
  },
  onShow() {
    const app = getApp();
    if (!app.ensureLogin()) {
      return;
    }
    app.refreshUnreadBadge();
    this.loadData();
  },
  switchMode(e) {
    const mode = e.currentTarget.dataset.mode;
    if (!mode || mode === this.data.mode) {
      return;
    }
    this.setData({ mode });
    this.loadData();
  },
  loadData(done) {
    const app = getApp();
    const api = this.data.mode === "published" ? "published" : "grabbed";
    app.request({
      url: `${app.globalData.baseUrl}/order/${api}/${app.globalData.userId}`,
      success: (res) => {
        const orders = res.data.code === 0 ? (res.data.data || []) : [];
        const list = this.normalizeOrders(orders);
        this.setData({ list });
        this.buildSections();
      },
      fail: () => wx.showToast({ title: "加载失败", icon: "error" }),
      complete: () => {
        if (typeof done === "function") {
          done();
        }
      }
    });
  },
  normalizeOrders(list) {
    return list.map((order) => ({
      ...order,
      rated: !!order.hasReview,
      _partnerName: this.data.mode === "published"
        ? (order.courierName || (order.status === "PENDING_GRAB" ? "等待接单" : "已接单同学"))
        : (order.publisherName || "发布者"),
      _partnerShort: ((this.data.mode === "published" ? order.courierName : order.publisherName) || (this.data.mode === "published" ? "单" : "发")).slice(0, 1),
      _timeText: this.formatTime(order.createTime || order.createdAt),
      _feeText: order.fee === null || order.fee === undefined || order.fee === "" ? "0" : String(order.fee),
      _statusLabel: this.getStatusLabel(order.status),
      _statusClass: this.getStatusClass(order.status),
      _routeText: `${order.stationName || "待补充"} → ${order.deliveryLocation || "待补充"}`
    }));
  },
  formatTime(value) {
    if (!value) {
      return "时间未知";
    }
    const text = String(value).trim().replace("T", " ");
    const match = text.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})\s+(\d{1,2}):(\d{1,2})/);
    if (!match) {
      return text.length > 16 ? text.slice(0, 16) : text;
    }
    const [, , month, day, hour, minute] = match;
    return `${month.padStart(2, "0")}-${day.padStart(2, "0")} ${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
  },
  getStatusLabel(status) {
    if (status === "PENDING_GRAB") {
      return "待接单";
    }
    if (status === "GRABBED") {
      return "待取货";
    }
    if (status === "PICKED_UP") {
      return "待送达";
    }
    if (status === "DELIVERING") {
      return "配送中";
    }
    if (status === "COMPLETED") {
      return "已完成";
    }
    if (status === "APPEALING") {
      return "申诉中";
    }
    return "已取消";
  },
  getStatusClass(status) {
    if (status === "COMPLETED") {
      return "status-done";
    }
    if (status === "APPEALING") {
      return "status-appealing";
    }
    if (status === "CANCELLED" || status === "CANCELED") {
      return "status-cancel";
    }
    if (status === "PENDING_GRAB") {
      return "status-pending";
    }
    return "status-doing";
  },
  buildSections() {
    const templates = this.data.mode === "published"
      ? [
          { key: "progress", title: "进行中", statuses: ["GRABBED", "PICKED_UP", "DELIVERING"] },
          { key: "pending", title: "待接单", statuses: ["PENDING_GRAB"] },
          { key: "appealing", title: "申诉中", statuses: ["APPEALING"] },
          { key: "completed", title: "已完成", statuses: ["COMPLETED"] },
          { key: "cancelled", title: "已取消", statuses: ["CANCELLED", "CANCELED"] }
        ]
      : [
          { key: "toPickup", title: "待取货", statuses: ["GRABBED"] },
          { key: "delivering", title: "配送中", statuses: ["PICKED_UP", "DELIVERING"] },
          { key: "appealing", title: "申诉中", statuses: ["APPEALING"] },
          { key: "completed", title: "已完成", statuses: ["COMPLETED"] }
        ];

    const sections = templates
      .map((section) => ({
        ...section,
        list: this.data.list.filter((order) => section.statuses.includes(order.status))
      }))
      .filter((section) => section.list.length > 0);

    this.setData({ sections });
  },
  goToPublishOrder() {
    wx.switchTab({
      url: "/pages/publish-order/publish-order"
    });
  },
  goToHall() {
    wx.switchTab({
      url: "/pages/index/index"
    });
  },
  viewOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?id=${orderId}`
    });
  },
  goToReview(e) {
    const orderId = e.currentTarget.dataset.orderId;
    wx.navigateTo({
      url: `/pages/order-review/order-review?orderId=${orderId}`
    });
  },
  contactUser(e) {
    const phone = e.currentTarget.dataset.phone;
    if (!phone) {
      wx.showToast({ title: "暂无联系电话", icon: "none" });
      return;
    }
    wx.makePhoneCall({
      phoneNumber: String(phone)
    });
  },
  stopPropagation() {
    // 阻止按钮触发卡片点击
  },
  updateStatus(e) {
    const app = getApp();
    const orderId = Number(e.currentTarget.dataset.id);
    const status = e.currentTarget.dataset.status;
    const currentOrder = this.data.list.find((item) => Number(item.id) === orderId);
    const statusOrder = ["PENDING_GRAB", "GRABBED", "PICKED_UP", "DELIVERING", "COMPLETED"];
    const currentIndex = statusOrder.indexOf(currentOrder?.status);
    const targetIndex = statusOrder.indexOf(status);

    if (currentIndex >= targetIndex) {
      wx.showToast({ title: "状态不能回退", icon: "none" });
      return;
    }

    app.request({
      url: `${app.globalData.baseUrl}/order/${orderId}/status?operatorId=${app.globalData.userId}&status=${status}`,
      method: "POST",
      success: (res) => {
        if (res.data.code === 0) {
          wx.showToast({ title: "状态已更新", icon: "success" });
          this.loadData();
          return;
        }
        wx.showToast({ title: res.data.message || "更新失败", icon: "none" });
      },
      fail: () => wx.showToast({ title: "更新失败", icon: "error" })
    });
  },
  cancelOrder(e) {
    const app = getApp();
    const orderId = Number(e.currentTarget.dataset.id);
    wx.showModal({
      title: "确认取消",
      content: "确定要取消这个订单吗？",
      success: (res) => {
        if (res.confirm) {
          app.request({
            url: `${app.globalData.baseUrl}/order/${orderId}/cancel?publisherId=${app.globalData.userId}`,
            method: "POST",
            success: (response) => {
              if (response.data.code === 0) {
                wx.showToast({ title: "已取消", icon: "success" });
                this.loadData();
                return;
              }
              wx.showToast({ title: response.data.message || "取消失败", icon: "none" });
            },
            fail: () => wx.showToast({ title: "取消失败", icon: "error" })
          });
        }
      }
    });
  },
  republishOrder(e) {
    const app = getApp();
    const orderId = Number(e.currentTarget.dataset.id);
    wx.showModal({
      title: "确认重新发布",
      content: "确定要重新发布这个订单吗？",
      success: (res) => {
        if (res.confirm) {
          app.request({
            url: `${app.globalData.baseUrl}/order/${orderId}/republish?publisherId=${app.globalData.userId}`,
            method: "POST",
            success: (response) => {
              if (response.data.code === 0) {
                wx.showToast({ title: "重新发布成功", icon: "success" });
                this.loadData();
                return;
              }
              wx.showToast({ title: response.data.message || "重新发布失败", icon: "none" });
            },
            fail: () => wx.showToast({ title: "重新发布失败", icon: "error" })
          });
        }
      }
    });
  },
  showRatingModal(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      ratingIndex: index,
      rating: 5,
      ratingContent: "",
      showRatingModal: true
    });
  },
  hideRatingModal() {
    this.setData({
      showRatingModal: false
    });
  },
  setRating(e) {
    this.setData({
      rating: e.currentTarget.dataset.rating
    });
  },
  onRatingInput(e) {
    this.setData({
      ratingContent: e.detail.value
    });
  },
  submitRating() {
    const app = getApp();
    const { ratingIndex, rating, ratingContent } = this.data;
    const order = this.data.list[ratingIndex];

    if (!order) {
      return;
    }

    const reviewerId = app.globalData.userId;
    const revieweeId = this.data.mode === "published" ? order.courierId : order.publisherId;

    if (!revieweeId) {
      wx.showToast({ title: "暂不可评价", icon: "none" });
      return;
    }

    this.setData({ ratingLoading: true });
    app.request({
      url: `${app.globalData.baseUrl}/review`,
      method: "POST",
      data: {
        orderId: order.id,
        reviewerId,
        revieweeId,
        rating,
        content: ratingContent || (rating >= 4 ? "服务很好，非常满意！" : "服务有待改进")
      },
      success: (res) => {
        this.setData({ ratingLoading: false, showRatingModal: false });
        if (res.data.code === 0) {
          wx.showToast({ title: "评价成功", icon: "success" });
          this.loadData();
          return;
        }
        wx.showToast({ title: res.data.message || "评价失败", icon: "none" });
      },
      fail: () => {
        this.setData({ ratingLoading: false });
        wx.showToast({ title: "评价失败", icon: "error" });
      }
    });
  },
  viewReview(e) {
    const app = getApp();
    const orderId = e.currentTarget.dataset.id;
    this.setData({ currentOrderId: orderId });

    app.request({
      url: `${app.globalData.baseUrl}/review/order/${orderId}/for-user/${app.globalData.userId}`,
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({
            currentReview: res.data.data,
            showViewReviewModal: true
          });
        } else {
          wx.showToast({ title: "获取评价失败", icon: "none" });
        }
      },
      fail: () => wx.showToast({ title: "获取评价失败", icon: "error" })
    });
  },
  hideViewReviewModal() {
    this.setData({
      showViewReviewModal: false,
      currentReview: null
    });
  },
  showAppealModal() {
    this.setData({
      showAppealModal: true,
      appealType: "APPEAL",
      appealTitle: "申诉评价",
      appealLabel: "申诉原因：",
      appealPlaceholder: "请输入申诉原因，至少10个字",
      appealSubmitText: "提交申诉",
      appealReason: ""
    });
  },
  showComplaintModal(e) {
    const orderId = e.currentTarget.dataset.orderId;
    if (!orderId || this.data.appealLoading) {
      return;
    }
    this.setData({
      currentOrderId: Number(orderId),
      showAppealModal: true,
      appealType: "COMPLAINT",
      appealTitle: "投诉代取员",
      appealLabel: "投诉原因：",
      appealPlaceholder: "请输入投诉原因，至少10个字",
      appealSubmitText: "提交投诉",
      appealReason: ""
    });
  },
  hideAppealModal() {
    this.setData({
      showAppealModal: false
    });
  },
  onAppealInput(e) {
    this.setData({
      appealReason: e.detail.value
    });
  },
  submitAppeal() {
    const app = getApp();
    const { appealReason, currentOrderId, appealType } = this.data;
    const typeText = appealType === "COMPLAINT" ? "投诉" : "申诉";

    if (!appealReason || appealReason.trim().length < 10) {
      wx.showToast({ title: `${typeText}原因至少10个字`, icon: "none" });
      return;
    }

    if (!currentOrderId) {
      wx.showToast({ title: "订单信息缺失", icon: "none" });
      return;
    }

    this.setData({ appealLoading: true });
    app.request({
      url: `${app.globalData.baseUrl}/appeal`,
      method: "POST",
      data: {
        orderId: currentOrderId,
        initiatorId: app.globalData.userId,
        appealType,
        description: appealReason
      },
      success: (res) => {
        this.setData({ appealLoading: false, showAppealModal: false, showViewReviewModal: false });
        if (res.data.code === 0) {
          wx.showToast({ title: `${typeText}提交成功`, icon: "success" });
          this.loadData();
          return;
        }
        wx.showToast({ title: res.data.message || `${typeText}提交失败`, icon: "none" });
      },
      fail: () => {
        this.setData({ appealLoading: false });
        wx.showToast({ title: `${typeText}提交失败`, icon: "error" });
      }
    });
  }
});
