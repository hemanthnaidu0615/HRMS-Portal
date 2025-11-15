import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { authApi } from '../api/authApi';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login({ email, password });

      // Store token and roles
      localStorage.setItem('token', response.token);
      localStorage.setItem('roles', JSON.stringify(response.roles));
      localStorage.setItem('user', JSON.stringify({ id: response.id, email: response.email }));

      // Check if password must be changed
      if (response.mustChangePassword) {
        navigate('/set-password', { state: { email } });
        return;
      }

      // Redirect based on highest role
      if (response.roles.includes('superadmin')) {
        navigate('/superadmin/organizations');
      } else if (response.roles.includes('orgadmin')) {
        navigate('/orgadmin/employees');
      } else if (response.roles.includes('employee')) {
        navigate('/employee/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">HRMS Login</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <InputText
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full"
              inputClassName="w-full"
              toggleMask
              feedback={false}
              required
            />
          </div>

          <Button
            type="submit"
            label="Login"
            loading={loading}
            className="w-full"
            disabled={loading}
          />

          <div className="text-center mt-4">
            <Button
              label="Forgot password?"
              link
              onClick={() => navigate('/forgot-password')}
            />
          </div>
        </form>
      </div>
    </div>
  );
};
