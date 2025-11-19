# HRMS Portal - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Setup Environment Configuration

```bash
# Copy the environment template
cp .env.example .env

# Edit the .env file with your settings
nano .env  # or use your preferred editor
```

**Required Configuration:**
- Database connection details (host, username, password)
- JWT secret key (generate with: `openssl rand -base64 32`)
- Super admin credentials
- Azure Storage connection string

### Step 2: Choose Your Setup

---

## 🖥️ Option A: Local Development

Perfect for development and testing.

### Backend
```bash
cd backend
mvn spring-boot:run
```
✅ Backend running on `http://localhost:8080`

### Frontend
```bash
cd frontend
npm install  # first time only
npm run dev
```
✅ Frontend running on `http://localhost:3000`

### Access
Open your browser: **http://localhost:3000**

---

## 🐳 Option B: Docker Deployment

Perfect for production on Azure VM.

```bash
# Build and start all services
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

✅ Application running on **http://your-vm-ip**

---

## 🔑 Important Notes

### One .env File for Everything
- ✅ Same `.env` works for both local and Docker
- ✅ No need to change baseURL or configuration
- ✅ Keep `.env` secure and never commit it to git

### How Routing Works
- **Local Dev**: Vite proxy forwards `/api` calls to backend
- **Docker**: Nginx proxy forwards `/api` calls to backend
- **Result**: Frontend code uses relative URLs (e.g., `/api/users`)

### Default Login
Use the credentials you set in `.env`:
- Email: `SUPERADMIN_EMAIL`
- Password: `SUPERADMIN_PASSWORD`

---

## 📋 Verification Checklist

After starting the application:

- [ ] Backend health check: `curl http://localhost:8080/actuator/health`
- [ ] Frontend loads in browser
- [ ] Can login with super admin credentials
- [ ] API calls work (check browser Network tab)

---

## 🆘 Quick Troubleshooting

**Backend won't start:**
- Check `.env` file exists and has all required values
- Verify database connection: `telnet your-db-host 1433`
- Check Java version: `java -version` (need Java 21)

**Frontend won't start:**
- Check Node version: `node -v` (need Node 18+)
- Try: `cd frontend && rm -rf node_modules && npm install`

**Can't login:**
- Verify `SUPERADMIN_EMAIL` and `SUPERADMIN_PASSWORD` in `.env`
- Check backend logs for errors
- Ensure database is accessible

**Docker containers fail:**
- Check `.env` exists in project root
- View logs: `docker-compose logs backend`
- Verify Docker is running: `docker ps`

---

## 📚 Need More Help?

- **Full Deployment Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Environment Variables**: See [.env.example](./.env.example)
- **Application Logs**:
  - Local: Check console output
  - Docker: `docker-compose logs -f`

---

## 🔄 Common Commands

### Local Development
```bash
# Start backend
cd backend && mvn spring-boot:run

# Start frontend
cd frontend && npm run dev

# Run tests
cd backend && mvn test
cd frontend && npm test
```

### Docker Deployment
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart specific service
docker-compose restart backend

# View logs
docker-compose logs -f [service-name]

# Rebuild after changes
docker-compose up -d --build
```

---

**Ready to go! 🎉**

For detailed information, see [DEPLOYMENT.md](./DEPLOYMENT.md)
