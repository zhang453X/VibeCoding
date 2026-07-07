const CATEGORY_OPTIONS = [
  { label: "全部", value: "all" },
  { label: "普通快递", value: "普通" },
  { label: "生鲜", value: "生鲜" },
  { label: "文件", value: "文件" },
  { label: "大件", value: "大件" }
];

const TYPE_CLASS_MAP = {
  普通: "type-normal",
  生鲜: "type-fresh",
  文件: "type-file",
  大件: "type-large"
};

const HERO_BANNERS = [
  {
    id: "hero-main",
    image: "https://p26-doubao-search-sign.byteimg.com/labis/image/521f09e438d02545b9897e6c76c9e9ed~tplv-be4g95zd3a-image.jpeg?lk3s=feb11e32&x-expires=1794299321&x-signature=1ZP3HQSY2kTeC%2Bz1%2FmccrAsiMHY%3D",
    title: "校园快递互助",
    subtitle: "欢迎回来，{nickname}。让取快递更便捷，同学互助更温暖。",
    action: "tasks",
    showOverlay: true
  },
  {
    id: "hero-banner-1",
    image: "../../images/轮播1.jpg",
    action: "",
    showOverlay: false
  },
  {
    id: "hero-banner-2",
    image: "../../images/轮播2.jpg",
    action: "",
    showOverlay: false
  }
];

