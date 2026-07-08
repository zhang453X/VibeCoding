Page({
  data: {
    form: {
      expressCompany: "",
      expressNo: "",
      pickupCode: "",
      stationName: "",
      expressType: "普通",
      pickupTimeRange: "",
      deliveryLocation: "",
      fee: "",
      contactPhone: "",
      remark: ""
    },
    expressTypes: ["普通", "生鲜", "文件", "大件"],
    expressTypeIndex: 0,
    quickFees: [3, 5, 8],
    commonLocations: ["东区宿舍", "西区宿舍", "南区宿舍", "北区宿舍"],
    stationOptions: [],
    stationIndex: -1,
    selectedStation: null,
    stationLoading: false,
    startTime: "",
    endTime: "",
    showAddressModal: false,
    addressList: []
  },
  onShow() {
    const app = getApp();
    if (!app.ensureLogin()) {
      return;
    }
    app.refreshUnreadBadge();
    this.loadAddressList();
    this.loadStationOptions();
    this.initTime();
  },
  initTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const startTime = `${hours}:${minutes}`;
    
    const endTimeDate = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const endHours = endTimeDate.getHours().toString().padStart(2, '0');
    const endMinutes = endTimeDate.getMinutes().toString().padStart(2, '0');
    const endTime = `${endHours}:${endMinutes}`;
    
    this.setData({
      startTime,
      endTime,
      'form.pickupTimeRange': `${startTime}-${endTime}`
    });
  },
  loadAddressList() {
    const app = getApp();
    const userId = app.globalData.userId;
    const savedAddresses = wx.getStorageSync(`addresses_${userId}`) || [];
    this.setData({ addressList: savedAddresses });
    this.tryApplyQuickDefaultAddress(savedAddresses);
  },
  tryApplyQuickDefaultAddress(addressList) {
    const shouldQuickFill = wx.getStorageSync("publishOrderQuickFillDefaultAddress");
    if (!shouldQuickFill) {
      return;
    }
    wx.removeStorageSync("publishOrderQuickFillDefaultAddress");
    const defaultAddress = (addressList || []).find((item) => item.isDefault);
    if (!defaultAddress) {
      return;
    }
    this.setData({
      "form.deliveryLocation": defaultAddress.address || "",
      "form.contactPhone": defaultAddress.phone || ""
    });
  },
  loadStationOptions() {
    const app = getApp();
    this.setData({ stationLoading: true });
    app.request({
      url: `${app.globalData.baseUrl}/public/express-stations`,
      success: (res) => {
        const stationOptions = res.data.code === 0 ? (res.data.data || []) : [];
        const selectedIndex = stationOptions.findIndex((item) => item.stationName === this.data.form.stationName);
        const selectedStation = selectedIndex >= 0 ? stationOptions[selectedIndex] : null;
        this.setData({
          stationOptions,
          stationIndex: selectedIndex,
          selectedStation
        });
      },
      fail: () => {
        wx.showToast({ title: "快递点加载失败", icon: "none" });
      },
      complete: () => {
        this.setData({ stationLoading: false });
      }
    });
  },
  chooseFromAddressBook() {
    this.loadAddressList();
    this.setData({ showAddressModal: true });
  },
  hideAddressModal() {
    this.setData({ showAddressModal: false });
  },
  selectAddress(e) {
    const index = e.currentTarget.dataset.index;
    const address = this.data.addressList[index];
    this.setData({
      'form.deliveryLocation': address.address,
      'form.contactPhone': address.phone,
      showAddressModal: false
    });
  },
  goToAddAddress() {
    this.setData({ showAddressModal: false });
    wx.navigateTo({
      url: '/pages/address-edit/address-edit'
    });
  },
  setField(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ [`form.${key}`]: e.detail.value });
  },
  chooseType(e) {
    const index = Number(e.currentTarget.dataset.index);
    const value = this.data.expressTypes[index];
    this.setData({
      expressTypeIndex: index,
      "form.expressType": value
    });
  },
  setExpressType(e) {
    const index = Number(e.detail.value);
    const value = this.data.expressTypes[index];
    this.setData({ expressTypeIndex: index, "form.expressType": value });
  },
  chooseStation(e) {
    const index = Number(e.detail.value);
    const station = this.data.stationOptions[index];
    if (!station) {
      return;
    }
    this.setData({
      stationIndex: index,
      selectedStation: station,
      "form.stationName": station.stationName
    });
  },
  chooseQuickLocation(e) {
    this.setData({
      "form.deliveryLocation": e.currentTarget.dataset.value
    });
  },
  setQuickFee(e) {
    this.setData({
      "form.fee": String(e.currentTarget.dataset.value)
    });
  },
  setStartTime(e) {
    const startTime = e.detail.value;
    this.setData({ startTime, "form.pickupTimeRange": `${startTime}-${this.data.endTime}` });
  },
  setEndTime(e) {
    const endTime = e.detail.value;
    this.setData({ endTime, "form.pickupTimeRange": `${this.data.startTime}-${endTime}` });
  },
  submit() {
    const app = getApp();
    const required = ["expressCompany", "expressNo", "pickupCode", "stationName", "expressType", "pickupTimeRange", "deliveryLocation", "fee", "contactPhone"];
    const miss = required.find((k) => !this.data.form[k]);
    if (miss) {
      wx.showToast({ title: "请填写完整信息", icon: "none" });
      return;
    }
    const validStation = this.data.stationOptions.some((item) => item.stationName === this.data.form.stationName);
    if (!validStation) {
      wx.showToast({ title: "请选择有效的快递站点", icon: "none" });
      return;
    }
    app.request({
      url: `${app.globalData.baseUrl}/order`,
      method: "POST",
      data: {
        ...this.data.form,
        publisherId: app.globalData.userId,
        allowBargain: 0,
        validMinutes: 60
      },
      success: (res) => {
        if (res.data.code === 0) {
          wx.showToast({ title: "发布成功" });
          setTimeout(() => {
            wx.switchTab({ url: "/pages/order/order" });
          }, 1500);
          return;
        }
        wx.showToast({ title: res.data.message || "发布失败", icon: "none" });
      },
      fail: () => wx.showToast({ title: "发布失败", icon: "error" })
    });
  }
});
