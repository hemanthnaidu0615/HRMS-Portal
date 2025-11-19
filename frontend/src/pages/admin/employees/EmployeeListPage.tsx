import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Alert, Typography, Space, Skeleton, Tag, Input, Select, Modal, message, Row, Col, Statistic, Dropdown, Menu, Avatar, Descriptions, Segmented } from 'antd';
import { EyeOutlined, EditOutlined, HistoryOutlined, UserOutlined, PlusOutlined, SearchOutlined, DownloadOutlined, UploadOutlined, FileTextOutlined, MoreOutlined, AppstoreOutlined, UnorderedListOutlined, TeamOutlined, ClockCircleOutlined, UserAddOutlined, TrophyOutlined } from '@ant-design/icons';
import { getEmployees, EmployeeSummaryResponse } from '../../../api/employeeManagementApi';
import { createDocumentRequest } from '../../../api/documentRequestsApi';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const EmployeeListPage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string | undefined>(undefined);
  const [selectedPosition, setSelectedPosition] = useState<string | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [documentRequestMessage, setDocumentRequestMessage] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [singleEmployeeId, setSingleEmployeeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
  const [quickViewVisible, setQuickViewVisible] = useState(false);
  const [quickViewEmployee, setQuickViewEmployee] = useState<EmployeeSummaryResponse | null>(null);
  const [pageSize, setPageSize] = useState(10);

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

  const applyFilters = (
    searchValue?: string,
    department?: string,
    position?: string,
    status?: string
  ) => {
    let filtered = [...employees];

    // Apply search filter
    if (searchValue) {
      const lowercasedValue = searchValue.toLowerCase();
      filtered = filtered.filter(emp =>
        emp.email.toLowerCase().includes(lowercasedValue) ||
        emp.firstName?.toLowerCase().includes(lowercasedValue) ||
        emp.lastName?.toLowerCase().includes(lowercasedValue) ||
        emp.departmentName?.toLowerCase().includes(lowercasedValue) ||
        emp.positionName?.toLowerCase().includes(lowercasedValue) ||
        emp.employmentType?.toLowerCase().includes(lowercasedValue)
      );
    }

    // Apply department filter
    if (department) {
      filtered = filtered.filter(emp => emp.departmentName === department);
    }

    // Apply position filter
    if (position) {
      filtered = filtered.filter(emp => emp.positionName === position);
    }

    // Apply status filter
    if (status === 'probation') {
      filtered = filtered.filter(emp => emp.isProbation);
    } else if (status === 'active') {
      filtered = filtered.filter(emp => !emp.isProbation);
    }

    setFilteredEmployees(filtered);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    applyFilters(value, selectedDepartment, selectedPosition, selectedStatus);
  };

  const handleDepartmentChange = (value: string | undefined) => {
    setSelectedDepartment(value);
    applyFilters(searchText, value, selectedPosition, selectedStatus);
  };

  const handlePositionChange = (value: string | undefined) => {
    setSelectedPosition(value);
    applyFilters(searchText, selectedDepartment, value, selectedStatus);
  };

  const handleStatusChange = (value: string | undefined) => {
    setSelectedStatus(value);
    applyFilters(searchText, selectedDepartment, selectedPosition, value);
  };

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedDepartment(undefined);
    setSelectedPosition(undefined);
    setSelectedStatus(undefined);
    setFilteredEmployees(employees);
  };

  const handleQuickView = (employee: EmployeeSummaryResponse) => {
    setQuickViewEmployee(employee);
    setQuickViewVisible(true);
  };

  // Calculate stats
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => !emp.isProbation).length;
  const onProbation = employees.filter(emp => emp.isProbation).length;
  const newThisMonth = employees.filter(emp => {
    if (!emp.createdAt) return false;
    const createdDate = new Date(emp.createdAt);
    const now = new Date();
    return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
  }).length;

  const openRequestModal = (employeeId?: string) => {
    if (employeeId) {
      setSingleEmployeeId(employeeId);
    } else {
      setSingleEmployeeId(null);
    }
    setDocumentRequestMessage('');
    setRequestModalVisible(true);
  };

  const handleBulkRequestDocument = async () => {
    const targetEmployees = singleEmployeeId ? [singleEmployeeId] : selectedRowKeys as string[];

    if (targetEmployees.length === 0) {
      message.error('Please select at least one employee');
      return;
    }

    if (!documentRequestMessage.trim()) {
      message.error('Please enter a message for the document request');
      return;
    }

    try {
      setRequestLoading(true);

      // Send request to each selected employee
      await Promise.all(
        targetEmployees.map(employeeId =>
          createDocumentRequest(employeeId, documentRequestMessage.trim())
        )
      );

      message.success(`Document request sent to ${targetEmployees.length} employee(s)`);
      setRequestModalVisible(false);
      setDocumentRequestMessage('');
      setSelectedRowKeys([]);
      setSingleEmployeeId(null);
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to send document requests');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleExportToCSV = () => {
    // Prepare CSV headers
    const headers = [
      'Employee ID',
      'First Name',
      'Last Name',
      'Email',
      'Department',
      'Position',
      'Employment Type',
      'Status',
      'Probation End Date',
      'Contract End Date',
    ];

    // Prepare CSV rows
    const rows = filteredEmployees.map(emp => [
      emp.employeeId,
      emp.firstName || '',
      emp.lastName || '',
      emp.email,
      emp.departmentName || '',
      emp.positionName || '',
      emp.employmentType || '',
      emp.isProbation ? 'Probation' : 'Active',
      emp.probationEndDate || '',
      emp.contractEndDate || '',
    ]);

    // Convert to CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row.map(cell => {
          // Escape cells containing commas, quotes, or newlines
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      ),
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Extract unique departments and positions for filters
  const uniqueDepartments = Array.from(
    new Set(employees.filter(emp => emp.departmentName).map(emp => emp.departmentName))
  ).sort();

  const uniquePositions = Array.from(
    new Set(employees.filter(emp => emp.positionName).map(emp => emp.positionName))
  ).sort();

  const employmentTypeColors: Record<string, string> = {
    internal: 'green',
    client: 'blue',
    contract: 'orange',
    bench: 'red'
  };

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'email',
      key: 'email',
      sorter: (a: EmployeeSummaryResponse, b: EmployeeSummaryResponse) => {
        const aName = `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.email;
        const bName = `${b.firstName || ''} ${b.lastName || ''}`.trim() || b.email;
        return aName.localeCompare(bName);
      },
      render: (text: string, record: EmployeeSummaryResponse) => {
        const fullName = `${record.firstName || ''} ${record.lastName || ''}`.trim();
        const displayName = fullName || text;
        const initials = fullName
          ? `${record.firstName?.[0] || ''}${record.lastName?.[0] || ''}`.toUpperCase()
          : text.substring(0, 2).toUpperCase();

        return (
          <Space>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {initials}
            </div>
            <Space direction="vertical" size={0}>
              <span style={{ fontWeight: 500 }}>{displayName}</span>
              {fullName && <span style={{ fontSize: '12px', color: '#888' }}>{text}</span>}
            </Space>
          </Space>
        );
      },
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
      width: 200,
      render: (record: EmployeeSummaryResponse) => {
        const menu = (
          <Menu>
            <Menu.Item key="view" icon={<EyeOutlined />} onClick={() => navigate(`/admin/employees/${record.employeeId}`)}>
              View Details
            </Menu.Item>
            <Menu.Item key="quick" icon={<UserOutlined />} onClick={() => handleQuickView(record)}>
              Quick View
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="assignment" icon={<EditOutlined />} onClick={() => navigate(`/admin/employees/${record.employeeId}/assignment`)}>
              Edit Assignment
            </Menu.Item>
            <Menu.Item key="history" icon={<HistoryOutlined />} onClick={() => navigate(`/admin/employees/${record.employeeId}/history`)}>
              View History
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="request" icon={<FileTextOutlined />} onClick={() => openRequestModal(record.employeeId)}>
              Request Document
            </Menu.Item>
          </Menu>
        );

        return (
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
              View
            </Button>
            <Dropdown overlay={menu} trigger={['click']}>
              <Button size="small" icon={<MoreOutlined />} style={{ borderRadius: 6 }} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
      {/* Stats Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 12 }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Total Employees</span>}
              value={totalEmployees}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#fff', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', borderRadius: 12 }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Active</span>}
              value={activeEmployees}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#fff', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', borderRadius: 12 }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>On Probation</span>}
              value={onProbation}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fff', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: 12 }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>New This Month</span>}
              value={newThisMonth}
              prefix={<UserAddOutlined />}
              valueStyle={{ color: '#fff', fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <Title level={3} style={{ margin: 0 }}>Employees</Title>
              {selectedRowKeys.length > 0 && (
                <span style={{ color: '#52c41a', fontWeight: 500, fontSize: 14 }}>
                  {selectedRowKeys.length} employee(s) selected
                </span>
              )}
            </div>
            <Space wrap>
              <Segmented
                options={[
                  { label: 'Card View', value: 'card', icon: <AppstoreOutlined /> },
                  { label: 'Table View', value: 'table', icon: <UnorderedListOutlined /> },
                ]}
                value={viewMode}
                onChange={(value) => setViewMode(value as 'card' | 'table')}
              />
              {selectedRowKeys.length > 0 && (
                <Button
                  type="primary"
                  icon={<FileTextOutlined />}
                  onClick={() => openRequestModal()}
                  style={{
                    background: '#52c41a',
                    borderColor: '#52c41a',
                    borderRadius: 6,
                    fontWeight: 600
                  }}
                >
                  Request Documents from {selectedRowKeys.length} Selected
                </Button>
              )}
              <Input
                placeholder="Search employees..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 250, borderRadius: 6 }}
                allowClear
              />
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExportToCSV}
                disabled={filteredEmployees.length === 0}
                style={{ borderRadius: 6 }}
              >
                Export CSV
              </Button>
              <Button
                icon={<UploadOutlined />}
                onClick={() => navigate('/admin/employees/import')}
                style={{ borderRadius: 6 }}
              >
                Import Employees
              </Button>
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

          {/* Advanced Filters */}
          <div style={{
            background: '#f5f5f5',
            padding: '16px',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontWeight: 500, color: '#666' }}>Filters:</span>
            <Select
              placeholder="Department"
              value={selectedDepartment}
              onChange={handleDepartmentChange}
              allowClear
              style={{ width: 180, borderRadius: 6 }}
            >
              {uniqueDepartments.map(dept => (
                <Select.Option key={dept} value={dept}>
                  {dept}
                </Select.Option>
              ))}
            </Select>
            <Select
              placeholder="Position"
              value={selectedPosition}
              onChange={handlePositionChange}
              allowClear
              style={{ width: 180, borderRadius: 6 }}
            >
              {uniquePositions.map(pos => (
                <Select.Option key={pos} value={pos}>
                  {pos}
                </Select.Option>
              ))}
            </Select>
            <Select
              placeholder="Status"
              value={selectedStatus}
              onChange={handleStatusChange}
              allowClear
              style={{ width: 150, borderRadius: 6 }}
            >
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="probation">Probation</Select.Option>
            </Select>
            {(selectedDepartment || selectedPosition || selectedStatus || searchText) && (
              <Button onClick={handleClearFilters} style={{ borderRadius: 6 }}>
                Clear All Filters
              </Button>
            )}
            <span style={{ marginLeft: 'auto', color: '#666' }}>
              Showing {filteredEmployees.length} of {employees.length} employees
            </span>
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
          ) : viewMode === 'card' ? (
            <Row gutter={[16, 16]}>
              {filteredEmployees.map((emp) => {
                const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
                const displayName = fullName || emp.email;
                const initials = fullName
                  ? `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`.toUpperCase()
                  : emp.email.substring(0, 2).toUpperCase();
                const menu = (
                  <Menu>
                    <Menu.Item key="view" icon={<EyeOutlined />} onClick={() => navigate(`/admin/employees/${emp.employeeId}`)}>
                      View Details
                    </Menu.Item>
                    <Menu.Item key="quick" icon={<UserOutlined />} onClick={() => handleQuickView(emp)}>
                      Quick View
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item key="assignment" icon={<EditOutlined />} onClick={() => navigate(`/admin/employees/${emp.employeeId}/assignment`)}>
                      Edit Assignment
                    </Menu.Item>
                    <Menu.Item key="history" icon={<HistoryOutlined />} onClick={() => navigate(`/admin/employees/${emp.employeeId}/history`)}>
                      View History
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item key="request" icon={<FileTextOutlined />} onClick={() => openRequestModal(emp.employeeId)}>
                      Request Document
                    </Menu.Item>
                  </Menu>
                );

                return (
                  <Col xs={24} sm={12} lg={8} xl={6} key={emp.employeeId}>
                    <Card
                      hoverable
                      style={{
                        borderRadius: 12,
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        border: '1px solid #f0f0f0',
                      }}
                      bodyStyle={{ padding: 16 }}
                      onClick={() => handleQuickView(emp)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <Avatar
                          size={48}
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            fontWeight: 600,
                          }}
                        >
                          {initials}
                        </Avatar>
                        <Dropdown overlay={menu} trigger={['click']}>
                          <Button
                            size="small"
                            icon={<MoreOutlined />}
                            onClick={(e) => e.stopPropagation()}
                            style={{ borderRadius: 6 }}
                          />
                        </Dropdown>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
                          {displayName}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                          {emp.email}
                        </Text>
                      </div>
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        {emp.departmentName && (
                          <Tag color="blue" style={{ borderRadius: 6 }}>
                            {emp.departmentName}
                          </Tag>
                        )}
                        {emp.positionName && (
                          <Tag color="green" style={{ borderRadius: 6 }}>
                            {emp.positionName}
                          </Tag>
                        )}
                        {emp.employmentType && (
                          <Tag color={employmentTypeColors[emp.employmentType] || 'default'} style={{ borderRadius: 6 }}>
                            {emp.employmentType}
                          </Tag>
                        )}
                        {emp.isProbation && (
                          <Tag color="orange" style={{ borderRadius: 6 }}>
                            Probation
                          </Tag>
                        )}
                      </Space>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          ) : (
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={filteredEmployees}
              rowKey="employeeId"
              locale={{
                emptyText: searchText
                  ? `No employees match "${searchText}"`
                  : 'No employees found. Click "Add Employee" to create one.'
              }}
              pagination={{
                pageSize: pageSize,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} employees`,
                onShowSizeChange: (_, size) => setPageSize(size),
              }}
            />
          )}
        </Space>
      </Card>

      {/* Request Document Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ color: '#52c41a' }} />
            <span>
              {singleEmployeeId
                ? 'Request Document from Employee'
                : `Request Documents from ${selectedRowKeys.length} Employees`}
            </span>
          </Space>
        }
        open={requestModalVisible}
        onOk={handleBulkRequestDocument}
        onCancel={() => {
          setRequestModalVisible(false);
          setDocumentRequestMessage('');
          setSingleEmployeeId(null);
        }}
        confirmLoading={requestLoading}
        okText="Send Request"
        okButtonProps={{
          style: {
            background: '#52c41a',
            borderColor: '#52c41a'
          }
        }}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Alert
            message="What document do you need?"
            description={
              singleEmployeeId
                ? 'The employee will receive this request and can upload the requested document.'
                : `All ${selectedRowKeys.length} selected employees will receive this request.`
            }
            type="info"
            showIcon
          />
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Request Message *
            </label>
            <TextArea
              placeholder="e.g., Please upload your ID proof, passport copy, or latest address proof"
              value={documentRequestMessage}
              onChange={(e) => setDocumentRequestMessage(e.target.value)}
              rows={4}
              style={{ borderRadius: 8 }}
              maxLength={500}
              showCount
            />
          </div>
        </Space>
      </Modal>

      {/* Quick View Modal */}
      <Modal
        title={
          <Space>
            <UserOutlined style={{ color: '#0a0d54' }} />
            <span>Employee Quick View</span>
          </Space>
        }
        open={quickViewVisible}
        onCancel={() => {
          setQuickViewVisible(false);
          setQuickViewEmployee(null);
        }}
        footer={[
          <Button key="close" onClick={() => setQuickViewVisible(false)} style={{ borderRadius: 6 }}>
            Close
          </Button>,
          <Button
            key="view"
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => {
              if (quickViewEmployee) {
                navigate(`/admin/employees/${quickViewEmployee.employeeId}`);
              }
            }}
            style={{
              background: '#0a0d54',
              borderColor: '#0a0d54',
              borderRadius: 6,
            }}
          >
            View Full Details
          </Button>,
        ]}
        width={700}
      >
        {quickViewEmployee && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
              <Avatar
                size={64}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontWeight: 600,
                }}
              >
                {`${quickViewEmployee.firstName?.[0] || ''}${quickViewEmployee.lastName?.[0] || ''}`.toUpperCase() ||
                  quickViewEmployee.email.substring(0, 2).toUpperCase()}
              </Avatar>
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontSize: 18, display: 'block', marginBottom: 4 }}>
                  {`${quickViewEmployee.firstName || ''} ${quickViewEmployee.lastName || ''}`.trim() || quickViewEmployee.email}
                </Text>
                <Text type="secondary">{quickViewEmployee.email}</Text>
              </div>
            </div>

            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Employee Code" span={2}>
                {quickViewEmployee.employeeCode ? (
                  <Tag color="blue" style={{ borderRadius: 6 }}>
                    {quickViewEmployee.employeeCode}
                  </Tag>
                ) : (
                  '—'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Department">
                {quickViewEmployee.departmentName ? (
                  <Tag color="blue" style={{ borderRadius: 6 }}>
                    {quickViewEmployee.departmentName}
                  </Tag>
                ) : (
                  '—'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Position">
                {quickViewEmployee.positionName ? (
                  <Tag color="green" style={{ borderRadius: 6 }}>
                    {quickViewEmployee.positionName}
                  </Tag>
                ) : (
                  '—'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Employment Type">
                {quickViewEmployee.employmentType ? (
                  <Tag color={employmentTypeColors[quickViewEmployee.employmentType] || 'default'} style={{ borderRadius: 6 }}>
                    {quickViewEmployee.employmentType}
                  </Tag>
                ) : (
                  '—'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {quickViewEmployee.isProbation ? (
                  <Tag color="orange" style={{ borderRadius: 6 }}>
                    Probation
                    {quickViewEmployee.probationEndDate &&
                      ` (ends ${new Date(quickViewEmployee.probationEndDate).toLocaleDateString()})`}
                  </Tag>
                ) : (
                  <Tag color="green" style={{ borderRadius: 6 }}>
                    Active
                  </Tag>
                )}
              </Descriptions.Item>
              {quickViewEmployee.contractEndDate && (
                <Descriptions.Item label="Contract End" span={2}>
                  {new Date(quickViewEmployee.contractEndDate).toLocaleDateString()}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Space wrap>
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  navigate(`/admin/employees/${quickViewEmployee.employeeId}/assignment`);
                }}
                style={{ borderRadius: 6 }}
              >
                Edit Assignment
              </Button>
              <Button
                icon={<HistoryOutlined />}
                onClick={() => {
                  navigate(`/admin/employees/${quickViewEmployee.employeeId}/history`);
                }}
                style={{ borderRadius: 6 }}
              >
                View History
              </Button>
              <Button
                icon={<FileTextOutlined />}
                onClick={() => {
                  setQuickViewVisible(false);
                  openRequestModal(quickViewEmployee.employeeId);
                }}
                style={{ borderRadius: 6 }}
              >
                Request Document
              </Button>
            </Space>
          </Space>
        )}
      </Modal>
    </div>
  );
};
