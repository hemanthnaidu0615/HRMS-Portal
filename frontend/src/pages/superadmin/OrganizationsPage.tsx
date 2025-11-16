import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Alert, Row, Col, Card } from 'antd';
import { PlusOutlined, UserAddOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { superadminApi, Organization } from '../../api/superadminApi';

export const OrganizationsPage = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const data = await superadminApi.getOrganizations();
      setOrganizations(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Organization> = [
    {
      title: 'Organization Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => navigate(`/superadmin/orgadmin/${record.id}`)}
          style={{ background: '#0a0d54', borderColor: '#0a0d54' }}
        >
          Add Org Admin
        </Button>
      ),
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
                Organizations
              </h1>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => navigate('/superadmin/create-organization')}
                style={{ background: '#0a0d54', borderColor: '#0a0d54' }}
              >
                Create Organization
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
              dataSource={organizations}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} organizations`,
              }}
              locale={{ emptyText: 'No organizations found' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
