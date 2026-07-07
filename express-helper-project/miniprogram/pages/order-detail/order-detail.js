const app = getApp();

Page({
  data: {
    orderId: null,
    order: {},
    userId: null,
    canGrab: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ orderId: options.id });
      this.loadOrderDetail(options.id);
    }
  },

  onShow() {
    const appInstance = getApp();
    if (!appInstance.ensureLogin()) {
      return;
    }
    const userInfo = wx.getStorageSync("userInfo");
    if (userInfo) {
      this.setData({ userId: userInfo.id, canGrab: userInfo.courierEnabled === 1 });
    }
  },

  loadOrderDetail(orderId) {
    wx.showLoading({ title: "加载中..." });
    app.request({
      url: `${app.globalData.baseUrl}/order/${orderId}`,
      success: (res) => {
        wx.hideLoading();
        if (res.data.code === 0) {
          const order = res.data.data;
          if (order) {
            this.setData({ order });
          } else {
            wx.showToast({ title: "订单不存在", icon: "none" });
            setTimeout(() => wx.navigateBack(), 1500);
          }
        } else {
          wx.showToast({ title: res.data.message || "加载失败", icon: "none" });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: "网络错误", icon: "none" });
      }
    });
  },
  grab(e) {
    if (Number(this.data.order.publisherId) === Number(this.data.userId)) {
      wx.showToast({ title: "不能抢自己发布的订单", icon: "none" });
      return;
    }
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: "确认抢单",
      content: "确定要抢这个订单吗？",
      success: (res) => {
        if (res.confirm) {
          this.doGrab(id);
        }
      }
    });
  },

  doGrab(id) {
    const appInstance = getApp();
    wx.showLoading({ title: "抢单中..." });
    appInstance.request({
      url: `${app.globalData.baseUrl}/order/${id}/grab`,
      method: "POST",
      data: { courierId: appInstance.globalData.userId },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code === 0) {
          wx.showToast({ title: "抢单成功" });
          setTimeout(() => {
            wx.switchTab({ url: "/pages/order/order" });
          }, 1500);
        } else {
          wx.showToast({ title: res.data.message || "抢单失败", icon: "none" });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: "网络错误", icon: "none" });
      }
    });
  },
  confirmReceive(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: "确认收货",
      content: "确定已收到快递吗？",
      success: (res) => {
        if (res.confirm) {
          this.doConfirmReceive(id);
        }
      }
    });
  },
  markPicked(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: "确认取件",
      content: "确认已成功取到快递，进入待配送吗？",
      success: (res) => {
        if (res.confirm) {
          this.updateTaskStatus(id, "DELIVERING", "确认取件成功");
        }
      }
    });
  },
  finishTask(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: "完成订单",
      content: "确认本次配送任务已经完成吗？",
      success: (res) => {
        if (res.confirm) {
          this.updateTaskStatus(id, "COMPLETED", "订单已完成");
        }
      }
    });
  },
  doConfirmReceive(id) {
    this.updateTaskStatus(id, "COMPLETED", "确认收货成功");
  },
  updateTaskStatus(id, status, successText) {
    const appInstance = getApp();
    wx.showLoading({ title: "确认中..." });
    appInstance.request({
      url: `${app.globalData.baseUrl}/order/${id}/status`,
      method: "POST",
      data: { operatorId: appInstance.globalData.userId, status },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code === 0) {
          wx.showToast({ title: successText });
          this.loadOrderDetail(id);
        } else {
          wx.showToast({ title: res.data.message || "操作失败", icon: "none" });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: "网络错误", icon: "none" });
      }
    });
  },
  goToReview(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/order-review/order-review?orderId=${id}` });
  }
});
