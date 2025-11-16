import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Table, Alert, Row, Col, Button, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getEmployeeHistory, EmployeeHistoryResponse } from '../../../api/employeeManagementApi';

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

  const columns: ColumnsType<EmployeeHistoryResponse> = [
    {
      title: 'Field',
      dataIndex: 'changedField',
      key: 'changedField',
      sorter: (a, b) => a.changedField.localeCompare(b.changedField),
    },
    {
      title: 'Old Value',
      dataIndex: 'oldValue',
      key: 'oldValue',
      render: (value) => value || '—',
    },
    {
      title: 'New Value',
      dataIndex: 'newValue',
      key: 'newValue',
      render: (value) => value || '—',
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
      sorter: (a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime(),
      render: (date: string) => new Date(date).toLocaleString(),
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
                Employee History
              </h2>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(`/admin/employees/${employeeId}`)}
              >
                Back
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

            {loading ? (
              <div className="text-center py-12">
                <Spin size="large" />
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={history}
                rowKey={(record, index) => `${record.changedAt}-${index}`}
                pagination={{
                  pageSize: 20,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} changes`,
                }}
                locale={{ emptyText: 'No history found' }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
