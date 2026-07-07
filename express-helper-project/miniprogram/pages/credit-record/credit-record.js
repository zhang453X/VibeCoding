Page({
  data: {
    type: 'credit',
    records: []
  },
  onLoad(options) {
    const app = getApp();
    if (!app.ensureLogin()) {
      return;
    }
    this.setData({ type: options.type || 'credit' });
    this.loadRecords();
  },
  loadRecords() {
    const app = getApp();
    wx.showLoading({ title: '加载中...' });
    app.request({
      url: `${app.globalData.baseUrl}/user/${app.globalData.userId}/credits`,
      success: (res) => {
        wx.hideLoading();
        if (res.data.code === 0) {
          let records = (res.data.data || []);
          if (this.data.type === 'credit') {
            records = records.filter(record => 
              record.type === 'CREDIT' || 
              record.type === 'ORDER_COMPLETE' || 
              record.type === 'TIMEOUT' || 
              record.type === 'AUTH' || 
              record.type === 'REVIEW'
            );
          } else if (this.data.type === 'green') {
            records = records.filter(record => 
              record.type === 'GREEN' || 
              record.type === 'GREEN_SCORE'
            );
          }
          records = records.map((record) => ({
            ...record,
            createdAt: this.formatTime(record.createdAt)
          }));
          this.setData({ records });
          return;
        }
        wx.showToast({ title: res.data.message || '加载失败', icon: 'none' });
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '加载失败', icon: 'none' });
      }
    });
  },
  formatTime(time) {
    if (!time) return '';
    const date = new Date(time);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },
  goBack() {
    wx.navigateBack();
  }
});
