import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Card, Alert, Row, Col } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { authApi } from '../api/authApi';

export const SetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || '';
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSetPassword = async (values: any) => {
    setError('');
    setLoading(true);

    try {
      await authApi.setPassword({
        email: values.email,
        temporaryPassword: values.temporaryPassword,
        newPassword: values.newPassword,
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#dde4eb' }}>
      <Row justify="center" className="w-full px-4">
        <Col xs={24} sm={20} md={16} lg={12} xl={8}>
          <Card
            className="shadow-lg"
            style={{
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
            }}
          >
            <h1 className="text-2xl font-bold text-center mb-6" style={{ color: '#0a0d54' }}>
              Set New Password
            </h1>

            {success ? (
              <Alert
                message="Password changed successfully! Redirecting to login..."
                type="success"
                showIcon
                className="text-center"
              />
            ) : (
              <Form
                form={form}
                onFinish={handleSetPassword}
                layout="vertical"
                initialValues={{ email: emailFromState }}
                autoComplete="off"
              >
                {error && (
                  <Form.Item>
                    <Alert message={error} type="error" showIcon closable onClose={() => setError('')} />
                  </Form.Item>
                )}

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Please input your email!' },
                    { type: 'email', message: 'Please enter a valid email!' },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Enter your email"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="Temporary Password"
                  name="temporaryPassword"
                  rules={[{ required: true, message: 'Please input your temporary password!' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Enter temporary password"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="New Password"
                  name="newPassword"
                  rules={[
                    { required: true, message: 'Please input your new password!' },
                    { min: 6, message: 'Password must be at least 6 characters!' },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Enter new password"
                    size="large"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    block
                    style={{
                      background: '#0a0d54',
                      borderColor: '#0a0d54',
                      height: '45px',
                      fontWeight: '500',
                    }}
                  >
                    Set Password
                  </Button>
                </Form.Item>
              </Form>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
