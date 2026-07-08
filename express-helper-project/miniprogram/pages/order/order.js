const STATUS_TEXT_MAP = {
  GRABBED: "待取件",
  PICKED_UP: "待配送",
  DELIVERING: "待配送",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
  CANCELED: "已取消"
};

const TYPE_CLASS_MAP = {
  普通: "type-normal",
  生鲜: "type-fresh",
  文件: "type-file",
  大件: "type-large"
};

Page({
  data: {
    list: [],
    filteredList: [],
    currentStatus: "all",
    statusMap: STATUS_TEXT_MAP
  },
  onShow() {
    const app = getApp();
    if (!app.ensureLogin()) {
      return;
    }
    app.refreshUnreadBadge();
    this.loadData();
  },
  onPullDownRefresh() {
    this.loadData(() => wx.stopPullDownRefresh());
  },
  loadData(done) {
    const app = getApp();
    app.request({
      url: `${app.globalData.baseUrl}/order/grabbed/${app.globalData.userId}`,
      success: (res) => {
        const orders = res.data.code === 0 ? (res.data.data || []) : [];
        const normalized = this.normalizeOrders(orders);
        this.setData({ list: normalized });
        this.applyFilters();
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
    return list
      .filter((order) => ["GRABBED", "PICKED_UP", "DELIVERING", "COMPLETED"].includes(order.status))
      .map((order) => {
      const expressType = order.expressType || "普通";
      return {
        ...order,
        _publisherName: order.publisherName || "发布者",
        _publisherShort: (order.publisherName || "发").slice(0, 1),
        _typeLabel: expressType,
        _typeClass: TYPE_CLASS_MAP[expressType] || "type-normal",
        _statusLabel: STATUS_TEXT_MAP[order.status] || "处理中",
        _statusClass: this.getStatusClass(order.status),
        _timeText: this.formatTime(order.createTime || order.createdAt),
        _feeText: order.fee === null || order.fee === undefined || order.fee === "" ? "0" : String(order.fee)
      };
      });
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
  getStatusClass(status) {
    if (status === "COMPLETED") {
      return "status-done";
    }
    if (status === "GRABBED") {
      return "status-pending";
    }
    return "status-doing";
  },
  switchStatus(e) {
    this.setData({
      currentStatus: e.currentTarget.dataset.status
    });
    this.applyFilters();
  },
  applyFilters() {
    const { list, currentStatus } = this.data;
    const filteredList = list.filter((order) => this.matchStatus(order.status, currentStatus));
    this.setData({ filteredList });
  },
  matchStatus(orderStatus, currentStatus) {
    if (currentStatus === "all") {
      return true;
    }
    if (currentStatus === "toPickup") {
      return orderStatus === "GRABBED";
    }
    if (currentStatus === "toDeliver") {
      return ["PICKED_UP", "DELIVERING"].includes(orderStatus);
    }
    return orderStatus === "COMPLETED";
  },
  goToHall() {
    wx.switchTab({
      url: "/pages/index/index"
    });
  },
  stopPropagation() {
    // 阻止点击按钮时触发卡片跳转
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
  viewOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?id=${orderId}`
    });
  }
});
