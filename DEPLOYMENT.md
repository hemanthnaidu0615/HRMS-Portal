# HRMS Portal - Deployment Guide

## Overview

This guide covers both **local development** and **Docker deployment** on Azure VM using a **single unified `.env` configuration file**.

---

## Quick Start

### Prerequisites

**For Local Development:**
- Java 21 (JDK)
- Maven 3.9+
- Node.js 18+
- npm or yarn

**For Docker Deployment:**
- Docker Engine 20.10+
- Docker Compose 2.0+

---

## Configuration Setup

### Step 1: Create Your Environment File

```bash
# Copy the example environment file
cp .env.example .env
```

### Step 2: Configure Required Values

Edit the `.env` file and fill in all `<REQUIRED>` values:

#### Database Configuration (REQUIRED)
```env
SPRING_DATASOURCE_URL=jdbc:sqlserver://your-db-host:1433;databaseName=hrms_db;encrypt=true;trustServerCertificate=false;loginTimeout=30
SPRING_DATASOURCE_USERNAME=your_db_username
SPRING_DATASOURCE_PASSWORD=your_db_password
```

#### Security Configuration (REQUIRED)
```bash
# Generate a strong JWT secret
SECURITY_JWT_SECRET=$(openssl rand -base64 32)
```

#### Super Admin Account (REQUIRED)
```env
SUPERADMIN_EMAIL=admin@yourcompany.com
SUPERADMIN_PASSWORD=YourStrongPassword123!
```

#### Azure Storage (REQUIRED)
```env
STORAGE_AZURE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
STORAGE_AZURE_CONTAINER=hrms-documents
```

#### CORS Configuration
```env
# For local development
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost

# For production (replace with your domain)
# CORS_ALLOWED_ORIGINS=https://yourdomain.com,http://your-vm-ip
```

---

## Local Development

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Run the Spring Boot application
mvn spring-boot:run

# Backend will be available at http://localhost:8080
```

The backend will automatically:
- Load environment variables from the root `.env` file (via spring-dotenv library)
- Connect to your hosted database
- Start on port 8080

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Frontend will be available at http://localhost:3000
```

The frontend will automatically:
- Use Vite's dev server on port 3000
- Proxy `/api` and `/auth` requests to `http://localhost:8080`
- Enable hot module replacement for fast development

### Testing the Local Setup

1. **Backend Health Check:**
   ```bash
   curl http://localhost:8080/actuator/health
   ```
   Expected: `{"status":"UP"}`

2. **Frontend Access:**
   - Open browser: `http://localhost:3000`
   - You should see the HRMS login page

3. **API Test:**
   ```bash
   curl http://localhost:3000/api/health
   # This will be proxied to http://localhost:8080/api/health
   ```

---

## Docker Deployment

### Single VM Deployment (Frontend + Backend)

#### Step 1: Prepare Your VM

```bash
# Install Docker and Docker Compose (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y docker.io docker-compose

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (optional, to run without sudo)
sudo usermod -aG docker $USER
# Log out and back in for this to take effect
```

#### Step 2: Upload Project Files

```bash
# From your local machine, upload to VM
scp -r /path/to/HRMS-Portal user@your-vm-ip:/home/user/

# OR clone from git
ssh user@your-vm-ip
git clone https://github.com/your-org/HRMS-Portal.git
cd HRMS-Portal
```

#### Step 3: Configure Environment

```bash
# On the VM
cd /home/user/HRMS-Portal

# Copy and edit .env file
cp .env.example .env
nano .env  # or use vim, vi, etc.

# Fill in all required values
# Make sure CORS_ALLOWED_ORIGINS includes your VM IP or domain
```

#### Step 4: Build and Deploy

```bash
# Build and start all services
docker-compose up -d --build

# This will:
# 1. Build the backend Spring Boot application
# 2. Build the frontend React application
# 3. Start backend on internal port 8080
# 4. Start frontend nginx on external port 80
```

#### Step 5: Verify Deployment

