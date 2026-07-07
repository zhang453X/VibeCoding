Page({
  data: {
    form: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    loading: false
  },

  onLoad() {
    const app = getApp();
    if (!app.ensureLogin()) {
      return;
    }
  },

  setField(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ [`form.${key}`]: e.detail.value });
  },

  validateForm() {
    const oldPassword = (this.data.form.oldPassword || '').trim();
    const newPassword = (this.data.form.newPassword || '').trim();
    const confirmPassword = (this.data.form.confirmPassword || '').trim();

    if (!oldPassword || !newPassword || !confirmPassword) {
      return '请填写完整信息';
    }

    if (newPassword.length < 6 || newPassword.length > 20) {
      return '新密码长度需为 6-20 位';
    }

    if (newPassword === oldPassword) {
      return '新密码不能与原密码相同';
    }

    if (newPassword !== confirmPassword) {
      return '两次输入的新密码不一致';
    }

    return '';
  },

  handlePasswordChanged() {
    const app = getApp();
    wx.showModal({
      title: '修改成功',
      content: '密码已更新，请重新登录。',
      showCancel: false,
      success: () => {
        app.logout();
      }
    });
  },

  changePassword() {
    if (this.data.loading) {
      return;
    }

    const errorMessage = this.validateForm();
    if (errorMessage) {
      wx.showToast({ title: errorMessage, icon: 'none' });
      return;
    }

    const oldPassword = this.data.form.oldPassword.trim();
    const newPassword = this.data.form.newPassword.trim();
    this.setData({ loading: true });
    const app = getApp();
    app.request({
      url: `${app.globalData.baseUrl}/user/${app.globalData.userId}/password`,
      method: 'PUT',
      data: {
        oldPassword,
        newPassword
      },
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({
            form: {
              oldPassword: '',
              newPassword: '',
              confirmPassword: ''
            }
          });
          this.handlePasswordChanged();
          return;
        }
        wx.showToast({ title: res.data.message || '修改失败', icon: 'none' });
      },
      fail: (err) => {
        const errMsg = (err && err.errMsg) || '';
        if (!errMsg.includes('timeout') && !errMsg.includes('request:fail')) {
          wx.showToast({ title: '修改失败，请稍后重试', icon: 'none' });
        }
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  }
});
