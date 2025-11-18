import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Alert, Typography, Space, Skeleton, Tag, Input, Select, Modal, message } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { getAllClients, deleteClient, ClientListItem } from '../../../api/clientApi';

const { Title } = Typography;

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
      width: 220,
      render: (record: ClientListItem) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/clients/${record.id}`)}
            style={{
              background: '#0a0d54',
              borderColor: '#0a0d54',
              borderRadius: 6,
            }}
          >
            View
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/clients/${record.id}/edit`)}
            style={{ borderRadius: 6 }}
          >
            Edit
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id, record.name)}
            loading={deleteLoading}
            style={{ borderRadius: 6 }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', padding: 24 }}>
      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <Title level={3} style={{ margin: 0 }}>Clients</Title>
              <p style={{ color: '#666', margin: '4px 0 0 0', fontSize: 14 }}>
                Manage client relationships and engagements
              </p>
            </div>
            <Space wrap>
              <Input
                placeholder="Search clients..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 250, borderRadius: 6 }}
                allowClear
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/admin/clients/create')}
                style={{
                  background: '#0a0d54',
                  borderColor: '#0a0d54',
                  borderRadius: 6,
                }}
              >
                Create Client
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
              placeholder="Client Type"
              value={selectedType}
              onChange={handleTypeChange}
              allowClear
              style={{ width: 180, borderRadius: 6 }}
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
              style={{ width: 180, borderRadius: 6 }}
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
              style={{ width: 150, borderRadius: 6 }}
            >
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
            {(selectedType || selectedIndustry || selectedStatus || searchText) && (
              <Button onClick={handleClearFilters} style={{ borderRadius: 6 }}>
                Clear All Filters
              </Button>
            )}
            <span style={{ marginLeft: 'auto', color: '#666' }}>
              Showing {filteredClients.length} of {clients.length} clients
            </span>
          </div>

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

          {loading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : (
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
          )}
        </Space>
      </Card>
    </div>
  );
};
