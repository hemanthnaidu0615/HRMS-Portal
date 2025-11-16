import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Card, Alert, Row, Col } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { superadminApi } from '../../api/superadminApi';

export const CreateOrgAdminPage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values: any) => {
    setError('');
    setLoading(true);

    try {
      await superadminApi.createOrgAdmin(orgId!, {
        email: values.email,
        temporaryPassword: values.temporaryPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/superadmin/organizations');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create organization admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6" style={{ background: '#dde4eb', minHeight: '100vh' }}>
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12} xl={10}>
          <Card
            className="shadow-md"
            style={{
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
            }}
          >
            <h1 className="text-3xl font-bold mb-6" style={{ color: '#0a0d54' }}>
              Create Organization Admin
            </h1>

            {success ? (
              <Alert
                message="Organization admin created successfully! Email sent with credentials. Redirecting..."
                type="success"
                showIcon
              />
            ) : (
              <>
                {error && (
                  <Alert
                    message={error}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setError('')}
                    className="mb-4"
                  />
                )}

                <Form
                  form={form}
                  onFinish={handleSubmit}
                  layout="vertical"
                  autoComplete="off"
                >
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: 'Please input email!' },
                      { type: 'email', message: 'Please enter a valid email!' },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="Enter email"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Temporary Password"
                    name="temporaryPassword"
                    rules={[{ required: true, message: 'Please input temporary password!' }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Enter temporary password"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item>
                    <div className="flex gap-2">
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        size="large"
                        style={{ background: '#0a0d54', borderColor: '#0a0d54' }}
                      >
                        Create
                      </Button>
                      <Button
                        size="large"
                        onClick={() => navigate('/superadmin/organizations')}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Form.Item>
                </Form>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
