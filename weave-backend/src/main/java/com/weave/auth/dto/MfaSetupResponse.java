package com.weave.auth.dto;

import java.util.List;

public record MfaSetupResponse(String secret, String otpauthUri, List<String> recoveryCodes, String message) { }
