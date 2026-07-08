const app = getApp();

Page({
  data: {
    orderId: null,
    order: {},
    rating: 5,
    content: '',
    submitting: false,
    ratingText: '非常满意'
  },
  ratingTexts: {
    1: '非常不满意',
    2: '不满意',
    3: '一般',
    4: '满意',
    5: '非常满意'
  },
  onLoad(options) {
    if (options.orderId) {
      this.setData({ orderId: options.orderId });
      this.loadOrderDetail(options.orderId);
    }
  },
  loadOrderDetail(orderId) {
    wx.showLoading({ title: '加载中...' });
    app.request({
      url: `${app.globalData.baseUrl}/order/${orderId}`,
      success: (res) => {
        wx.hideLoading();
        if (res.data.code === 0) {
          this.setData({ order: res.data.data || {} });
        } else {
          wx.showToast({ title: res.data.message || '加载失败', icon: 'none' });
          setTimeout(() => wx.navigateBack(), 1500);
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },
  selectRating(e) {
    const rating = e.currentTarget.dataset.rating;
    this.setData({ 
      rating, 
      ratingText: this.ratingTexts[rating] 
    });
  },
  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },
  submitReview() {
    if (this.data.submitting) return;
    
    if (this.data.rating < 1 || this.data.rating > 5) {
      wx.showToast({ title: '请选择评分', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认收到',
      content: '确定确认收到吗？',
      success: (res) => {
        if (res.confirm) {
          this.doSubmitReview();
        }
      }
    });
  },
  doSubmitReview() {
    this.setData({ submitting: true });
    wx.showLoading({ title: '提交中...' });
    
    const reviewData = {
      orderId: this.data.orderId,
      reviewerId: app.globalData.userId,
      revieweeId: this.data.order.courierId,
      rating: this.data.rating,
      content: this.data.content
    };

    app.request({
      url: `${app.globalData.baseUrl}/review`,
      method: 'POST',
      data: reviewData,
      success: (res) => {
        wx.hideLoading();
        this.setData({ submitting: false });
        if (res.data.code === 0) {
          wx.showToast({ title: '确认收到成功', icon: 'success' });
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        } else {
          wx.showToast({ title: res.data.message || '确认收到失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.hideLoading();
        this.setData({ submitting: false });
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },
  goBack() {
    wx.navigateBack();
  }
});
