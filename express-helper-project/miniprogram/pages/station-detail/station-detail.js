Page({
  data: {
    station: null,
    mapPreviewUrl: "",
    amapConfigured: false,
    loading: false
  },
  onLoad(options) {
    if (!options.id) {
      wx.showToast({ title: "参数缺失", icon: "none" });
      return;
    }
    this.stationId = options.id;
    this.loadDetail();
  },
  loadDetail() {
    const app = getApp();
    this.setData({ loading: true });
    app.request({
      url: `${app.globalData.baseUrl}/public/express-stations/${this.stationId}`,
      success: (res) => {
        const data = res.data.code === 0 ? (res.data.data || {}) : {};
        this.setData({
          station: data.station || null,
          mapPreviewUrl: data.mapPreviewUrl || "",
          amapConfigured: !!data.amapConfigured
        });
        if (data.station && data.station.stationName) {
          wx.setNavigationBarTitle({ title: data.station.stationName });
        }
      },
      fail: () => {
        wx.showToast({ title: "加载失败", icon: "none" });
      },
      complete: () => this.setData({ loading: false })
    });
  },
  openLocation() {
    const station = this.data.station;
    if (!station) return;
    wx.openLocation({
      latitude: Number(station.latitude),
      longitude: Number(station.longitude),
      name: station.stationName,
      address: station.detailAddress,
      scale: 18
    });
  },
  copyAddress() {
    const station = this.data.station;
    if (!station || !station.detailAddress) return;
    wx.setClipboardData({
      data: station.detailAddress,
      success: () => wx.showToast({ title: "地址已复制", icon: "none" })
    });
  }
});
