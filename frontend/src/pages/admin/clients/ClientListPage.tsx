import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Alert,
  Typography,
  Space,
  Skeleton,
  Tag,
  Input,
  Select,
  Modal,
  message,
  Row,
  Col,
  Dropdown,
  Avatar,
  Tabs
} from 'antd';
import type { MenuProps } from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  UserOutlined,
  TeamOutlined,
  ProjectOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
  TableOutlined
} from '@ant-design/icons';
import { getAllClients, deleteClient, ClientListItem } from '../../../api/clientApi';

const { Title, Text } = Typography;

interface ClientStats {
  total: number;
  active: number;
  projects: number;
  revenue: number;
}

export const ClientListPage = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [selectedIndustry, setSelectedIndustry] = useState<string | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllClients();
      setClients(data);
      setFilteredClients(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load clients. Please try again.');
      console.error('Error loading clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (
    searchValue?: string,
    type?: string,
    industry?: string,
    status?: string
  ) => {
    let filtered = [...clients];

    // Apply search filter
    if (searchValue) {
      const lowercasedValue = searchValue.toLowerCase();
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(lowercasedValue) ||
        client.clientCode.toLowerCase().includes(lowercasedValue) ||
        client.primaryContactName?.toLowerCase().includes(lowercasedValue) ||
        client.primaryContactEmail?.toLowerCase().includes(lowercasedValue)
      );
    }

    // Apply type filter
    if (type) {
      filtered = filtered.filter(client => client.clientType === type);
    }

    // Apply industry filter
    if (industry) {
      filtered = filtered.filter(client => client.industry === industry);
    }

    // Apply status filter
    if (status === 'active') {
      filtered = filtered.filter(client => client.isActive);
    } else if (status === 'inactive') {
      filtered = filtered.filter(client => !client.isActive);
    }

    setFilteredClients(filtered);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    applyFilters(value, selectedType, selectedIndustry, selectedStatus);
  };

  const handleTypeChange = (value: string | undefined) => {
    setSelectedType(value);
    applyFilters(searchText, value, selectedIndustry, selectedStatus);
  };

  const handleIndustryChange = (value: string | undefined) => {
    setSelectedIndustry(value);
    applyFilters(searchText, selectedType, value, selectedStatus);
  };

  const handleStatusChange = (value: string | undefined) => {
    setSelectedStatus(value);
    applyFilters(searchText, selectedType, selectedIndustry, value);
  };

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedType(undefined);
    setSelectedIndustry(undefined);
    setSelectedStatus(undefined);
    setFilteredClients(clients);
  };

  const handleDelete = async (id: string, name: string) => {
    Modal.confirm({
      title: 'Delete Client',
      content: `Are you sure you want to delete client "${name}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setDeleteLoading(true);
          await deleteClient(id);
          message.success(`Client "${name}" deleted successfully`);
          await loadClients();
        } catch (err: any) {
          message.error(err.response?.data?.message || 'Failed to delete client');
        } finally {
          setDeleteLoading(false);
        }
      },
    });
  };

  const getActionMenu = (client: ClientListItem): MenuProps => ({
    items: [
      {
        key: 'view',
        label: 'View Details',
        icon: <EyeOutlined />,
        onClick: () => navigate(`/admin/clients/${client.id}`),
      },
      {
        key: 'edit',
        label: 'Edit Client',
        icon: <EditOutlined />,
        onClick: () => navigate(`/admin/clients/${client.id}/edit`),
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        label: 'Delete',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDelete(client.id, client.name),
      },
    ],
  });

  const calculateStats = (): ClientStats => {
    const activeClients = clients.filter(c => c.isActive);
    const totalProjects = clients.reduce((sum, c) => sum + c.totalActiveProjects, 0);

    return {
      total: clients.length,
      active: activeClients.length,
      projects: totalProjects,
      revenue: 0,
    };
  };

  const stats = calculateStats();

  // Extract unique client types and industries for filters
  const uniqueTypes = Array.from(
    new Set(clients.filter(c => c.clientType).map(c => c.clientType))
  ).sort();

  const uniqueIndustries = Array.from(
    new Set(clients.filter(c => c.industry).map(c => c.industry))
  ).sort();

  const clientTypeColors: Record<string, string> = {
    corporate: 'blue',
    government: 'purple',
    nonprofit: 'green',
  };

  const columns = [
    {
      title: 'Client Code',
      dataIndex: 'clientCode',
      key: 'clientCode',
      width: 140,
      sorter: (a: ClientListItem, b: ClientListItem) => a.clientCode.localeCompare(b.clientCode),
      render: (code: string) => (
        <Tag color="cyan" style={{ borderRadius: 6, fontFamily: 'monospace', fontWeight: 600 }}>
          {code}
        </Tag>
      ),
    },
    {
      title: 'Client Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: ClientListItem, b: ClientListItem) => a.name.localeCompare(b.name),
      render: (name: string, record: ClientListItem) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{name}</span>
          {record.isStrategic && (
            <Tag color="gold" style={{ borderRadius: 4, fontSize: 11 }}>
              Strategic
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'clientType',
      key: 'clientType',
      width: 130,
      render: (type: string) =>
        type ? (
          <Tag color={clientTypeColors[type.toLowerCase()] || 'default'} style={{ borderRadius: 6 }}>
            {type}
          </Tag>
        ) : (
          <span>—</span>
        ),
    },
    {
      title: 'Industry',
      dataIndex: 'industry',
      key: 'industry',
      width: 140,
      render: (industry: string) =>
        industry ? (
          <span style={{ fontSize: 13 }}>{industry}</span>
        ) : (
          <span>—</span>
        ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (record: ClientListItem) => (
        <Space direction="vertical" size={0}>
          {record.primaryContactName && (
            <span style={{ fontWeight: 500 }}>{record.primaryContactName}</span>
          )}
          {record.primaryContactEmail && (
            <span style={{ fontSize: 12, color: '#666' }}>{record.primaryContactEmail}</span>
          )}
          {record.primaryContactPhone && (
            <span style={{ fontSize: 12, color: '#666' }}>{record.primaryContactPhone}</span>
          )}
          {!record.primaryContactName && !record.primaryContactEmail && !record.primaryContactPhone && (
            <span>—</span>
          )}
        </Space>
      ),
    },
    {
      title: 'Projects/Resources',
      key: 'metrics',
      width: 140,
      render: (record: ClientListItem) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>
            Projects: {record.totalActiveProjects}
          </span>
          <span style={{ fontSize: 12, color: '#666' }}>
            Resources: {record.totalActiveResources}
          </span>
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (record: ClientListItem) => (
        <Tag color={record.isActive ? 'green' : 'red'} style={{ borderRadius: 6 }}>
          {record.isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (record: ClientListItem) => (
        <Dropdown menu={getActionMenu(record)} trigger={['click']}>
          <Button
            type="text"
            icon={<MoreOutlined />}
            style={{ padding: 4 }}
          />
        </Dropdown>
      ),
    },
  ];

  const renderStatsCards = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 12,
            border: 'none',
          }}
        >
          <Space direction="vertical" size={4}>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Total Clients</Text>
            <Title level={2} style={{ color: '#fff', margin: 0 }}>{stats.total}</Title>
            <UserOutlined style={{ fontSize: 24, color: 'rgba(255,255,255,0.8)' }} />
          </Space>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card
          style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: 12,
            border: 'none',
          }}
        >
          <Space direction="vertical" size={4}>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Active</Text>
            <Title level={2} style={{ color: '#fff', margin: 0 }}>{stats.active}</Title>
            <CheckCircleOutlined style={{ fontSize: 24, color: 'rgba(255,255,255,0.8)' }} />
          </Space>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card
          style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            borderRadius: 12,
            border: 'none',
          }}
        >
          <Space direction="vertical" size={4}>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Active Projects</Text>
            <Title level={2} style={{ color: '#fff', margin: 0 }}>{stats.projects}</Title>
            <ProjectOutlined style={{ fontSize: 24, color: 'rgba(255,255,255,0.8)' }} />
          </Space>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card
          style={{
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            borderRadius: 12,
            border: 'none',
          }}
        >
          <Space direction="vertical" size={4}>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Revenue (UI)</Text>
            <Title level={2} style={{ color: '#fff', margin: 0 }}>$0</Title>
            <DollarOutlined style={{ fontSize: 24, color: 'rgba(255,255,255,0.8)' }} />
          </Space>
        </Card>
      </Col>
    </Row>
  );

  const renderCardsView = () => (
    <Row gutter={[16, 16]}>
      {filteredClients.map(client => (
        <Col xs={24} sm={12} lg={8} xl={6} key={client.id}>
          <Card
            hoverable
            style={{
              borderRadius: 12,
              border: '1px solid #f0f0f0',
              transition: 'all 0.3s ease',
            }}
            styles={{
              body: { padding: 20 }
            }}
          >
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Space>
                  <Avatar
                    size={48}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    {client.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <div>
                    <Title level={5} style={{ margin: 0 }}>{client.name}</Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>{client.clientCode}</Text>
                  </div>
                </Space>
                <Dropdown menu={getActionMenu(client)} trigger={['click']}>
                  <Button
                    type="text"
                    icon={<MoreOutlined />}
                    style={{ padding: 4 }}
                  />
                </Dropdown>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {client.clientType && (
                  <Tag color={clientTypeColors[client.clientType.toLowerCase()] || 'default'} style={{ borderRadius: 6 }}>
                    {client.clientType}
                  </Tag>
                )}
                {client.industry && (
                  <Tag style={{ borderRadius: 6 }}>{client.industry}</Tag>
                )}
              </div>

              <div>
                <Space size={16}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Projects:</Text>
                    <br />
                    <Text strong>{client.totalActiveProjects}</Text>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Resources:</Text>
                    <br />
                    <Text strong>{client.totalActiveResources}</Text>
                  </div>
                </Space>
              </div>

              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Contact:</Text>
                <br />
                {client.primaryContactName ? (
                  <>
                    <Text strong style={{ fontSize: 13 }}>{client.primaryContactName}</Text>
                    <br />
                    {client.primaryContactEmail && (
                      <Text type="secondary" style={{ fontSize: 12 }}>{client.primaryContactEmail}</Text>
                    )}
                  </>
                ) : (
                  <Text type="secondary">Not set</Text>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Tag
                  color={client.isActive ? 'green' : 'red'}
                  icon={client.isActive ? <CheckCircleOutlined /> : undefined}
                  style={{ borderRadius: 6 }}
                >
                  {client.isActive ? 'Active' : 'Inactive'}
                </Tag>
                {client.isStrategic && (
                  <Tag color="gold" style={{ borderRadius: 6 }}>
                    Strategic
                  </Tag>
                )}
              </div>
            </Space>
          </Card>
        </Col>
      ))}
    </Row>
  );

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <UserOutlined /> Clients
            </Title>
            <Text type="secondary">Manage client relationships and engagements</Text>
          </div>
          <Space wrap>
            <Input
              placeholder="Search clients..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 250, borderRadius: 8 }}
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/clients/create')}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: 8,
              }}
            >
              Create Client
            </Button>
          </Space>
        </div>

        {/* Stats Cards */}
        {renderStatsCards()}

        {/* Filters */}
        <Card style={{ borderRadius: 12 }}>
          <Space wrap size="middle" style={{ width: '100%' }}>
            <Text strong>Filters:</Text>
            <Select
              placeholder="Client Type"
              value={selectedType}
              onChange={handleTypeChange}
              allowClear
              style={{ width: 180 }}
            >
              {uniqueTypes.map(type => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
            <Select
              placeholder="Industry"
              value={selectedIndustry}
              onChange={handleIndustryChange}
              allowClear
              style={{ width: 180 }}
            >
              {uniqueIndustries.map(industry => (
                <Select.Option key={industry} value={industry}>
                  {industry}
                </Select.Option>
              ))}
            </Select>
            <Select
              placeholder="Status"
              value={selectedStatus}
              onChange={handleStatusChange}
              allowClear
              style={{ width: 150 }}
            >
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
            {(selectedType || selectedIndustry || selectedStatus || searchText) && (
              <Button onClick={handleClearFilters}>Clear All Filters</Button>
            )}
            <Text type="secondary" style={{ marginLeft: 'auto' }}>
              Showing {filteredClients.length} of {clients.length} clients
            </Text>
          </Space>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert
            message="Error Loading Clients"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError('')}
          />
        )}

        {/* View Mode Toggle */}
        <Card style={{ borderRadius: 12 }}>
          <Tabs
            activeKey={viewMode}
            onChange={(key) => setViewMode(key as 'cards' | 'table')}
            items={[
              {
                key: 'cards',
                label: (
                  <span>
                    <AppstoreOutlined /> Card View
                  </span>
                ),
              },
              {
                key: 'table',
                label: (
                  <span>
                    <TableOutlined /> Table View
                  </span>
                ),
              },
            ]}
          />
        </Card>

        {/* Content */}
        {loading ? (
          <Row gutter={[16, 16]}>
            {[1, 2, 3, 4].map(i => (
              <Col xs={24} sm={12} lg={8} xl={6} key={i}>
                <Card style={{ borderRadius: 12 }}>
                  <Skeleton active paragraph={{ rows: 4 }} />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          viewMode === 'cards' ? renderCardsView() : (
            <Card style={{ borderRadius: 12 }}>
              <Table
                columns={columns}
                dataSource={filteredClients}
                rowKey="id"
                locale={{
                  emptyText: searchText
                    ? `No clients match "${searchText}"`
                    : 'No clients found. Click "Create Client" to add one.'
                }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} clients`,
                }}
              />
            </Card>
          )
        )}
      </Space>
    </div>
  );
};
