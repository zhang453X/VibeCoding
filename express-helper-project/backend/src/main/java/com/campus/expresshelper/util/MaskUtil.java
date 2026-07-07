package com.campus.expresshelper.util;

public class MaskUtil {
    public static String pickupCodeMask(String input) {
        if (input == null || input.length() <= 2) {
            return "**";
        }
        int show = Math.min(2, input.length() / 2);
        return "*".repeat(input.length() - show) + input.substring(input.length() - show);
    }

    public static String phoneMask(String phone) {
        if (phone == null || phone.length() < 7) {
            return phone;
        }
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
    }

    public static String commonMask(String input) {
        if (input == null || input.isBlank()) {
            return input;
        }
        if (input.length() <= 4) {
            return "*".repeat(input.length());
        }
        String start = input.substring(0, 2);
        String end = input.substring(input.length() - 2);
        return start + "*".repeat(input.length() - 4) + end;
    }
}
