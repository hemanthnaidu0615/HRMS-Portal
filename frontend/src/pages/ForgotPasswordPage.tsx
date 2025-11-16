import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Alert, Row, Col } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { authApi } from '../api/authApi';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values: any) => {
    setError('');
    setLoading(true);

    try {
      await authApi.forgotPassword(values.email);
      setSuccess(true);
    } catch (err: any) {
      setError('An error occurred. Please try again.');
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
              Forgot Password
            </h1>

            {success ? (
              <div className="text-center">
                <Alert
                  message="If this email exists, a reset link has been sent."
                  type="success"
                  showIcon
                  className="mb-4"
                />
                <Button
                  type="default"
                  size="large"
                  onClick={() => navigate('/login')}
                  block
                >
                  Back to Login
                </Button>
              </div>
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
                  label="Email Address"
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
                    Send Reset Link
                  </Button>
                </Form.Item>

                <div className="text-center">
                  <Button
                    type="link"
                    onClick={() => navigate('/login')}
                    style={{ color: '#0a0d54' }}
                  >
                    Back to Login
                  </Button>
                </div>
              </Form>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
