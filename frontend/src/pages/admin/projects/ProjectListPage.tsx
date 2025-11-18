import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Alert, Typography, Space, Skeleton, Tag, Input, Select, Modal, message } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, DollarOutlined } from '@ant-design/icons';
import { getAllProjects, deleteProject, ProjectListItem } from '../../../api/projectApi';
import { getAllClients, ClientListItem } from '../../../api/clientApi';

const { Title } = Typography;

export const ProjectListPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectListItem[]>([]);
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [projectsData, clientsData] = await Promise.all([
        getAllProjects(),
        getAllClients()
      ]);
      setProjects(projectsData);
      setFilteredProjects(projectsData);
      setClients(clientsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load projects. Please try again.');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (
    searchValue?: string,
    client?: string,
    status?: string,
    type?: string
  ) => {
    let filtered = [...projects];

    // Apply search filter
    if (searchValue) {
      const lowercasedValue = searchValue.toLowerCase();
      filtered = filtered.filter(project =>
        project.projectName.toLowerCase().includes(lowercasedValue) ||
        project.projectCode.toLowerCase().includes(lowercasedValue) ||
        project.clientName.toLowerCase().includes(lowercasedValue) ||
        project.projectManagerName?.toLowerCase().includes(lowercasedValue)
      );
    }

    // Apply client filter
    if (client) {
      filtered = filtered.filter(project => project.clientId === client);
    }

    // Apply status filter
    if (status) {
      filtered = filtered.filter(project => project.projectStatus === status);
    }

    // Apply type filter
    if (type) {
      filtered = filtered.filter(project => project.projectType === type);
    }

    setFilteredProjects(filtered);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    applyFilters(value, selectedClient, selectedStatus, selectedType);
  };

  const handleClientChange = (value: string | undefined) => {
    setSelectedClient(value);
    applyFilters(searchText, value, selectedStatus, selectedType);
  };

  const handleStatusChange = (value: string | undefined) => {
    setSelectedStatus(value);
    applyFilters(searchText, selectedClient, value, selectedType);
  };

  const handleTypeChange = (value: string | undefined) => {
    setSelectedType(value);
    applyFilters(searchText, selectedClient, selectedStatus, value);
  };

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedClient(undefined);
    setSelectedStatus(undefined);
    setSelectedType(undefined);
    setFilteredProjects(projects);
  };

  const handleDelete = async (id: string, name: string) => {
    Modal.confirm({
      title: 'Delete Project',
      content: `Are you sure you want to delete project "${name}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setDeleteLoading(true);
          await deleteProject(id);
          message.success(`Project "${name}" deleted successfully`);
          await loadData();
        } catch (err: any) {
          message.error(err.response?.data?.message || 'Failed to delete project');
        } finally {
          setDeleteLoading(false);
        }
      },
    });
  };

  // Extract unique project types and statuses for filters
  const uniqueTypes = Array.from(
    new Set(projects.filter(p => p.projectType).map(p => p.projectType))
  ).sort();

  const uniqueStatuses = Array.from(
    new Set(projects.filter(p => p.projectStatus).map(p => p.projectStatus))
  ).sort();

  const projectStatusColors: Record<string, string> = {
    active: 'green',
    completed: 'blue',
    'on-hold': 'orange',
    cancelled: 'red',
    planning: 'purple',
  };

  const projectTypeColors: Record<string, string> = {
    consulting: 'purple',
    development: 'blue',
    maintenance: 'orange',
    support: 'green',
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    if (!startDate && !endDate) return '—';

    const formatDate = (date: string) => {
      if (!date) return '?';
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      });
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const columns = [
    {
      title: 'Project Code',
      dataIndex: 'projectCode',
      key: 'projectCode',
      width: 140,
      sorter: (a: ProjectListItem, b: ProjectListItem) => a.projectCode.localeCompare(b.projectCode),
      render: (code: string) => (
        <Tag color="blue" style={{ borderRadius: 6, fontFamily: 'monospace', fontWeight: 600 }}>
          {code}
        </Tag>
      ),
    },
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      key: 'projectName',
      sorter: (a: ProjectListItem, b: ProjectListItem) => a.projectName.localeCompare(b.projectName),
      render: (name: string, record: ProjectListItem) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{name}</span>
          {record.isBillable && (
            <Tag icon={<DollarOutlined />} color="gold" style={{ borderRadius: 4, fontSize: 11 }}>
              Billable
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Client',
      dataIndex: 'clientName',
      key: 'clientName',
      width: 180,
      sorter: (a: ProjectListItem, b: ProjectListItem) => a.clientName.localeCompare(b.clientName),
      render: (clientName: string) => (
        <span style={{ fontWeight: 500 }}>{clientName}</span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'projectType',
      key: 'projectType',
      width: 130,
      render: (type: string) =>
        type ? (
          <Tag color={projectTypeColors[type.toLowerCase()] || 'default'} style={{ borderRadius: 6 }}>
            {type}
          </Tag>
        ) : (
          <span>—</span>
        ),
    },
    {
      title: 'Timeline',
      key: 'timeline',
      width: 180,
      render: (record: ProjectListItem) => (
        <span style={{ fontSize: 13, color: '#666' }}>
          {formatDateRange(record.startDate, record.endDate)}
        </span>
      ),
    },
    {
      title: 'Budget',
      dataIndex: 'projectBudget',
      key: 'projectBudget',
      width: 130,
      sorter: (a: ProjectListItem, b: ProjectListItem) => (a.projectBudget || 0) - (b.projectBudget || 0),
      render: (budget: number, record: ProjectListItem) =>
        budget ? (
          <span style={{ fontWeight: 500, color: '#0a0d54' }}>
            {formatCurrency(budget, record.currency)}
          </span>
        ) : (
          <span>—</span>
        ),
    },
    {
      title: 'Manager',
      dataIndex: 'projectManagerName',
      key: 'projectManagerName',
      width: 150,
      render: (managerName: string) =>
        managerName ? (
          <span style={{ fontSize: 13 }}>{managerName}</span>
        ) : (
          <span style={{ color: '#999' }}>Unassigned</span>
        ),
    },
    {
      title: 'Resources',
      dataIndex: 'totalAllocatedResources',
      key: 'totalAllocatedResources',
      width: 100,
      align: 'center' as const,
      sorter: (a: ProjectListItem, b: ProjectListItem) => a.totalAllocatedResources - b.totalAllocatedResources,
      render: (count: number) => (
        <Tag color="blue" style={{ borderRadius: 6, fontSize: 13, fontWeight: 600 }}>
          {count}
        </Tag>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (record: ProjectListItem) => (
        <Tag color={projectStatusColors[record.projectStatus?.toLowerCase()] || 'default'} style={{ borderRadius: 6 }}>
          {record.projectStatus || 'Unknown'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      render: (record: ProjectListItem) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/projects/${record.id}`)}
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
            onClick={() => navigate(`/admin/projects/${record.id}/edit`)}
            style={{ borderRadius: 6 }}
          >
            Edit
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id, record.projectName)}
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
              <Title level={3} style={{ margin: 0 }}>Projects</Title>
              <p style={{ color: '#666', margin: '4px 0 0 0', fontSize: 14 }}>
                Manage client projects and deliverables
              </p>
            </div>
            <Space wrap>
              <Input
                placeholder="Search projects..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 250, borderRadius: 6 }}
                allowClear
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/admin/projects/create')}
                style={{
                  background: '#0a0d54',
                  borderColor: '#0a0d54',
                  borderRadius: 6,
                }}
              >
                Create Project
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
              placeholder="Client"
              value={selectedClient}
              onChange={handleClientChange}
              allowClear
              style={{ width: 200, borderRadius: 6 }}
              showSearch
              optionFilterProp="children"
            >
              {clients.map(client => (
                <Select.Option key={client.id} value={client.id}>
                  {client.name}
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
              {uniqueStatuses.map(status => (
                <Select.Option key={status} value={status}>
                  {status}
                </Select.Option>
              ))}
            </Select>
            <Select
              placeholder="Project Type"
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
            {(selectedClient || selectedStatus || selectedType || searchText) && (
              <Button onClick={handleClearFilters} style={{ borderRadius: 6 }}>
                Clear All Filters
              </Button>
            )}
            <span style={{ marginLeft: 'auto', color: '#666' }}>
              Showing {filteredProjects.length} of {projects.length} projects
            </span>
          </div>

          {error && (
            <Alert
              message="Error Loading Projects"
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
              dataSource={filteredProjects}
              rowKey="id"
              locale={{
                emptyText: searchText
                  ? `No projects match "${searchText}"`
                  : 'No projects found. Click "Create Project" to add one.'
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} projects`,
              }}
            />
          )}
        </Space>
      </Card>
    </div>
  );
};
