Page({
  data: {
    isEdit: false,
    addressId: null,
    form: {
      name: '',
      phone: '',
      address: '',
      isDefault: false
    }
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ 
        isEdit: true, 
        addressId: options.id 
      });
      this.loadAddressDetail(options.id);
    }
  },

  loadAddressDetail(id) {
    const app = getApp();
    const userId = app.globalData.userId;
    const addressList = wx.getStorageSync(`addresses_${userId}`) || [];
    const address = addressList.find(addr => addr.id == id);
    
    if (address) {
      this.setData({ form: address });
    }
  },

  goBack() {
    wx.navigateBack();
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`form.${field}`]: value
    });
  },

  onSwitchChange(e) {
    this.setData({
      'form.isDefault': e.detail.value
    });
  },

  saveAddress() {
    const { form, isEdit, addressId } = this.data;
    
    if (!form.name) {
      wx.showToast({ title: '请输入收货人姓名', icon: 'none' });
      return;
    }
    
    if (!form.phone) {
      wx.showToast({ title: '请输入联系电话', icon: 'none' });
      return;
    }
    
    if (!/^1\d{10}$/.test(form.phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    
    if (!form.address) {
      wx.showToast({ title: '请输入详细地址', icon: 'none' });
      return;
    }

    const app = getApp();
    const userId = app.globalData.userId;
    let addressList = wx.getStorageSync(`addresses_${userId}`) || [];

    if (form.isDefault) {
      addressList.forEach(addr => {
        addr.isDefault = false;
      });
    }

    if (isEdit) {
      const index = addressList.findIndex(addr => addr.id == addressId);
      if (index !== -1) {
        addressList[index] = { ...form, id: addressId };
      }
    } else {
      const newId = Date.now();
      addressList.unshift({ ...form, id: newId });
    }

    wx.setStorageSync(`addresses_${userId}`, addressList);
    wx.showToast({ title: '保存成功', icon: 'success' });
    
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  }
});