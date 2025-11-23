package com.hrms.dto;

import java.util.List;

/**
 * Response DTO for organization dashboard statistics
 */
public class DashboardStatsResponse {

    // Key Metrics
    private long totalEmployees;
    private long activeEmployees;
    private long onProbation;
    private long onLeave;
    private long newHiresThisMonth;
    private long pendingApprovals;
    private double attendanceRate;

    // Department breakdown
    private List<DepartmentStat> departmentStats;

    // Employment type breakdown
    private List<EmploymentTypeStat> employmentTypeStats;

    // Recent activities
    private List<ActivityItem> recentActivities;

    // Constructors
    public DashboardStatsResponse() {}

    // ==================== Inner Classes ====================

    public static class DepartmentStat {
        private String name;
        private long employees;
        private double growth;

        public DepartmentStat() {}

        public DepartmentStat(String name, long employees, double growth) {
            this.name = name;
            this.employees = employees;
            this.growth = growth;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public long getEmployees() { return employees; }
        public void setEmployees(long employees) { this.employees = employees; }
        public double getGrowth() { return growth; }
        public void setGrowth(double growth) { this.growth = growth; }
    }

    public static class EmploymentTypeStat {
        private String type;
        private long count;
        private String color;

        public EmploymentTypeStat() {}

        public EmploymentTypeStat(String type, long count) {
            this.type = type;
            this.count = count;
            this.color = getColorForType(type);
        }

        private String getColorForType(String type) {
            return switch (type != null ? type.toLowerCase() : "") {
                case "full_time" -> "#52c41a";
                case "part_time" -> "#1890ff";
                case "contract" -> "#fa8c16";
                case "intern" -> "#722ed1";
                default -> "#d9d9d9";
            };
        }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }
    }

    public static class ActivityItem {
        private String type;
        private String userName;
        private String action;
        private String time;
        private String status;

        public ActivityItem() {}

        public ActivityItem(String type, String userName, String action, String time, String status) {
            this.type = type;
            this.userName = userName;
            this.action = action;
            this.time = time;
            this.status = status;
        }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public String getTime() { return time; }
        public void setTime(String time) { this.time = time; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    // ==================== Getters and Setters ====================

    public long getTotalEmployees() { return totalEmployees; }
    public void setTotalEmployees(long totalEmployees) { this.totalEmployees = totalEmployees; }

    public long getActiveEmployees() { return activeEmployees; }
    public void setActiveEmployees(long activeEmployees) { this.activeEmployees = activeEmployees; }

    public long getOnProbation() { return onProbation; }
    public void setOnProbation(long onProbation) { this.onProbation = onProbation; }

    public long getOnLeave() { return onLeave; }
    public void setOnLeave(long onLeave) { this.onLeave = onLeave; }

    public long getNewHiresThisMonth() { return newHiresThisMonth; }
    public void setNewHiresThisMonth(long newHiresThisMonth) { this.newHiresThisMonth = newHiresThisMonth; }

    public long getPendingApprovals() { return pendingApprovals; }
    public void setPendingApprovals(long pendingApprovals) { this.pendingApprovals = pendingApprovals; }

    public double getAttendanceRate() { return attendanceRate; }
    public void setAttendanceRate(double attendanceRate) { this.attendanceRate = attendanceRate; }

    public List<DepartmentStat> getDepartmentStats() { return departmentStats; }
    public void setDepartmentStats(List<DepartmentStat> departmentStats) { this.departmentStats = departmentStats; }

    public List<EmploymentTypeStat> getEmploymentTypeStats() { return employmentTypeStats; }
    public void setEmploymentTypeStats(List<EmploymentTypeStat> employmentTypeStats) { this.employmentTypeStats = employmentTypeStats; }

    public List<ActivityItem> getRecentActivities() { return recentActivities; }
    public void setRecentActivities(List<ActivityItem> recentActivities) { this.recentActivities = recentActivities; }
}
