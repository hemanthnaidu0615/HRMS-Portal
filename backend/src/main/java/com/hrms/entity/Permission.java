package com.hrms.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Permission entity using resource:action:scope model
 * Examples:
 * - employees:view:own
 * - employees:edit:team
 * - leaves:approve:department
 * - payroll:run:organization
 */
@Entity
@Table(
    name = "permissions",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"resource", "action", "scope", "organization_id"}
    )
)
public class Permission {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String resource;  // employees, documents, leaves, timesheets, payroll

    @Column(nullable = false, length = 100)
    private String action;    // view, edit, create, delete, approve, submit, run

    @Column(nullable = false, length = 50)
    private String scope;     // own, team, department, organization

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;  // NULL = system permission, else org-specific

    @Column(length = 500)
    private String description;

    public Permission() {
    }

    public Permission(String resource, String action, String scope) {
        this.resource = resource;
        this.action = action;
        this.scope = scope;
    }

    public Permission(String resource, String action, String scope, String description) {
        this.resource = resource;
        this.action = action;
        this.scope = scope;
        this.description = description;
    }

    /**
     * Get permission code in format: resource:action:scope
     * Example: "employees:view:team"
     */
    public String getCode() {
        return resource + ":" + action + ":" + scope;
    }

    /**
     * Parse permission code and create Permission object
     * Example: "employees:view:team" -> Permission(employees, view, team)
     */
    public static Permission fromCode(String code) {
        String[] parts = code.split(":");
        if (parts.length != 3) {
            throw new IllegalArgumentException("Invalid permission code: " + code);
        }
        return new Permission(parts[0], parts[1], parts[2]);
    }

    // Getters and setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getResource() {
        return resource;
    }

    public void setResource(String resource) {
        this.resource = resource;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getScope() {
        return scope;
    }

    public void setScope(String scope) {
        this.scope = scope;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Permission)) return false;
        Permission that = (Permission) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