```bash
# Check container status
docker-compose ps

# Should show:
# hrms-backend    running    0.0.0.0:8080->8080/tcp
# hrms-frontend   running    0.0.0.0:80->80/tcp

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Test backend health
docker-compose exec backend wget -qO- http://localhost:8080/actuator/health

# Test frontend (from your browser)
# http://your-vm-ip
```

### Docker Commands Reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# View logs
docker-compose logs -f [service-name]

# Restart a specific service
docker-compose restart backend
docker-compose restart frontend

# Execute command in container
docker-compose exec backend bash
docker-compose exec frontend sh

# View container stats
docker stats

# Clean up (remove containers, networks, volumes)
docker-compose down -v
```

---

## Architecture

### Local Development Architecture
```
┌─────────────────┐         ┌──────────────────┐
│   Browser       │         │                  │
│  localhost:3000 │ ───────▶│  Vite Dev Server │
└─────────────────┘         │  (Frontend)      │
                            │  Port 3000       │
                            └─────────┬────────┘
                                      │ Proxy /api, /auth
                                      ▼
                            ┌──────────────────┐
                            │  Spring Boot     │
                            │  (Backend)       │
                            │  Port 8080       │
                            └─────────┬────────┘
                                      │
                                      ▼
                            ┌──────────────────┐
                            │  SQL Server DB   │
                            │  (Hosted)        │
                            └──────────────────┘
```

### Docker Deployment Architecture
```
┌─────────────────┐         ┌──────────────────┐
│   Browser       │         │  Nginx Container │
│  your-vm-ip:80  │ ───────▶│  (Frontend)      │
└─────────────────┘         │  Port 80         │
                            └─────────┬────────┘
                                      │ Proxy /api, /auth
                                      ▼
                            ┌──────────────────┐
                            │  Spring Boot     │
                            │  Container       │
                            │  (Backend)       │
                            │  Port 8080       │
                            └─────────┬────────┘
                                      │
                                      ▼
                            ┌──────────────────┐
                            │  SQL Server DB   │
                            │  (External)      │
                            └──────────────────┘
```

---

## Environment Variables Explained

### How It Works

1. **Single Source of Truth**: One `.env` file in the project root
2. **Local Development**:
   - Backend: Spring-dotenv library loads `.env` automatically
   - Frontend: Vite reads `VITE_*` variables (but not needed due to proxy)
3. **Docker Deployment**:
   - `docker-compose.yml` uses `env_file: .env`
   - All variables are injected into containers as environment variables
   - Spring Boot reads them via `${VAR_NAME}` syntax in `application.properties`

### No BaseURL Configuration Needed!

**Why?** Both environments use proxying:
- **Local**: Vite dev server proxies `/api` and `/auth` to `localhost:8080`
- **Docker**: Nginx proxies `/api` and `/auth` to `backend:8080`

Frontend code makes relative API calls (e.g., `axios.get('/api/users')`), and the proxy handles routing to the backend.

---

## Troubleshooting

### Local Development Issues

**Backend won't start:**
```bash
# Check if .env file exists
ls -la .env

# Verify Java version
java -version  # Should be 21

# Check if port 8080 is in use
lsof -i :8080
# or
netstat -an | grep 8080
```

**Frontend won't start:**
```bash
# Check Node version
node -v  # Should be 18+

# Clear npm cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install

# Check if port 3000 is in use
lsof -i :3000
```

**Database connection issues:**
```bash
# Test database connectivity
telnet your-db-host 1433

# Check firewall rules
# Ensure your DB allows connections from your IP
```

### Docker Deployment Issues

**Containers won't start:**
```bash
# Check Docker status
sudo systemctl status docker

# View container logs
docker-compose logs backend
docker-compose logs frontend

# Check if .env file is being loaded
docker-compose config
```

**Backend health check fails:**
```bash
# Check backend logs
docker-compose logs -f backend

# Exec into backend container
docker-compose exec backend bash
# Then check Java process
ps aux | grep java
# Test health endpoint
wget -qO- http://localhost:8080/actuator/health
```

**Cannot access frontend:**
```bash
# Check if port 80 is blocked by firewall
sudo ufw status
sudo ufw allow 80/tcp

# On Azure VM, ensure NSG allows inbound port 80

