#!/bin/bash

# HRMS Module Code Generator
# Generates all entities, repositories, services, and controllers for new modules

BACKEND_BASE="/home/user/HRMS-Portal/backend/src/main/java/com/hrms"

echo "🚀 Starting HRMS Module Code Generation..."
echo "==========================================="

# Create all necessary directories
mkdir -p "${BACKEND_BASE}/entity/attendance"
mkdir -p "${BACKEND_BASE}/entity/leave"
mkdir -p "${BACKEND_BASE}/entity/timesheet"
mkdir -p "${BACKEND_BASE}/entity/payroll"
mkdir -p "${BACKEND_BASE}/entity/performance"
mkdir -p "${BACKEND_BASE}/entity/recruitment"
mkdir -p "${BACKEND_BASE}/entity/asset"
mkdir -p "${BACKEND_BASE}/entity/expense"
mkdir -p "${BACKEND_BASE}/entity/notification"

mkdir -p "${BACKEND_BASE}/repository/attendance"
mkdir -p "${BACKEND_BASE}/repository/leave"
mkdir -p "${BACKEND_BASE}/repository/timesheet"
mkdir -p "${BACKEND_BASE}/repository/payroll"
mkdir -p "${BACKEND_BASE}/repository/performance"
mkdir -p "${BACKEND_BASE}/repository/recruitment"
mkdir -p "${BACKEND_BASE}/repository/asset"
mkdir -p "${BACKEND_BASE}/repository/expense"
mkdir -p "${BACKEND_BASE}/repository/notification"

mkdir -p "${BACKEND_BASE}/service/attendance"
mkdir -p "${BACKEND_BASE}/service/leave"
mkdir -p "${BACKEND_BASE}/service/timesheet"
mkdir -p "${BACKEND_BASE}/service/payroll"
mkdir -p "${BACKEND_BASE}/service/performance"
mkdir -p "${BACKEND_BASE}/service/recruitment"
mkdir -p "${BACKEND_BASE}/service/asset"
mkdir -p "${BACKEND_BASE}/service/expense"
mkdir -p "${BACKEND_BASE}/service/notification"

mkdir -p "${BACKEND_BASE}/controller/attendance"
mkdir -p "${BACKEND_BASE}/controller/leave"
mkdir -p "${BACKEND_BASE}/controller/timesheet"
mkdir -p "${BACKEND_BASE}/controller/payroll"
mkdir -p "${BACKEND_BASE}/controller/performance"
mkdir -p "${BACKEND_BASE}/controller/recruitment"
mkdir -p "${BACKEND_BASE}/controller/asset"
mkdir -p "${BACKEND_BASE}/controller/expense"
mkdir -p "${BACKEND_BASE}/controller/notification"

mkdir -p "${BACKEND_BASE}/dto/attendance"
mkdir -p "${BACKEND_BASE}/dto/leave"
mkdir -p "${BACKEND_BASE}/dto/timesheet"
mkdir -p "${BACKEND_BASE}/dto/payroll"
mkdir -p "${BACKEND_BASE}/dto/performance"
mkdir -p "${BACKEND_BASE}/dto/recruitment"
mkdir -p "${BACKEND_BASE}/dto/asset"
mkdir -p "${BACKEND_BASE}/dto/expense"
mkdir -p "${BACKEND_BASE}/dto/notification"

echo "✅ Directory structure created"
echo "📝 Ready for entity generation"
