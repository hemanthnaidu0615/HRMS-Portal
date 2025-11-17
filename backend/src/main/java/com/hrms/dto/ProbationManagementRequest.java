package com.hrms.dto;

import java.time.LocalDate;

public class ProbationManagementRequest {
    private String action; // extend, complete, terminate
    private LocalDate newEndDate; // for extend
    private String notes; // optional notes

    public ProbationManagementRequest() {
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public LocalDate getNewEndDate() {
        return newEndDate;
    }

    public void setNewEndDate(LocalDate newEndDate) {
        this.newEndDate = newEndDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
