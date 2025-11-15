# HRMS Frontend

Modern React + TypeScript frontend for HRMS application using Vite, TailwindCSS, and PrimeReact.

## Tech Stack

- **Vite** - Fast build tool and dev server
- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router v6** - Routing and navigation
- **TailwindCSS** - Utility-first CSS framework
- **PrimeReact** - UI component library
- **Axios** - HTTP client for API calls

## Prerequisites

- Node.js 18+ and npm
- Backend server running on http://localhost:8080

## Installation

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

The application will start on http://localhost:3000 with hot-reload enabled.

## Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── api/                      # API layer
│   │   ├── http.ts              # Axios instance with interceptors
│   │   ├── authApi.ts           # Authentication API calls
│   │   ├── superadminApi.ts     # SuperAdmin API calls
│   │   └── orgadminApi.ts       # OrgAdmin API calls
│   ├── auth/                     # Authentication utilities
│   │   ├── useAuth.ts           # Auth hook for checking roles
│   │   └── ProtectedRoute.tsx   # Route protection component
│   ├── components/               # Reusable components
│   │   └── Navbar.tsx           # Navigation bar
│   ├── pages/                    # Page components
│   │   ├── LoginPage.tsx
│   │   ├── SetPasswordPage.tsx
│   │   ├── superadmin/
│   │   │   ├── OrganizationsPage.tsx
│   │   │   ├── CreateOrganizationPage.tsx
│   │   │   └── CreateOrgAdminPage.tsx
│   │   ├── orgadmin/
│   │   │   ├── EmployeesPage.tsx
│   │   │   └── CreateEmployeePage.tsx
│   │   └── employee/
│   │       └── DashboardPage.tsx
│   ├── App.tsx                  # Main app with routing
│   ├── main.tsx                 # Application entry point
│   └── index.css                # Global styles with Tailwind
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── postcss.config.js
```

## Features

### Authentication

- JWT-based authentication
- Token stored in `localStorage`
- Auto-redirect on token expiration (401/403)
- First-time password setup flow
- Role-based access control

### Role-Based Access

**SuperAdmin:**
- View all organizations
- Create organizations
- Create organization admins

**OrgAdmin:**
- View employees in their organization
- Create employees

**Employee:**
- View dashboard (placeholder)
- Change password on first login

### Routes

#### Public Routes
- `/login` - Login page
- `/set-password` - Password setup page

#### SuperAdmin Routes (requires `superadmin` role)
- `/superadmin/organizations` - List all organizations
- `/superadmin/create-organization` - Create new organization
- `/superadmin/orgadmin/:orgId` - Create org admin for organization

#### OrgAdmin Routes (requires `orgadmin` role)
- `/orgadmin/employees` - List employees
- `/orgadmin/create-employee` - Create new employee

#### Employee Routes (requires `employee` role)
- `/employee/dashboard` - Employee dashboard

## API Integration

The frontend integrates with the backend API at `http://localhost:8080`.

### Authentication Flow

1. **Login** (`POST /auth/login`)
   - User enters email and password
   - Backend returns JWT token with user info and roles
   - Token and roles stored in localStorage
   - If `mustChangePassword` is true, redirect to `/set-password`
   - Otherwise, redirect based on highest role

2. **Set Password** (`POST /auth/set-password`)
   - User enters email, temporary password, and new password
   - Backend validates and updates password
   - Redirect to login

3. **Logout** (`POST /auth/logout`)
   - Clear token from localStorage
   - Redirect to login page

### JWT Storage

JWT tokens and user data are stored in localStorage:

```javascript
localStorage.setItem('token', jwt);
localStorage.setItem('roles', JSON.stringify(['superadmin']));
localStorage.setItem('user', JSON.stringify({ id: '...', email: '...' }));
```

### API Interceptors

The HTTP client automatically:
- Adds `Authorization: Bearer <token>` header to all requests
- Redirects to login on 401/403 responses
- Clears localStorage on authentication errors

## Default Credentials

**SuperAdmin:**
- Email: `superadmin@hrms.com`
- Password: `admin123`

## Components Used

### PrimeReact Components
- `InputText` - Text input fields
- `Password` - Password input with toggle visibility
- `Button` - Buttons with loading states
- `DataTable` - Data tables for lists
- `Column` - Table columns

### Custom Components
- `Navbar` - Navigation bar with role-based menu items
- `ProtectedRoute` - Route wrapper for role-based access control

## Styling

The application uses:
- **TailwindCSS** for utility classes
- **PrimeReact Lara Light Blue theme** for components
- Minimal custom styling for consistency

## Environment Variables

To change the backend URL, modify `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://your-backend-url',
        changeOrigin: true,
      }
    }
  }
})
```

Or update `src/api/http.ts`:

```typescript
const http = axios.create({
  baseURL: 'http://your-backend-url',
});
```

## Error Handling

- Form validation errors displayed inline
- API errors shown in red alert boxes
- Success messages shown in green alert boxes
- Automatic retry on network errors (can be configured in axios)

## TypeScript Types

All API requests and responses are fully typed:

```typescript
interface LoginResponse {
  token: string;
  id: string;
  email: string;
  roles: string[];
  mustChangePassword: boolean;
}
```

## Future Enhancements

- Add more employee features (leave management, attendance, etc.)
- Implement profile management
- Add file upload for documents
- Implement real-time notifications
- Add dark mode support
- Enhance mobile responsiveness

## Troubleshooting

**CORS errors:**
- Make sure backend CORS is configured to allow `http://localhost:3000`
- Backend should be running on `http://localhost:8080`

**401 Unauthorized:**
- Check if JWT token is valid
- Check if backend is running
- Verify roles are correctly set in localStorage

**Build errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`

## License

Proprietary - HRMS Application
