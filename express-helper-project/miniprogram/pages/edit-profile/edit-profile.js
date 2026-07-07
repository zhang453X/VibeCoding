Page({
  data: {
    form: {
      nickname: '',
      studentNo: '',
      phone: '',
      dormitory: '',
      college: ''
    },
    saving: false
  },

  onLoad() {
    const app = getApp();
    if (!app.ensureLogin()) {
      return;
    }
    this.loadProfile();
  },

  loadProfile() {
    const app = getApp();
    app.request({
      url: `${app.globalData.baseUrl}/user/${app.globalData.userId}/profile`,
      success: (res) => {
        if (res.data.code === 0 && res.data.data) {
          this.setData({
            form: {
              nickname: res.data.data.nickname || '',
              studentNo: res.data.data.studentNo || '',
              phone: res.data.data.phone || '',
              dormitory: res.data.data.dormitory || '',
              college: res.data.data.college || ''
            }
          });
        }
      },
      fail: () => wx.showToast({ title: '加载失败', icon: 'error' })
    });
  },

  setField(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ [`form.${key}`]: e.detail.value });
  },

  goBack() {
    wx.navigateBack();
  },

  saveProfile() {
    const { form } = this.data;
    if (!form.nickname || !form.phone) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    
    this.setData({ saving: true });
    const app = getApp();
    app.request({
      url: `${app.globalData.baseUrl}/user/${app.globalData.userId}`,
      method: 'PUT',
      data: form,
      success: (res) => {
        this.setData({ saving: false });
        if (res.data.code === 0) {
          wx.showToast({ title: '保存成功', icon: 'success' });
          setTimeout(() => wx.navigateBack(), 1500);
          return;
        }
        wx.showToast({ title: res.data.message || '保存失败', icon: 'none' });
      },
      fail: () => {
        this.setData({ saving: false });
        wx.showToast({ title: '保存失败', icon: 'error' });
      }
    });
  }
});
