---
description: Run the HRMS Backend locally with H2 Database
---
This workflow describes how to run the HRMS Backend application locally using the H2 in-memory database. This is useful for development and testing without needing a separate SQL Server instance.

1. **Navigate to the backend directory**
   ```powershell
   cd d:/Github/HRMS-Portal/backend
   ```

2. **Build the application**
   // turbo
   ```powershell
   mvn clean package -DskipTests
   ```

3. **Run the application**
   // turbo
   ```powershell
   java -jar target/hrms-backend-1.0.0.jar
   ```

4. **(Optional) Run the full flow test script**
   Open a new terminal window and run:
   ```powershell
   cd d:/Github/HRMS-Portal/backend
   powershell -ExecutionPolicy Bypass -File test_full_flow.ps1
   ```

**Note:** The application is configured to use H2 by default in `application.properties`. The database file is stored in `./data/hrms_local_db`.
