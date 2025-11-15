import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { useAuth } from '../auth/useAuth';
import { authApi } from '../api/authApi';

export const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, roles } = useAuth();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Ignore errors, just clear local storage
    }
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">HRMS</h1>

            {roles.includes('superadmin') && (
              <Button
                label="Organizations"
                text
                className="text-white"
                onClick={() => navigate('/superadmin/organizations')}
              />
            )}

            {roles.includes('orgadmin') && (
              <>
                <Button
                  label="Employees"
                  text
                  className="text-white"
                  onClick={() => navigate('/orgadmin/employees')}
                />
                <Button
                  label="Employee Mgmt"
                  text
                  className="text-white"
                  onClick={() => navigate('/admin/employees')}
                />
                <Button
                  label="Org Tree"
                  text
                  className="text-white"
                  onClick={() => navigate('/admin/employees/tree')}
                />
                <Button
                  label="Departments"
                  text
                  className="text-white"
                  onClick={() => navigate('/admin/structure/departments')}
                />
                <Button
                  label="Positions"
                  text
                  className="text-white"
                  onClick={() => navigate('/admin/structure/positions')}
                />
                <Button
                  label="Permission Groups"
                  text
                  className="text-white"
                  onClick={() => navigate('/admin/permissions/groups')}
                />
                <Button
                  label="Org Documents"
                  text
                  className="text-white"
                  onClick={() => navigate('/documents/org')}
                />
                <Button
                  label="Org Requests"
                  text
                  className="text-white"
                  onClick={() => navigate('/document-requests/org')}
                />
              </>
            )}

            {roles.includes('employee') && (
              <>
                <Button
                  label="Dashboard"
                  text
                  className="text-white"
                  onClick={() => navigate('/employee/dashboard')}
                />
                <Button
                  label="My Documents"
                  text
                  className="text-white"
                  onClick={() => navigate('/documents/me')}
                />
                <Button
                  label="My Requests"
                  text
                  className="text-white"
                  onClick={() => navigate('/document-requests/me')}
                />
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm">
              {roles.join(', ')}
            </span>
            <Button
              label="Logout"
              icon="pi pi-sign-out"
              text
              className="text-white"
              onClick={handleLogout}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};
