import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Alert, Typography, Space, Skeleton, Tag, Input } from 'antd';
import { EyeOutlined, EditOutlined, HistoryOutlined, UserOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { getEmployees, EmployeeSummaryResponse } from '../../../api/employeeManagementApi';

const { Title } = Typography;

export const EmployeeListPage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getEmployees();
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load employees. Please try again.');
      console.error('Error loading employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    const lowercasedValue = value.toLowerCase();
    const filtered = employees.filter(emp =>
      emp.email.toLowerCase().includes(lowercasedValue) ||
      emp.departmentName?.toLowerCase().includes(lowercasedValue) ||
      emp.positionName?.toLowerCase().includes(lowercasedValue) ||
      emp.employmentType?.toLowerCase().includes(lowercasedValue)
    );
    setFilteredEmployees(filtered);
  };

  const employmentTypeColors: Record<string, string> = {
    internal: 'green',
    client: 'blue',
    contract: 'orange',
    bench: 'red'
  };

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a: EmployeeSummaryResponse, b: EmployeeSummaryResponse) => a.email.localeCompare(b.email),
      render: (text: string) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'departmentName',
      key: 'departmentName',
      render: (text: string) =>
        text ? <Tag color="blue" style={{ borderRadius: 6 }}>{text}</Tag> : <span>—</span>,
    },
    {
      title: 'Position',
      dataIndex: 'positionName',
      key: 'positionName',
      render: (text: string) =>
        text ? <Tag color="green" style={{ borderRadius: 6 }}>{text}</Tag> : <span>—</span>,
    },
    {
      title: 'Employment Type',
      dataIndex: 'employmentType',
      key: 'employmentType',
      render: (type: string) =>
        type ? (
          <Tag color={employmentTypeColors[type] || 'default'} style={{ borderRadius: 6 }}>
            {type}
          </Tag>
        ) : (
          <span>—</span>
        ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: EmployeeSummaryResponse) => (
        record.isProbation ? (
          <Tag color="orange" style={{ borderRadius: 6 }}>
            Probation
            {record.probationEndDate && ` (ends ${new Date(record.probationEndDate).toLocaleDateString()})`}
          </Tag>
        ) : (
          <Tag color="green" style={{ borderRadius: 6 }}>Active</Tag>
        )
      ),
    },
    {
      title: 'Contract End',
      dataIndex: 'contractEndDate',
      key: 'contractEndDate',
      render: (date: string) => date || '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: EmployeeSummaryResponse) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/employees/${record.employeeId}`)}
            style={{
              background: '#0a0d54',
              borderColor: '#0a0d54',
              borderRadius: 6
            }}
          >
            Details
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/employees/${record.employeeId}/assignment`)}
            style={{ borderRadius: 6 }}
          >
            Assignment
          </Button>
          <Button
            size="small"
            icon={<HistoryOutlined />}
            onClick={() => navigate(`/admin/employees/${record.employeeId}/history`)}
            style={{ borderRadius: 6 }}
          >
            History
          </Button>
        </Space>
      ),
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <Title level={3} style={{ margin: 0 }}>Employees</Title>
            <Space>
              <Input
                placeholder="Search employees..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 250, borderRadius: 6 }}
                allowClear
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/admin/employees/create')}
                style={{
                  background: '#0a0d54',
                  borderColor: '#0a0d54',
                  borderRadius: 6
                }}
              >
                Add Employee
              </Button>
            </Space>
          </div>

          {error && (
            <Alert
              message="Error Loading Employees"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
            />
          )}

          {loading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredEmployees}
              rowKey="employeeId"
              locale={{
                emptyText: searchText
                  ? `No employees match "${searchText}"`
                  : 'No employees found. Click "Add Employee" to create one.'
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} employees`,
              }}
            />
          )}
        </Space>
      </Card>
    </div>
  );
};