# Check nginx logs
docker-compose logs -f frontend

# Verify nginx is running
docker-compose exec frontend sh
ps aux | grep nginx
```

**Environment variables not loaded:**
```bash
# Check if .env exists in root
ls -la .env

# Verify docker-compose sees the variables
docker-compose config

# Check environment variables in container
docker-compose exec backend env | grep SPRING
```

### Common Error Messages

**"Failed to determine a suitable driver class"**
- Missing or incorrect `SPRING_DATASOURCE_URL`
- Check database URL format in `.env`

**"Access Denied for user"**
- Incorrect database credentials
- Verify `SPRING_DATASOURCE_USERNAME` and `SPRING_DATASOURCE_PASSWORD`

**"CORS policy: No 'Access-Control-Allow-Origin' header"**
- Add frontend URL to `CORS_ALLOWED_ORIGINS` in `.env`
- For Docker: include `http://your-vm-ip`

**"JWT secret cannot be null"**
- Missing `SECURITY_JWT_SECRET` in `.env`
- Generate one: `openssl rand -base64 32`

---

## Security Best Practices

### Production Checklist

- [ ] Use strong, randomly generated `SECURITY_JWT_SECRET` (32+ characters)
- [ ] Use strong `SUPERADMIN_PASSWORD` with special characters
- [ ] Restrict `CORS_ALLOWED_ORIGINS` to your domain only
- [ ] Set `SWAGGER_ENABLED=false` in production
- [ ] Use HTTPS (configure reverse proxy/load balancer)
- [ ] Never commit `.env` to version control
- [ ] Regularly rotate database credentials
- [ ] Enable database connection encryption (`encrypt=true` in URL)
- [ ] Configure firewall rules (only allow ports 80, 443)
- [ ] Regular security updates: `docker-compose pull && docker-compose up -d`
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for database

### Securing .env File

```bash
# Restrict file permissions (Linux/Mac)
chmod 600 .env
chown $USER:$USER .env

# Verify
ls -l .env
# Should show: -rw------- (only owner can read/write)
```

### Azure VM Security (NSG Rules)

```bash
# Required inbound rules:
# - Port 80 (HTTP) - for frontend access
# - Port 443 (HTTPS) - if using SSL
# - Port 22 (SSH) - for management (restrict to your IP)

# Backend port 8080 should NOT be exposed to internet
# (nginx proxies to it internally via Docker network)
```

---

## Updating the Application

### Local Development Updates

```bash
# Pull latest changes
git pull origin main

# Backend
cd backend
mvn clean install
mvn spring-boot:run

# Frontend
cd frontend
npm install  # if dependencies changed
npm run dev
```

### Docker Deployment Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Or rebuild specific service
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

---

## Monitoring and Maintenance

### Health Checks

```bash
# Backend health
curl http://your-vm-ip/actuator/health

# Backend metrics
curl http://your-vm-ip/actuator/metrics

# Check disk space
df -h

# Check memory usage
free -h

# Check Docker disk usage
docker system df
```

### Log Management

```bash
# View recent logs
docker-compose logs --tail=100 backend
docker-compose logs --tail=100 frontend

# Follow logs in real-time
docker-compose logs -f

# Export logs to file
docker-compose logs > app-logs.txt

# Clear Docker logs (if disk space is low)
truncate -s 0 /var/lib/docker/containers/*/*-json.log
```

### Database Maintenance

```bash
# Backup database
# Use your SQL Server backup tools or Azure backup services

# Example: Azure SQL Database backup is automatic
# Verify backup retention period in Azure Portal
```

---

## Rollback Procedure

If deployment fails:

```bash
# Stop current deployment
docker-compose down

# Revert to previous version
git checkout <previous-commit-hash>

# Rebuild and deploy
docker-compose up -d --build

# Or restore from backup
git checkout main
# Restore previous .env if needed
# Restore database from backup if needed
```

---

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Review this documentation
3. Check application properties: `backend/src/main/resources/application.properties`
4. Verify `.env` configuration

---

## Additional Resources

- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

---

**Last Updated:** 2025-11-18
**Version:** 1.0.0
