import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Alert, Typography, Space, Skeleton, Tag } from 'antd';
import { PlusOutlined, TeamOutlined } from '@ant-design/icons';
import { getPositions, PositionResponse } from '../../../api/structureApi';

const { Title } = Typography;

export const PositionsPage = () => {
  const navigate = useNavigate();
  const [positions, setPositions] = useState<PositionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      setLoading(true);
      const data = await getPositions();
      setPositions(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load positions');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: PositionResponse, b: PositionResponse) => a.name.localeCompare(b.name),
      render: (text: string) => (
        <Space>
          <TeamOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Seniority Level',
      dataIndex: 'seniorityLevel',
      key: 'seniorityLevel',
      sorter: (a: PositionResponse, b: PositionResponse) => a.seniorityLevel - b.seniorityLevel,
      render: (level: number) => (
        <Tag color="blue" style={{ borderRadius: 6 }}>
          Level {level}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0 }}>Positions</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/structure/positions/new')}
              style={{
                background: '#0a0d54',
                borderColor: '#0a0d54',
                borderRadius: 8
              }}
            >
              Create Position
            </Button>
          </div>

          {error && (
            <Alert message={error} type="error" showIcon closable />
          )}

          {loading ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : (
            <Table
              columns={columns}
              dataSource={positions}
              rowKey="id"
              locale={{ emptyText: 'No positions found' }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} positions`,
              }}
            />
          )}
        </Space>
      </Card>
    </div>
  );
};
