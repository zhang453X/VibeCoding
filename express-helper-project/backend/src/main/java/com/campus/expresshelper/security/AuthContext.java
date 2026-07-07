package com.campus.expresshelper.security;

public class AuthContext {
    private static final ThreadLocal<Long> USER_ID = new ThreadLocal<>();
    private static final ThreadLocal<String> ROLE = new ThreadLocal<>();

    public static void set(Long userId, String role) {
        USER_ID.set(userId);
        ROLE.set(role);
    }

    public static Long userId() {
        return USER_ID.get();
    }

    public static String role() {
        return ROLE.get();
    }

    public static boolean isAdmin() {
        return "ADMIN".equalsIgnoreCase(ROLE.get());
    }

    public static void clear() {
        USER_ID.remove();
        ROLE.remove();
    }
}
