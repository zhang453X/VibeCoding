Page({
  data: {
    list: [],
    loading: false
  },
  onShow() {
    this.loadStations();
  },
  onPullDownRefresh() {
    this.loadStations(() => wx.stopPullDownRefresh());
  },
  loadStations(done) {
    const app = getApp();
    this.setData({ loading: true });
    app.request({
      url: `${app.globalData.baseUrl}/public/express-stations`,
      success: (res) => {
        const list = res.data.code === 0 ? (res.data.data || []) : [];
        this.setData({ list });
      },
      fail: () => {
        wx.showToast({ title: "加载失败", icon: "none" });
      },
      complete: () => {
        this.setData({ loading: false });
        if (typeof done === "function") {
          done();
        }
      }
    });
  },
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/station-detail/station-detail?id=${id}`
    });
  }
});
