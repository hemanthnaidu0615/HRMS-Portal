import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, InputNumber, Button, Typography, Space, message } from 'antd';
import { CheckOutlined, CloseOutlined, TeamOutlined, NumberOutlined } from '@ant-design/icons';
import { createPosition } from '../../../api/structureApi';

const { Title } = Typography;

export const CreatePositionPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [seniorityLevel, setSeniorityLevel] = useState<number | null>(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      message.error('Name is required');
      return;
    }

    if (!seniorityLevel || seniorityLevel < 1) {
      message.error('Valid seniority level is required');
      return;
    }

    try {
      setLoading(true);
      await createPosition(name, seniorityLevel);
      message.success('Position created');
      setTimeout(() => navigate('/admin/structure/positions'), 1000);
    } catch (err: any) {
      message.error('Failed to create position');
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
          <Title level={3}>Create Position</Title>

          <form onSubmit={handleSubmit}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <label htmlFor="name" style={{
                  display: 'block',
                  marginBottom: 8,
                  fontWeight: 500
                }}>
                  Position Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter position name"
                  prefix={<TeamOutlined />}
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </div>

              <div>
                <label htmlFor="seniorityLevel" style={{
                  display: 'block',
                  marginBottom: 8,
                  fontWeight: 500
                }}>
                  Seniority Level
                </label>
                <InputNumber
                  id="seniorityLevel"
                  value={seniorityLevel}
                  onChange={setSeniorityLevel}
                  min={1}
                  placeholder="Enter seniority level"
                  prefix={<NumberOutlined />}
                  size="large"
                  style={{ width: '100%', borderRadius: 8 }}
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
                  onClick={() => navigate('/admin/structure/positions')}
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
