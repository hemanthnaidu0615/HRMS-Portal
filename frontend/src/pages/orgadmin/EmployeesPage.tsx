import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Alert, Typography, Space } from 'antd';
import { PlusOutlined, UserOutlined } from '@ant-design/icons';
import { orgadminApi, Employee } from '../../api/orgadminApi';

const { Title } = Typography;

export const EmployeesPage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await orgadminApi.getEmployees();
      setEmployees(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a: Employee, b: Employee) => a.email.localeCompare(b.email),
      render: (text: string) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0 }}>Employees</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/orgadmin/create-employee')}
              style={{
                background: '#0a0d54',
                borderColor: '#0a0d54',
                borderRadius: 8
              }}
            >
              Create Employee
            </Button>
          </div>

          {error && (
            <Alert message={error} type="error" showIcon closable />
          )}

          <Table
            columns={columns}
            dataSource={employees}
            loading={loading}
            rowKey="id"
            locale={{ emptyText: 'No employees found' }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} employees`,
            }}
          />
        </Space>
      </Card>
    </div>
  );
};
