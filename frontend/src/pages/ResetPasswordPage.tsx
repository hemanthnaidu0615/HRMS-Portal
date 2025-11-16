import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Card, Alert, Row, Col } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { authApi } from '../api/authApi';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values: any) => {
    setError('');

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword(token, values.newPassword);
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
              Reset Password
            </h1>

            {success ? (
              <Alert
                message="Password updated successfully. Please log in."
                type="success"
                showIcon
                className="text-center"
              />
            ) : (
              <Form
                form={form}
                onFinish={handleSubmit}
                layout="vertical"
                autoComplete="off"
              >
                {error && (
                  <Form.Item>
                    <Alert message={error} type="error" showIcon closable onClose={() => setError('')} />
                  </Form.Item>
                )}

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

                <Form.Item
                  label="Confirm Password"
                  name="confirmPassword"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: 'Please confirm your password!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Passwords do not match!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Confirm new password"
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
                    Reset Password
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
