Page({
  data: {
    latest: {},
    statusText: "未提交",
    statusDesc: "完成实名认证后即可开启接单资格",
    statusTheme: "idle",
    form: {
      studentNo: "",
      realName: "",
      idCardFrontUrl: "",
      idCardBackUrl: "",
      idCardWithStudentCardUrl: ""
    },
    showForm: false,
    submitting: false,
    uploadingType: null,
    userProfile: {}
  },
  onShow() {
    const app = getApp();
    if (!app.ensureLogin()) {
      return;
    }
    this.loadProfileAndLatest();
  },
  loadProfileAndLatest() {
    const app = getApp();
    app.request({
      url: `${app.globalData.baseUrl}/user/${app.globalData.userId}/profile`,
      success: (res) => {
        const profile = res.data.code === 0 ? (res.data.data || {}) : {};
        this.setData({
          userProfile: profile,
          "form.studentNo": this.data.form.studentNo || profile.studentNo || ""
        });
      },
      complete: () => {
        this.loadLatest();
      }
    });
  },
  loadLatest() {
    const app = getApp();
    app.request({
      url: `${app.globalData.baseUrl}/auth/latest/${app.globalData.userId}`,
      success: (res) => {
        const data = res.data.data || {};
        const viewState = this.resolveStatusView(data);
        this.setData({
          latest: data,
          statusText: viewState.statusText,
          statusDesc: viewState.statusDesc,
          statusTheme: viewState.statusTheme,
          showForm: viewState.showForm
        });
        this.hydrateForm(data);
      }
    });
  },
  resolveStatusView(data) {
    if (data.status === "PENDING") {
      return {
        statusText: "审核中",
        statusDesc: "资料已提交，请等待管理员审核，审核期间无需重复提交。",
        statusTheme: "pending",
        showForm: false
      };
    }
    if (data.status === "APPROVED") {
      return {
        statusText: "已通过",
        statusDesc: "实名认证已通过，你已获得接单资格，可前往任务页查看配送任务。",
        statusTheme: "approved",
        showForm: false
      };
    }
    if (data.status === "REJECTED") {
      return {
        statusText: "已驳回",
        statusDesc: "请根据驳回原因修改信息后重新提交。",
        statusTheme: "rejected",
        showForm: true
      };
    }
    return {
      statusText: "未提交",
      statusDesc: "请先完善实名资料并上传所需图片，审核通过后即可接单。",
      statusTheme: "idle",
      showForm: true
    };
  },
  hydrateForm(latest) {
    const profile = this.data.userProfile || {};
    const nextForm = {
      studentNo: (latest.studentNo || profile.studentNo || "").trim ? (latest.studentNo || profile.studentNo || "").trim() : (latest.studentNo || profile.studentNo || ""),
      realName: latest.realName || "",
      idCardFrontUrl: latest.idCardFrontUrl || "",
      idCardBackUrl: latest.idCardBackUrl || "",
      idCardWithStudentCardUrl: latest.idCardWithStudentCardUrl || ""
    };
    this.setData({ form: nextForm });
  },
  setField(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ [`form.${key}`]: e.detail.value });
  },
  chooseImage(e) {
    if (!this.data.showForm || this.data.submitting) {
      return;
    }
    const type = e.currentTarget.dataset.type;
    this.setData({ uploadingType: type });
    const app = getApp();
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.uploadImage(tempFilePath, type);
      }
    });
  },
  uploadImage(filePath, type) {
    const app = getApp();
    wx.showLoading({ title: "上传中..." });
    wx.uploadFile({
      url: `${app.globalData.baseUrl}/upload/auth`,
      filePath: filePath,
      name: 'file',
      header: {
        ...(app.globalData.token ? { Authorization: `Bearer ${app.globalData.token}` } : {})
      },
      success: (res) => {
        wx.hideLoading();
        const data = JSON.parse(res.data);
        if (data.code === 0) {
          const field = type + 'Url';
          this.setData({
            [`form.${field}`]: data.data.url
          });
          wx.showToast({ title: "上传成功", icon: "success" });
        } else {
          wx.showToast({ title: data.message || "上传失败", icon: "none" });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: "上传失败", icon: "none" });
      }
    });
  },
  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    if (!url) {
      return;
    }
    wx.previewImage({
      current: url,
      urls: [url]
    });
  },
  submit() {
    const app = getApp();
    const { form } = this.data;
    const required = ["studentNo", "realName", "idCardFrontUrl", "idCardBackUrl", "idCardWithStudentCardUrl"];
    const miss = required.find((k) => !form[k]);
    if (miss !== undefined) {
      wx.showToast({ title: "请完整填写认证信息", icon: "none" });
      return;
    }
    if (!/^[0-9A-Za-z]{6,20}$/.test((form.studentNo || "").trim())) {
      wx.showToast({ title: "学号格式不正确", icon: "none" });
      return;
    }
    if ((form.realName || "").trim().length < 2) {
      wx.showToast({ title: "请输入真实姓名", icon: "none" });
      return;
    }
    this.setData({ submitting: true });
    app.request({
      url: `${app.globalData.baseUrl}/auth/submit`,
      method: "POST",
      data: {
        ...form,
        studentNo: (form.studentNo || "").trim(),
        realName: (form.realName || "").trim(),
        userId: app.globalData.userId
      },
      success: (res) => {
        this.setData({ submitting: false });
        if (res.data.code === 0) {
          wx.showToast({ title: "提交成功", icon: "success" });
          setTimeout(() => {
            this.loadLatest();
          }, 900);
          return;
        }
        wx.showToast({ title: res.data.message || "提交失败", icon: "none" });
      },
      fail: () => {
        this.setData({ submitting: false });
        wx.showToast({ title: "提交失败", icon: "error" });
      }
    });
  },
  refreshStatus() {
    this.loadLatest();
  }
});
