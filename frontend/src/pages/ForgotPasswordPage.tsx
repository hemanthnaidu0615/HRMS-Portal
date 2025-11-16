import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, Alert, Typography, Space } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { authApi } from '../api/authApi';

const { Title, Text } = Typography;

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      await authApi.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError('An error occurred. Please try again.');
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
            <Title level={2} style={{ marginBottom: 8 }}>Forgot Password</Title>
            <Text type="secondary">Enter your email to receive a reset link</Text>
          </div>

          {success ? (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Alert
                message="Reset Link Sent"
                description="If this email exists, a reset link has been sent."
                type="success"
                showIcon
              />
              <Button
                type="primary"
                block
                onClick={() => navigate('/login')}
                style={{
                  background: '#0a0d54',
                  borderColor: '#0a0d54',
                  height: 40,
                  borderRadius: 8
                }}
              >
                Back to Login
              </Button>
            </Space>
          ) : (
            <form onSubmit={handleSubmit}>
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
                    Email Address
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
                  Send Reset Link
                </Button>

                <div style={{ textAlign: 'center' }}>
                  <Button
                    type="link"
                    onClick={() => navigate('/login')}
                  >
                    Back to Login
                  </Button>
                </div>
              </Space>
            </form>
          )}
        </Space>
      </Card>
    </div>
  );
};
