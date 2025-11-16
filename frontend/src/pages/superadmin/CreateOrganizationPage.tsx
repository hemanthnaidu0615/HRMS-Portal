import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, Alert, Typography, Space } from 'antd';
import { BankOutlined } from '@ant-design/icons';
import { superadminApi } from '../../api/superadminApi';

const { Title } = Typography;

export const CreateOrganizationPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await superadminApi.createOrganization({ name });
      navigate('/superadmin/organizations');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create organization');
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
            <Title level={3}>Create Organization</Title>

            {error && (
              <Alert message={error} type="error" showIcon closable />
            )}

            <form onSubmit={handleSubmit}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <label htmlFor="name" style={{
                    display: 'block',
                    marginBottom: 8,
                    fontWeight: 500
                  }}>
                    Organization Name
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter organization name"
                    prefix={<BankOutlined />}
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
                    onClick={() => navigate('/superadmin/organizations')}
                    style={{ borderRadius: 8 }}
                  >
                    Cancel
                  </Button>
                </div>
              </Space>
            </form>
          </Space>
        </Card>
      </div>
    </div>
  );
};
