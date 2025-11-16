import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Alert, Row, Col, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getDepartments, DepartmentResponse } from '../../../api/structureApi';

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

  const columns: ColumnsType<DepartmentResponse> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
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
                Departments
              </h2>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => navigate('/admin/structure/departments/new')}
                style={{ background: '#0a0d54', borderColor: '#0a0d54' }}
              >
                Create Department
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
              dataSource={departments}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} departments`,
              }}
              locale={{ emptyText: 'No departments found' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
