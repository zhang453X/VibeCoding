App({
  globalData: {
    localBaseUrl: "http://localhost:8080/api",
    lanBaseUrl: "http://192.168.110.56:8080/api",
    baseUrl: "http://localhost:8080/api",
    userId: null,
    token: "",
    requestTimeout: 10000,
    lastNetworkErrorAt: 0
  },
  resolveBaseUrl(systemInfo) {
    const platform = (systemInfo && systemInfo.platform) || "";
    return platform === "devtools" ? this.globalData.localBaseUrl : this.globalData.lanBaseUrl;
  },
  onLaunch() {
    const systemInfo = wx.getSystemInfoSync();
    this.globalData.statusBarHeight = systemInfo.statusBarHeight || 20;
    this.globalData.baseUrl = this.resolveBaseUrl(systemInfo);
    const token = wx.getStorageSync("token");
    const userId = wx.getStorageSync("userId");
    if (token && userId) {
      this.globalData.token = token;
      this.globalData.userId = Number(userId);
      // 尝试验证 token 有效性
      this.validateToken();
    } else {
      wx.reLaunch({ url: "/pages/login/login" });
    }
  },
  validateToken() {
    // 简单的 token 验证，获取用户信息
    this.request({
      url: `${this.globalData.baseUrl}/user/${this.globalData.userId}/profile`,
      fail: () => {
        // 验证失败，跳转到登录页
        this.logout();
      }
    });
  },
  request(options) {
    const token = this.globalData.token;
    const originalSuccess = options.success;
    const originalFail = options.fail;
    const originalComplete = options.complete;
    const timeout = options.timeout || this.globalData.requestTimeout;
    return wx.request({
      ...options,
      timeout,
      header: {
        ...(options.header || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      success: (res) => {
        // 处理 JWT 过期
        if (res.data && res.data.message) {
          const msg = res.data.message;
          if (msg.includes("JWT expired") || msg.includes("未登录或登录已过期")) {
            this.logout();
            wx.showToast({ title: "登录已过期，请重新登录", icon: "none" });
            return;
          }
        }
        if (typeof originalSuccess === "function") {
          originalSuccess(res);
        }
      },
      fail: (err) => {
        this.handleRequestError(err, options, timeout);
        if (typeof originalFail === "function") {
          originalFail(err);
        }
      },
      complete: (res) => {
        if (typeof originalComplete === "function") {
          originalComplete(res);
        }
      }
    });
  },
  handleRequestError(err, options, timeout) {
    const errMsg = (err && err.errMsg) || "";
    const now = Date.now();
    if (now - this.globalData.lastNetworkErrorAt < 2500) {
      return;
    }
    this.globalData.lastNetworkErrorAt = now;

    if (errMsg.includes("timeout")) {
      wx.showToast({
        title: `请求超时(${Math.floor(timeout / 1000)}s)`,
        icon: "none"
      });
      return;
    }

    if (String(this.globalData.baseUrl).includes("localhost")) {
      wx.showToast({
        title: "本地服务未连接",
        icon: "none"
      });
      return;
    }

    wx.showToast({
      title: "网络请求失败",
      icon: "none"
    });
  },
  login(username, password, cb) {
    this.request({
      url: `${this.globalData.baseUrl}/auth/login`,
      method: "POST",
      data: { username, password, role: "USER" },
      success: (res) => {
        if (res.data.code === 0) {
          this.globalData.token = res.data.data.token;
          this.globalData.userId = res.data.data.userId;
          wx.setStorageSync("token", this.globalData.token);
          wx.setStorageSync("userId", this.globalData.userId);
        }
        if (typeof cb === "function") {
          cb(res);
        }
      },
      fail: (err) => {
        if (typeof cb === "function") {
          cb({ data: { code: -1, message: err.errMsg || "登录失败" } });
        }
      }
    });
  },
  logout() {
    this.globalData.token = "";
    this.globalData.userId = null;
    wx.removeStorageSync("token");
    wx.removeStorageSync("userId");
    wx.reLaunch({ url: "/pages/login/login" });
  },
  ensureLogin() {
    if (!this.globalData.token) {
      wx.reLaunch({ url: "/pages/login/login" });
      return false;
    }
    return true;
  },
  refreshUnreadBadge() {
    if (!this.globalData.token || !this.globalData.userId) {
      this.globalData.unreadNoticeCount = 0;
      this.globalData.hasUnreadNotice = false;
      wx.removeTabBarBadge({ index: 3 });
      return;
    }
    this.request({
      url: `${this.globalData.baseUrl}/user/${this.globalData.userId}/notices/unread-count`,
      success: (res) => {
        const count = res.data.code === 0 ? (res.data.data || 0) : 0;
        this.globalData.unreadNoticeCount = count;
        this.globalData.hasUnreadNotice = count > 0;
        wx.removeTabBarBadge({ index: 3 });
      }
    });
  }
});
