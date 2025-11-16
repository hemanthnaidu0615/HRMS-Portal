import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Alert, Typography, Space, Skeleton } from 'antd';
import { PlusOutlined, ApartmentOutlined } from '@ant-design/icons';
import { getDepartments, DepartmentResponse } from '../../../api/structureApi';

const { Title } = Typography;

export const DepartmentsPage = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await getDepartments();
      setDepartments(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: DepartmentResponse, b: DepartmentResponse) => a.name.localeCompare(b.name),
      render: (text: string) => (
        <Space>
          <ApartmentOutlined />
          {text}
        </Space>
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
            <Title level={3} style={{ margin: 0 }}>Departments</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/structure/departments/new')}
              style={{
                background: '#0a0d54',
                borderColor: '#0a0d54',
                borderRadius: 8
              }}
            >
              Create Department
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
              dataSource={departments}
              rowKey="id"
              locale={{ emptyText: 'No departments found' }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} departments`,
              }}
            />
          )}
        </Space>
      </Card>
    </div>
  );
};
