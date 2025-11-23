package com.hrms.entity;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "positions")
public class Position {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(length = 50, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(name = "seniority_level", nullable = false)
    private Integer seniorityLevel;

    public Position() {
    }

    public Position(Organization organization, String name, Integer seniorityLevel) {
        this.organization = organization;
        this.name = name;
        this.seniorityLevel = seniorityLevel;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getSeniorityLevel() {
        return seniorityLevel;
    }

    public void setSeniorityLevel(Integer seniorityLevel) {
        this.seniorityLevel = seniorityLevel;
    }

    /**
     * @return The title (alias for name)
     */
    public String getTitle() {
        return name;
    }
}
