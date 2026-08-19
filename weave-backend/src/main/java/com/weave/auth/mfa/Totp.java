package com.weave.auth.mfa;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public final class Totp {
    private static final String ISSUER_SAFE = "Weave";
    private static final String BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    private static final int STEP_SECONDS = 30;
    private static final int DIGITS = 6;

    private Totp() { }

    public static String generateSecret(SecureRandom random) {
        byte[] bytes = new byte[20];
        random.nextBytes(bytes);
        return base32Encode(bytes);
    }

    public static String provisioningUri(String issuer, String account, String secret) {
        String safeIssuer = sanitize(issuer);
        String safeAccount = sanitize(account);
        return "otpauth://totp/" + safeIssuer + ":" + safeAccount + "?secret=" + secret + "&issuer=" + safeIssuer + "&algorithm=SHA1&digits=" + DIGITS + "&period=" + STEP_SECONDS;
    }

    public static boolean verify(String secret, String code, Instant now, int window) {
        String normalized = normalizeCode(code);
        if (normalized.length() != DIGITS) return false;
        for (int offset = -window; offset <= window; offset++) {
            if (normalized.equals(currentCode(secret, now.plusSeconds((long) offset * STEP_SECONDS)))) return true;
        }
        return false;
    }

    public static String currentCode(String secret, Instant instant) {
        byte[] key = base32Decode(secret);
        long counter = instant.getEpochSecond() / STEP_SECONDS;
        byte[] data = ByteBuffer.allocate(8).putLong(counter).array();
        byte[] hmac = hmacSha1(key, data);
        int offset = hmac[hmac.length - 1] & 0x0f;
        int binary = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
        int otp = binary % 1_000_000;
        return String.format("%06d", otp);
    }

    public static String normalizeCode(String code) {
        return code == null ? "" : code.replaceAll("\\s", "").trim();
    }

    public static String normalizeRecoveryCode(String code) {
        return normalizeCode(code).toUpperCase();
    }

    public static String hash(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to hash MFA value", exception);
        }
    }

    private static String sanitize(String value) {
        return value == null ? ISSUER_SAFE : value.trim().replace(":", " ").replace("?", " ").replace("&", " ").replace("=", " ");
    }

    private static byte[] hmacSha1(byte[] key, byte[] data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(key, "HmacSHA1"));
            return mac.doFinal(data);
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Unable to compute TOTP", exception);
        }
    }

    private static String base32Encode(byte[] data) {
        StringBuilder builder = new StringBuilder((data.length * 8 + 4) / 5);
        int buffer = 0;
        int bitsLeft = 0;
        for (byte value : data) {
            buffer = (buffer << 8) | (value & 0xff);
            bitsLeft += 8;
            while (bitsLeft >= 5) {
                int index = (buffer >> (bitsLeft - 5)) & 31;
                bitsLeft -= 5;
                builder.append(BASE32_ALPHABET.charAt(index));
            }
        }
        if (bitsLeft > 0) {
            builder.append(BASE32_ALPHABET.charAt((buffer << (5 - bitsLeft)) & 31));
        }
        return builder.toString();
    }

    private static byte[] base32Decode(String value) {
        String normalized = value == null ? "" : value.replace("=", "").replaceAll("\\s", "").toUpperCase();
        int buffer = 0;
        int bitsLeft = 0;
        byte[] bytes = new byte[normalized.length() * 5 / 8 + 1];
        int count = 0;
        for (char ch : normalized.toCharArray()) {
            int index = BASE32_ALPHABET.indexOf(ch);
            if (index < 0) throw new IllegalArgumentException("Invalid Base32 secret");
            buffer = (buffer << 5) | index;
            bitsLeft += 5;
            if (bitsLeft >= 8) {
                bytes[count++] = (byte) ((buffer >> (bitsLeft - 8)) & 0xff);
                bitsLeft -= 8;
            }
        }
        byte[] result = new byte[count];
        System.arraycopy(bytes, 0, result, 0, count);
        return result;
    }
}
