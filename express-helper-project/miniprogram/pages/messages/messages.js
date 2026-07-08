Page({
  data: {
    statusBarHeight: 20,
    list: [],
    batchMode: false,
    selectedIds: [],
    isAllSelected: false,
    wrapperWidth: 0,
    trackWidth: 0,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    slideActionWidth: 176
  },
  formatTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },
  onShow() {
    const app = getApp();
    if (!app.ensureLogin()) {
      return;
    }
    const systemInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    const windowWidth = systemInfo.windowWidth || 375;
    const wrapperWidth = Math.max(320, windowWidth - 24);
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20,
      wrapperWidth,
      trackWidth: wrapperWidth + this.data.slideActionWidth
    });
    app.refreshUnreadBadge();
    this.load();
  },
  load() {
    const app = getApp();
    app.request({
      url: `${app.globalData.baseUrl}/user/${app.globalData.userId}/notices`,
      success: (res) => {
        const list = res.data.code === 0 ? (res.data.data || []) : [];
        list.forEach(item => {
          item.x = 0;
          item.formattedTime = this.formatTime(item.createdAt);
        });
        this.setData({ list, selectedIds: [], batchMode: false, isAllSelected: false });
      }
    });
  },
  closeAllSwipe() {
    const list = this.data.list.map(item => ({ ...item, x: 0 }));
    this.setData({ list });
  },
  goToOrderDetail(e) {
    const orderId = e.currentTarget.dataset.orderId;
    if (orderId) {
      wx.navigateTo({
        url: `/pages/order-detail/order-detail?id=${orderId}`
      });
    }
  },
  toggleBatchMode() {
    const list = this.data.list.map(item => ({ ...item, x: 0 }));
    this.setData({ batchMode: true, selectedIds: [], isAllSelected: false, list });
  },
  cancelBatch() {
    const list = this.data.list.map(item => {
      return { ...item, x: 0 };
    });
    this.setData({ batchMode: false, selectedIds: [], isAllSelected: false, list });
  },
  toggleSelect(e) {
    if (!this.data.batchMode) return;
    e.stopPropagation && e.stopPropagation();
    const id = e.currentTarget.dataset.id;
    const selectedIds = [...this.data.selectedIds];
    const index = selectedIds.indexOf(id);
    if (index > -1) {
      selectedIds.splice(index, 1);
    } else {
      selectedIds.push(id);
    }
    const isAllSelected = selectedIds.length === this.data.list.length && this.data.list.length > 0;
    const list = this.data.list.map(item => ({ ...item, x: 0 }));
    this.setData({ selectedIds, isAllSelected, list });
  },
  toggleSelectAll() {
    const list = this.data.list.map(item => ({ ...item, x: 0 }));
    if (this.data.isAllSelected) {
      this.setData({ selectedIds: [], isAllSelected: false, list });
    } else {
      const selectedIds = this.data.list.map(item => item.id);
      this.setData({ selectedIds, isAllSelected: true, list });
    }
  },
  deleteSelected() {
    if (this.data.selectedIds.length === 0) {
      wx.showToast({ title: '请先选择要删除的消息', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '确认删除',
      content: `确定要删除选中的 ${this.data.selectedIds.length} 条消息吗？`,
      success: (res) => {
        if (res.confirm) {
          this.doDeleteSelected();
        }
      }
    });
  },
  doDeleteSelected() {
    const app = getApp();
    const selectedIds = [...this.data.selectedIds];
    let successCount = 0;
    let failCount = 0;

    wx.showLoading({ title: '删除中...' });

    const deleteNext = (index) => {
      if (index >= selectedIds.length) {
        wx.hideLoading();
        wx.showToast({ title: `删除成功 ${successCount} 条` });
        this.load();
        return;
      }

      const id = selectedIds[index];
      app.request({
        url: `${app.globalData.baseUrl}/user/${app.globalData.userId}/notices/${id}`,
        method: "DELETE",
        success: () => {
          successCount++;
        },
        fail: () => {
          failCount++;
        },
        complete: () => {
          deleteNext(index + 1);
        }
      });
    };

    deleteNext(0);
  },
  onTouchStart(e) {
    if (this.data.batchMode) return;
    const id = e.currentTarget.dataset.id;
    const current = this.data.list.find(item => item.id === id);
    this.setData({
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      startOffsetX: current ? (current.x || 0) : 0
    });
  },
  onTouchMove(e) {
    if (this.data.batchMode) return;
    const id = e.currentTarget.dataset.id;
    const moveX = e.touches[0].clientX;
    const moveY = e.touches[0].clientY;
    const diffX = moveX - this.data.startX;
    const diffY = moveY - this.data.startY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 8) {
      const list = this.data.list.map(item => {
        if (item.id === id) {
          let newX = this.data.startOffsetX + diffX;
          if (newX > 0) newX = 0;
          if (newX < -this.data.slideActionWidth) newX = -this.data.slideActionWidth;
          return { ...item, x: newX };
        }
        return { ...item, x: 0 };
      });
      this.setData({ list });
    }
  },
  onTouchEnd(e) {
    if (this.data.batchMode) return;
    const id = e.currentTarget.dataset.id;
    const list = this.data.list.map(item => {
      if (item.id === id) {
        return {
          ...item,
          x: item.x < -(this.data.slideActionWidth / 2) ? -this.data.slideActionWidth : 0
        };
      }
      return { ...item, x: 0 };
    });
    this.setData({ list });
  },
  unreadOne(e) {
    const app = getApp();
    const noticeId = e.currentTarget.dataset.id;
    const readFlag = Number(e.currentTarget.dataset.readFlag);

    if (readFlag === 0) {
      wx.showToast({ title: "该消息已是未读", icon: "none" });
      this.closeAllSwipe();
      return;
    }

    app.request({
      url: `${app.globalData.baseUrl}/user/${app.globalData.userId}/notices/${noticeId}/unread`,
      method: "POST",
      success: () => {
        wx.showToast({ title: "已标记未读" });
        app.refreshUnreadBadge();
        this.load();
      }
    });
  },
  readOne(e) {
    const app = getApp();
    app.request({
      url: `${app.globalData.baseUrl}/user/${app.globalData.userId}/notices/${e.currentTarget.dataset.id}/read`,
      method: "POST",
      success: () => this.load()
    });
  },
  readAll() {
    const app = getApp();
    app.request({
      url: `${app.globalData.baseUrl}/user/${app.globalData.userId}/notices/read-all`,
      method: "POST",
      success: () => {
        wx.showToast({ title: "已全部标记已读" });
        this.load();
      }
    });
  },
  deleteOne(e) {
    e.stopPropagation && e.stopPropagation();
    const app = getApp();
    const noticeId = e.currentTarget.dataset.id;
    wx.showModal({
      title: "确认删除",
      content: "确定要删除这条消息吗？",
      success: (res) => {
        if (res.confirm) {
          app.request({
            url: `${app.globalData.baseUrl}/user/${app.globalData.userId}/notices/${noticeId}`,
            method: "DELETE",
            success: () => {
              wx.showToast({ title: "删除成功" });
              this.load();
            }
          });
        }
      }
    });
  }
});
