import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Alert, Row, Col, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { orgadminApi, Employee } from '../../api/orgadminApi';

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

  const columns: ColumnsType<Employee> = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
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
              <h1 className="text-3xl font-bold" style={{ color: '#0a0d54', margin: 0 }}>
                Employees
              </h1>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => navigate('/orgadmin/create-employee')}
                style={{ background: '#0a0d54', borderColor: '#0a0d54' }}
              >
                Create Employee
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
              dataSource={employees}
              rowKey="email"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} employees`,
              }}
              locale={{ emptyText: 'No employees found' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
