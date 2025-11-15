package com.hrms.dto;

import java.util.List;
import java.util.UUID;

public class LoginResponse {
    private String token;
    private UUID id;
    private String email;
    private List<String> roles;
    private boolean mustChangePassword;

    public LoginResponse() {
    }

    public LoginResponse(String token, UUID id, String email, List<String> roles, boolean mustChangePassword) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.roles = roles;
        this.mustChangePassword = mustChangePassword;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public boolean isMustChangePassword() {
        return mustChangePassword;
    }

    public void setMustChangePassword(boolean mustChangePassword) {
        this.mustChangePassword = mustChangePassword;
    }
}
