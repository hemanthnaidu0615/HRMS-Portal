import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, Typography, Space, message } from 'antd';
import { CheckOutlined, CloseOutlined, ApartmentOutlined } from '@ant-design/icons';
import { createDepartment } from '../../../api/structureApi';

const { Title } = Typography;

export const CreateDepartmentPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      message.error('Name is required');
      return;
    }

    try {
      setLoading(true);
      await createDepartment(name);
      message.success('Department created');
      setTimeout(() => navigate('/admin/structure/departments'), 1000);
    } catch (err: any) {
      message.error('Failed to create department');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={3}>Create Department</Title>

          <form onSubmit={handleSubmit}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <label htmlFor="name" style={{
                  display: 'block',
                  marginBottom: 8,
                  fontWeight: 500
                }}>
                  Department Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter department name"
                  prefix={<ApartmentOutlined />}
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<CheckOutlined />}
                  loading={loading}
                  style={{
                    background: '#0a0d54',
                    borderColor: '#0a0d54',
                    borderRadius: 8
                  }}
                >
                  Save
                </Button>
                <Button
                  icon={<CloseOutlined />}
                  onClick={() => navigate('/admin/structure/departments')}
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
  );
};
