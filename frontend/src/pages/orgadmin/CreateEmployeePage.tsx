import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, Alert, Typography, Space } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { orgadminApi } from '../../api/orgadminApi';

const { Title } = Typography;

export const CreateEmployeePage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await orgadminApi.createEmployee({ email, temporaryPassword });
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/employees');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to create employee. Please check the email and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <Card
          style={{
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Title level={3}>Create Employee</Title>

            {success ? (
              <Alert
                message="Employee Created Successfully"
                description="Employee created successfully! Email sent with credentials. Redirecting..."
                type="success"
                showIcon
              />
            ) : (
              <>
                {error && (
                  <Alert
                    message="Error Creating Employee"
                    description={error}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setError('')}
                  />
                )}

                <form onSubmit={handleSubmit}>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
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
                        placeholder="Enter email"
                        prefix={<MailOutlined />}
                        size="large"
                        required
                        style={{ borderRadius: 8 }}
                      />
                    </div>

                    <div>
                      <label htmlFor="password" style={{
                        display: 'block',
                        marginBottom: 8,
                        fontWeight: 500
                      }}>
                        Temporary Password
                      </label>
                      <Input.Password
                        id="password"
                        value={temporaryPassword}
                        onChange={(e) => setTemporaryPassword(e.target.value)}
                        placeholder="Enter temporary password"
                        prefix={<LockOutlined />}
                        size="large"
                        required
                        style={{ borderRadius: 8 }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        disabled={loading}
                        style={{
                          background: '#0a0d54',
                          borderColor: '#0a0d54',
                          borderRadius: 8
                        }}
                      >
                        Create
                      </Button>
                      <Button
                        onClick={() => navigate('/orgadmin/employees')}
                        style={{ borderRadius: 8 }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Space>
                </form>
              </>
            )}
          </Space>
        </Card>
      </div>
    </div>
  );
};
