Page({
  data: {
    addressList: []
  },

  onLoad() {
    this.loadAddressList();
  },

  onShow() {
    this.loadAddressList();
  },

  loadAddressList() {
    const app = getApp();
    const userId = app.globalData.userId;
    const savedAddresses = wx.getStorageSync(`addresses_${userId}`) || [];
    this.setData({ addressList: savedAddresses });
  },

  goBack() {
    wx.navigateBack();
  },

  goToAddAddress() {
    wx.navigateTo({
      url: '/pages/address-edit/address-edit'
    });
  },

  editAddress(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/address-edit/address-edit?id=${id}`
    });
  },

  setDefault(e) {
    const id = e.currentTarget.dataset.id;
    const app = getApp();
    const userId = app.globalData.userId;
    let addressList = this.data.addressList;
    
    addressList.forEach(addr => {
      addr.isDefault = addr.id === id;
    });
    
    wx.setStorageSync(`addresses_${userId}`, addressList);
    this.setData({ addressList });
    
    wx.showToast({ title: '已设为默认', icon: 'success' });
  },

  deleteAddress(e) {
    const id = e.currentTarget.dataset.id;
    const app = getApp();
    const userId = app.globalData.userId;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个地址吗？',
      success: (res) => {
        if (res.confirm) {
          let addressList = this.data.addressList.filter(addr => addr.id !== id);
          wx.setStorageSync(`addresses_${userId}`, addressList);
          this.setData({ addressList });
          wx.showToast({ title: '删除成功', icon: 'success' });
        }
      }
    });
  }
});