import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Input, Button, Alert, Typography, Space } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { authApi } from '../api/authApi';

const { Title, Text } = Typography;

export const SetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || '';

  const [email, setEmail] = useState(emailFromState);
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.setPassword({
        email,
        temporaryPassword,
        newPassword,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to set password. Please try again.');
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
            <Title level={2} style={{ marginBottom: 8 }}>Set New Password</Title>
            <Text type="secondary">Create your permanent password</Text>
          </div>

          {success ? (
            <Alert
              message="Password Changed"
              description="Password changed successfully! Redirecting to login..."
              type="success"
              showIcon
            />
          ) : (
            <form onSubmit={handleSetPassword}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {error && (
                  <Alert message={error} type="error" showIcon closable />
                )}

                <div>
                  <label htmlFor="email" style={{
                    display: 'block',
                    marginBottom: 8,
                    fontWeight: 500
                  }}>
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    prefix={<MailOutlined />}
                    size="large"
                    required
                    style={{ borderRadius: 8 }}
                  />
                </div>

                <div>
                  <label htmlFor="tempPassword" style={{
                    display: 'block',
                    marginBottom: 8,
                    fontWeight: 500
                  }}>
                    Temporary Password
                  </label>
                  <Input.Password
                    id="tempPassword"
                    value={temporaryPassword}
                    onChange={(e) => setTemporaryPassword(e.target.value)}
                    placeholder="Enter temporary password"
                    prefix={<LockOutlined />}
                    size="large"
                    required
                    style={{ borderRadius: 8 }}
                  />
                </div>

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
                  Set Password
                </Button>
              </Space>
            </form>
          )}
        </Space>
      </Card>
    </div>
  );
};
