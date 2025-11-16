import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Input, Button, Alert, Typography, Space } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { authApi } from '../api/authApi';

const { Title, Text } = Typography;

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 450,
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ marginBottom: 8 }}>Reset Password</Title>
            <Text type="secondary">Enter your new password</Text>
          </div>

          {success ? (
            <Alert
              message="Password Updated"
              description="Password updated successfully. Please log in."
              type="success"
              showIcon
            />
          ) : (
            <form onSubmit={handleSubmit}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {error && (
                  <Alert message={error} type="error" showIcon closable />
                )}

                <div>
                  <label htmlFor="newPassword" style={{
                    display: 'block',
                    marginBottom: 8,
                    fontWeight: 500
                  }}>
                    New Password
                  </label>
                  <Input.Password
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    prefix={<LockOutlined />}
                    size="large"
                    required
                    style={{ borderRadius: 8 }}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" style={{
                    display: 'block',
                    marginBottom: 8,
                    fontWeight: 500
                  }}>
                    Confirm Password
                  </label>
                  <Input.Password
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    prefix={<LockOutlined />}
                    size="large"
                    required
                    style={{ borderRadius: 8 }}
                  />
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  disabled={loading}
                  style={{
                    background: '#0a0d54',
                    borderColor: '#0a0d54',
                    height: 40,
                    borderRadius: 8,
                    marginTop: 8
                  }}
                >
                  Reset Password
                </Button>
              </Space>
            </form>
          )}
        </Space>
      </Card>
    </div>
  );
};