Page({
  data: {
    statusBarHeight: 20,
    orders: [],
    filteredOrders: [],
    loading: false,
    refreshing: false,
    hasUnreadNotice: false,
    canGrab: false,
    authTip: "",
    nickname: "",
    studentNo: "",
    userId: null,
    avatar: "",
    authStatus: null,
    currentCategory: "all",
    categoryOptions: CATEGORY_OPTIONS,
    scrollTarget: "",
    heroBanners: [],
    currentHeroIndex: 0
  },
  onShow() {
    const app = getApp();
    if (!app.ensureLogin()) {
      return;
    }
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20
    });
    app.refreshUnreadBadge();
    this.syncUnreadState();
    this.loadProfileAndOrders();
  },
  syncUnreadState() {
    const app = getApp();
    app.request({
      url: `${app.globalData.baseUrl}/user/${app.globalData.userId}/notices/unread-count`,
      success: (res) => {
        const count = res.data.code === 0 ? (res.data.data || 0) : 0;
        this.setData({
          hasUnreadNotice: count > 0
        });
      }
    });
  },
  onRefresh() {
    this.setData({ refreshing: true });
    this.loadOrders(() => {
      this.setData({ refreshing: false });
    });
  },
  loadProfileAndOrders() {
    const app = getApp();
    this.setData({ userId: app.globalData.userId });
    app.request({
      url: `${app.globalData.baseUrl}/user/${app.globalData.userId}/profile`,
      success: (res) => {
        const user = res.data.data || {};
        this.setData({
          nickname: user.nickname || "同学",
          studentNo: user.studentNo || "",
          avatar: user.avatar || "",
          authStatus: user.authStatus,
          canGrab: user.courierEnabled === 1,
          authTip: user.courierEnabled === 1
            ? ""
            : (user.authStatus === 1
              ? "你的代取员权限暂未启用，请联系管理员开通。"
              : "完成实名认证并审核通过后，即可参与抢单。")
        });
        this.updateHeroBanners(user.nickname || "同学");
      },
      complete: () => this.loadOrders()
    });
  },
  updateHeroBanners(nickname) {
    const heroBanners = HERO_BANNERS.map((item) => ({
      ...item,
      subtitle: item.subtitle ? item.subtitle.replace("{nickname}", nickname) : ""
    }));
    this.setData({ heroBanners });
  },
  loadOrders(done) {
    const app = getApp();
    this.setData({ loading: true });
    app.request({
      url: `${app.globalData.baseUrl}/order/hall`,
      success: (res) => {
        const list = res.data.code === 0 ? (res.data.data || []) : [];
        const orders = this.normalizeOrders(list);
        this.setData({ orders });
        this.applyCategory(this.data.currentCategory);
      },
      fail: () => {
        wx.showToast({ title: "加载失败", icon: "error" });
      },
      complete: () => {
        this.setData({ loading: false });
        if (typeof done === "function") {
          done();
        }
      }
    });
  },
  normalizeOrders(list) {
    return list.map((item) => {
      const expressType = item.expressType || "普通";
      return {
        ...item,
        _publisherName: item.publisherName || "匿名同学",
        _publisherShort: (item.publisherName || "同").slice(0, 1),
        _typeLabel: expressType,
        _typeClass: TYPE_CLASS_MAP[expressType] || "type-normal",
        _feeText: item.fee === null || item.fee === undefined || item.fee === "" ? "0" : String(item.fee),
        _timeText: this.formatTime(item.createTime || item.createdAt),
        _pickupCodeText: item.pickupCodeMasked || item.pickupCode || "",
        _remarkText: item.remark || "代取需求已发布，点击查看详情。"
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
  applyCategory(category) {
    const filteredOrders = category === "all"
      ? this.data.orders
      : this.data.orders.filter((item) => (item.expressType || "普通") === category);
    this.setData({
      currentCategory: category,
      filteredOrders
    });
  },
  switchCategory(e) {
    this.applyCategory(e.currentTarget.dataset.cat);
  },
  scrollToTasks() {
    this.setData({ scrollTarget: "taskSection" });
    setTimeout(() => {
      this.setData({ scrollTarget: "" });
    }, 180);
  },
  onHeroChange(e) {
    this.setData({
      currentHeroIndex: e.detail.current || 0
    });
  },
  onHeroTap(e) {
    const action = e.currentTarget.dataset.action;
    if (!action) {
      return;
    }
    if (action === "publish") {
      this.goToPublish();
      return;
    }
    if (action === "orders") {
      this.goToOrders();
      return;
    }
    this.scrollToTasks();
  },
  search() {
    wx.showToast({
      title: "搜索功能开发中",
      icon: "none"
    });
  },
  goToMessages() {
    wx.navigateTo({
      url: "/pages/messages/messages"
    });
  },
  goToPublish() {
    wx.switchTab({
      url: "/pages/publish-order/publish-order"
    });
  },
  quickPublish() {
    wx.setStorageSync("publishOrderQuickFillDefaultAddress", 1);
    wx.switchTab({
      url: "/pages/publish-order/publish-order"
    });
  },
  goToOrders() {
    wx.switchTab({
      url: "/pages/order/order"
    });
  },
  goToMyOrders() {
    wx.switchTab({
      url: "/pages/my-orders/my-orders"
    });
  },
  goToAddress() {
    wx.navigateTo({
      url: "/pages/address/address"
    });
  },
  viewOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?id=${orderId}`
    });
  },
  grab(e) {
    if (!this.data.canGrab) {
      wx.showToast({ title: "请先完成实名认证审核", icon: "none" });
      return;
    }
    const orderId = e.currentTarget.dataset.id;
    const order = this.data.filteredOrders.find((item) => Number(item.id) === Number(orderId));
    if (order && Number(order.publisherId) === Number(this.data.userId)) {
      wx.showToast({ title: "不能抢自己发布的订单", icon: "none" });
      return;
    }
    wx.showModal({
      title: "确认抢单",
      content: "确定要抢这个订单吗？",
      success: (res) => {
        if (res.confirm) {
          this.doGrab(orderId);
        }
      }
    });
  },
  doGrab(orderId) {
    const app = getApp();
    wx.showLoading({ title: "抢单中..." });
    app.request({
      url: `${app.globalData.baseUrl}/order/${orderId}/grab`,
      method: "POST",
      data: { courierId: app.globalData.userId },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code === 0) {
          wx.showToast({ title: "抢单成功" });
          setTimeout(() => {
            wx.switchTab({ url: "/pages/order/order" });
          }, 1200);
          return;
        }
        wx.showToast({ title: res.data.message || "抢单失败", icon: "none" });
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: "抢单失败", icon: "error" });
      }
    });
  }
});
