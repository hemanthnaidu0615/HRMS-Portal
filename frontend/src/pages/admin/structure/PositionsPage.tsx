import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Alert, Row, Col, Button, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getPositions, PositionResponse } from '../../../api/structureApi';

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

  const columns: ColumnsType<PositionResponse> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Seniority Level',
      dataIndex: 'seniorityLevel',
      key: 'seniorityLevel',
      sorter: (a, b) => a.seniorityLevel - b.seniorityLevel,
      render: (level: number) => <Tag color="#1890ff">Level {level}</Tag>,
    },
  ];

  return (
    <div className="p-6" style={{ background: '#dde4eb', minHeight: '100vh' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            className="shadow-md"
            style={{
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#0a0d54', margin: 0 }}>
                Positions
              </h2>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => navigate('/admin/structure/positions/new')}
                style={{ background: '#0a0d54', borderColor: '#0a0d54' }}
              >
                Create Position
              </Button>
            </div>

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

            <Table
              columns={columns}
              dataSource={positions}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} positions`,
              }}
              locale={{ emptyText: 'No positions found' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
