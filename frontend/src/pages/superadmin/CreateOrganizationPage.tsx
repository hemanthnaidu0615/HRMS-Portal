import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Alert, Row, Col } from 'antd';
import { superadminApi } from '../../api/superadminApi';

export const CreateOrganizationPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (values: any) => {
    setError('');
    setLoading(true);

    try {
      await superadminApi.createOrganization({ name: values.name });
      navigate('/superadmin/organizations');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create organization');
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
              Create Organization
            </h1>

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
                label="Organization Name"
                name="name"
                rules={[{ required: true, message: 'Please input organization name!' }]}
              >
                <Input
                  placeholder="Enter organization name"
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
          </Card>
        </Col>
      </Row>
    </div>
  );
};
