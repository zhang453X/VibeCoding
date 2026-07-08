Page({
  data: {
    list: [],
    statusMap: {
      'PENDING_GRAB': '待抢单',
      'GRABBED': '已抢单',
      'PICKED_UP': '已取件',
      'DELIVERING': '配送中',
      'COMPLETED': '已完成',
      'CANCELLED': '已取消',
      'CANCELED': '已取消'
    },
    showRatingModal: false,
    ratingIndex: 0,
    rating: 5,
    ratingContent: '',
    ratingLoading: false
  },
  onShow() {
    const app = getApp();
    if (!app.ensureLogin()) {
      return;
    }
    this.loadData();
  },
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${id}` });
  },
  stopPropagation() {
    // 阻止事件冒泡
  },
  onPullDownRefresh() {
    this.loadData(() => wx.stopPullDownRefresh());
  },
  loadData(done) {
    const app = getApp();
    app.request({
      url: `${app.globalData.baseUrl}/order/published/${app.globalData.userId}`,
      success: (res) => {
        const orders = res.data.code === 0 ? (res.data.data || []) : [];
        orders.forEach(order => {
          order.rated = order.hasReview || false;
        });
        this.setData({ list: orders });
      },
      fail: () => wx.showToast({ title: "加载失败", icon: "error" }),
      complete: () => {
        if (typeof done === "function") {
          done();
        }
      }
    });
  },
  updateStatus(e) {
    const app = getApp();
    const orderId = e.currentTarget.dataset.id;
    const status = e.currentTarget.dataset.status;
    
    const statusOrder = ['PENDING_GRAB', 'GRABBED', 'PICKED_UP', 'DELIVERING', 'COMPLETED'];
    const currentIndex = statusOrder.indexOf(this.data.list.find(o => o.id === orderId)?.status);
    const targetIndex = statusOrder.indexOf(status);
    
    if (currentIndex >= targetIndex) {
      wx.showToast({ title: '状态不能回退', icon: 'none' });
      return;
    }
    
    app.request({
      url: `${app.globalData.baseUrl}/order/${orderId}/status?operatorId=${app.globalData.userId}&status=${status}`,
      method: "POST",
      success: (res) => {
        if (res.data.code === 0) {
          wx.showToast({ title: "状态已更新", icon: 'success' });
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
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个订单吗？',
      success: (res) => {
        if (res.confirm) {
          app.request({
            url: `${app.globalData.baseUrl}/order/${orderId}/cancel?publisherId=${app.globalData.userId}`,
            method: "POST",
            success: (res) => {
              if (res.data.code === 0) {
                wx.showToast({ title: "已取消", icon: 'success' });
                this.loadData();
                return;
              }
              wx.showToast({ title: res.data.message || "取消失败", icon: "none" });
            },
            fail: () => wx.showToast({ title: "取消失败", icon: "error" })
          });
        }
      }
    });
  },
  republishOrder(e) {
    const app = getApp();
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认重新发布',
      content: '确定要重新发布这个订单吗？',
      success: (res) => {
        if (res.confirm) {
          app.request({
            url: `${app.globalData.baseUrl}/order/${orderId}/republish?publisherId=${app.globalData.userId}`,
            method: "POST",
            success: (res) => {
              if (res.data.code === 0) {
                wx.showToast({ title: "重新发布成功", icon: 'success' });
                this.loadData();
                return;
              }
              wx.showToast({ title: res.data.message || "重新发布失败", icon: "none" });
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
      ratingContent: '',
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
    const revieweeId = order.courierId;
    
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
  }
});
