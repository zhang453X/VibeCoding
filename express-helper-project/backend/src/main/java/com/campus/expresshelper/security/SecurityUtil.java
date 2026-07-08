package com.campus.expresshelper.security;

import com.campus.expresshelper.common.BusinessException;

public class SecurityUtil {
    public static Long currentUserId() {
        Long userId = AuthContext.userId();
        if (userId == null) {
            throw new BusinessException("未登录");
        }
        return userId;
    }

    public static void assertSelfOrAdmin(Long userId) {
        if (!AuthContext.isAdmin() && !currentUserId().equals(userId)) {
            throw new BusinessException("无权访问该用户数据");
        }
    }

    public static void assertAdmin() {
        if (!AuthContext.isAdmin()) {
            throw new BusinessException("仅管理员可操作");
        }
    }
}
