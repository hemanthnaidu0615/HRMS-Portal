import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Table, Button, Alert, Typography, Space, Skeleton } from 'antd';
import { ArrowLeftOutlined, HistoryOutlined } from '@ant-design/icons';
import { getEmployeeHistory, EmployeeHistoryResponse } from '../../../api/employeeManagementApi';

const { Title } = Typography;

export const EmployeeHistoryPage = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const [history, setHistory] = useState<EmployeeHistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (employeeId) {
      loadHistory();
    }
  }, [employeeId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getEmployeeHistory(employeeId!);
      setHistory(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Field',
      dataIndex: 'changedField',
      key: 'changedField',
      sorter: (a: EmployeeHistoryResponse, b: EmployeeHistoryResponse) =>
        a.changedField.localeCompare(b.changedField),
      render: (text: string) => (
        <Space>
          <HistoryOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Old Value',
      dataIndex: 'oldValue',
      key: 'oldValue',
      render: (text: string) => text || '—',
    },
    {
      title: 'New Value',
      dataIndex: 'newValue',
      key: 'newValue',
      render: (text: string) => text || '—',
    },
    {
      title: 'Changed By',
      dataIndex: 'changedByEmail',
      key: 'changedByEmail',
    },
    {
      title: 'Changed At',
      dataIndex: 'changedAt',
      key: 'changedAt',
      sorter: (a: EmployeeHistoryResponse, b: EmployeeHistoryResponse) =>
        new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime(),
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0 }}>Employee History</Title>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/admin/employees/${employeeId}`)}
              style={{ borderRadius: 8 }}
            >
              Back
            </Button>
          </div>

          {error && (
            <Alert message={error} type="error" showIcon closable />
          )}

          {loading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : (
            <Table
              columns={columns}
              dataSource={history}
              rowKey={(record) => `${record.changedField}-${record.changedAt}`}
              locale={{ emptyText: 'No changes recorded yet. History will appear here when employee information is updated.' }}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} changes`,
              }}
            />
          )}
        </Space>
      </Card>
    </div>
  );
};
