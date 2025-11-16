import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Alert, Row, Col, Button, Tag, Space } from 'antd';
import { EyeOutlined, EditOutlined, HistoryOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getEmployees, EmployeeSummaryResponse } from '../../../api/employeeManagementApi';

export const EmployeeListPage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await getEmployees();
      setEmployees(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const employmentTypeColors: Record<string, string> = {
    internal: '#52c41a',
    client: '#1890ff',
    contract: '#faad14',
    bench: '#f5222d'
  };

  const columns: ColumnsType<EmployeeSummaryResponse> = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
      fixed: 'left',
    },
    {
      title: 'Department',
      dataIndex: 'departmentName',
      key: 'departmentName',
      render: (departmentName) => departmentName ? <Tag color="#1890ff">{departmentName}</Tag> : <span>—</span>,
    },
    {
      title: 'Position',
      dataIndex: 'positionName',
      key: 'positionName',
      render: (positionName) => positionName ? <Tag color="#52c41a">{positionName}</Tag> : <span>—</span>,
    },
    {
      title: 'Employment Type',
      dataIndex: 'employmentType',
      key: 'employmentType',
      render: (employmentType) => {
        if (!employmentType) return <span>—</span>;
        return <Tag color={employmentTypeColors[employmentType] || '#d9d9d9'}>{employmentType}</Tag>;
      },
    },
    {
      title: 'Contract End',
      dataIndex: 'contractEndDate',
      key: 'contractEndDate',
      render: (contractEndDate) => contractEndDate || '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/employees/${record.employeeId}`)}
            style={{ background: '#0a0d54', borderColor: '#0a0d54' }}
          >
            Details
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/employees/${record.employeeId}/assignment`)}
          >
            Assignment
          </Button>
          <Button
            size="small"
            icon={<HistoryOutlined />}
            onClick={() => navigate(`/admin/employees/${record.employeeId}/history`)}
          >
            History
          </Button>
        </Space>
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
              <h2 className="text-2xl font-bold" style={{ color: '#0a0d54', margin: 0 }}>
                Employees
              </h2>
              <Button
                type="primary"
                onClick={() => navigate('/orgadmin/create-employee')}
                style={{ background: '#0a0d54', borderColor: '#0a0d54' }}
              >
                Add Employee
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
              rowKey="employeeId"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} employees`,
              }}
              scroll={{ x: 1200 }}
              locale={{ emptyText: 'No employees found' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
