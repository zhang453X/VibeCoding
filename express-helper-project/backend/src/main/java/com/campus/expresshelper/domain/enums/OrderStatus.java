package com.campus.expresshelper.domain.enums;

public enum OrderStatus {
    PENDING_GRAB("待抢单"),
    GRABBED("已抢单"),
    PICKED_UP("已取件"),
    DELIVERING("配送中"),
    COMPLETED("已完成"),
    CANCELLED("已取消"),
    APPEALING("申诉中");
    
    private final String desc;
    
    OrderStatus(String desc) {
        this.desc = desc;
    }
    
    public String getDesc() {
        return desc;
    }
}
