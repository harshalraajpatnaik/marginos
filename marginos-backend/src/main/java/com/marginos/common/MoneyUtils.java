package com.marginos.common;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.util.Locale;

public final class MoneyUtils {
    public static final int FINANCIAL_SCALE = 4;
    public static final int DISPLAY_SCALE = 2;
    public static final RoundingMode DEFAULT_ROUNDING = RoundingMode.HALF_UP;
    public static final BigDecimal ZERO = BigDecimal.ZERO.setScale(FINANCIAL_SCALE, DEFAULT_ROUNDING);

    private MoneyUtils() {}

    public static BigDecimal round(BigDecimal value) {
        if (value == null) return ZERO;
        return value.setScale(FINANCIAL_SCALE, DEFAULT_ROUNDING);
    }

    public static BigDecimal roundDisplay(BigDecimal value) {
        if (value == null) return BigDecimal.ZERO.setScale(DISPLAY_SCALE, DEFAULT_ROUNDING);
        return value.setScale(DISPLAY_SCALE, DEFAULT_ROUNDING);
    }

    public static BigDecimal safeAdd(BigDecimal a, BigDecimal b) {
        BigDecimal valA = a != null ? a : BigDecimal.ZERO;
        BigDecimal valB = b != null ? b : BigDecimal.ZERO;
        return valA.add(valB).setScale(FINANCIAL_SCALE, DEFAULT_ROUNDING);
    }

    public static BigDecimal safeSubtract(BigDecimal a, BigDecimal b) {
        BigDecimal valA = a != null ? a : BigDecimal.ZERO;
        BigDecimal valB = b != null ? b : BigDecimal.ZERO;
        return valA.subtract(valB).setScale(FINANCIAL_SCALE, DEFAULT_ROUNDING);
    }

    public static BigDecimal safeMultiply(BigDecimal a, BigDecimal b) {
        BigDecimal valA = a != null ? a : BigDecimal.ZERO;
        BigDecimal valB = b != null ? b : BigDecimal.ZERO;
        return valA.multiply(valB).setScale(FINANCIAL_SCALE, DEFAULT_ROUNDING);
    }

    public static BigDecimal safeDivide(BigDecimal numerator, BigDecimal denominator) {
        if (numerator == null || denominator == null || denominator.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO.setScale(FINANCIAL_SCALE, DEFAULT_ROUNDING);
        }
        return numerator.divide(denominator, FINANCIAL_SCALE, DEFAULT_ROUNDING);
    }

    /**
     * Formats an amount according to the Indian Rupee numbering system (Lakhs, Crores)
     * e.g. 1234567.89 -> "₹12,34,567.89"
     */
    public static String formatInr(BigDecimal amount) {
        if (amount == null) return "₹0.00";
        BigDecimal displayVal = roundDisplay(amount);
        boolean isNegative = displayVal.compareTo(BigDecimal.ZERO) < 0;
        BigDecimal absVal = displayVal.abs();

        String valStr = absVal.toPlainString();
        String[] parts = valStr.split("\\.");
        String integerPart = parts[0];
        String decimalPart = parts.length > 1 ? parts[1] : "00";
        if (decimalPart.length() == 1) decimalPart += "0";

        StringBuilder formatted = new StringBuilder();
        int len = integerPart.length();
        if (len <= 3) {
            formatted.append(integerPart);
        } else {
            String lastThree = integerPart.substring(len - 3);
            String rest = integerPart.substring(0, len - 3);
            StringBuilder restFormatted = new StringBuilder();
            int count = 0;
            for (int i = rest.length() - 1; i >= 0; i--) {
                restFormatted.insert(0, rest.charAt(i));
                count++;
                if (count == 2 && i != 0) {
                    restFormatted.insert(0, ",");
                    count = 0;
                }
            }
            formatted.append(restFormatted).append(",").append(lastThree);
        }

        return (isNegative ? "-₹" : "₹") + formatted + "." + decimalPart;
    }
}
