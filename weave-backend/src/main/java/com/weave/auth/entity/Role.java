package com.weave.auth.entity;

public enum Role {
    CREATOR, BRAND, EDITOR, ADMIN;

    public static Role from(String value) {
        try {
            return Role.valueOf(value.trim().toUpperCase());
        } catch (RuntimeException exception) {
            throw new IllegalArgumentException("Role must be creator, brand, editor, or admin");
        }
    }
}
