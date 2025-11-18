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
  Rate,
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
  ShopOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
  TableOutlined,
  StarOutlined
} from '@ant-design/icons';
import { getAllVendors, deleteVendor, VendorListItem } from '../../../api/vendorApi';

const { Title, Text } = Typography;

interface VendorStats {
  total: number;
  active: number;
  categories: number;
  thisMonth: number;
}

export const VendorListPage = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<VendorListItem[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<VendorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllVendors();
      setVendors(data);
      setFilteredVendors(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load vendors. Please try again.');
      console.error('Error loading vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (
    searchValue?: string,
    type?: string,
    status?: string
  ) => {
    let filtered = [...vendors];

    // Apply search filter
    if (searchValue) {
      const lowercasedValue = searchValue.toLowerCase();
      filtered = filtered.filter(vendor =>
        vendor.name.toLowerCase().includes(lowercasedValue) ||
        vendor.vendorCode.toLowerCase().includes(lowercasedValue) ||
        vendor.primaryContactName?.toLowerCase().includes(lowercasedValue) ||
        vendor.primaryContactEmail?.toLowerCase().includes(lowercasedValue)
      );
    }

    // Apply type filter
    if (type) {
      filtered = filtered.filter(vendor => vendor.vendorType === type);
    }

    // Apply status filter
    if (status === 'active') {
      filtered = filtered.filter(vendor => vendor.isActive);
    } else if (status === 'inactive') {
      filtered = filtered.filter(vendor => !vendor.isActive);
    }

    setFilteredVendors(filtered);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    applyFilters(value, selectedType, selectedStatus);
  };

  const handleTypeChange = (value: string | undefined) => {
    setSelectedType(value);
    applyFilters(searchText, value, selectedStatus);
  };

  const handleStatusChange = (value: string | undefined) => {
    setSelectedStatus(value);
    applyFilters(searchText, selectedType, value);
  };

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedType(undefined);
    setSelectedStatus(undefined);
    setFilteredVendors(vendors);
  };

  const handleDelete = async (id: string, name: string) => {
    Modal.confirm({
      title: 'Delete Vendor',
      content: `Are you sure you want to delete vendor "${name}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setDeleteLoading(true);
          await deleteVendor(id);
          message.success(`Vendor "${name}" deleted successfully`);
          await loadVendors();
        } catch (err: any) {
          message.error(err.response?.data?.message || 'Failed to delete vendor');
        } finally {
          setDeleteLoading(false);
        }
      },
    });
  };

  const getActionMenu = (vendor: VendorListItem): MenuProps => ({
    items: [
      {
        key: 'view',
        label: 'View Details',
        icon: <EyeOutlined />,
        onClick: () => navigate(`/admin/vendors/${vendor.id}`),
      },
      {
        key: 'edit',
        label: 'Edit Vendor',
        icon: <EditOutlined />,
        onClick: () => navigate(`/admin/vendors/${vendor.id}/edit`),
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        label: 'Delete',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDelete(vendor.id, vendor.name),
      },
    ],
  });

  const calculateStats = (): VendorStats => {
    const activeVendors = vendors.filter(v => v.isActive);
    const uniqueCategories = new Set(vendors.filter(v => v.vendorType).map(v => v.vendorType));

    return {
      total: vendors.length,
      active: activeVendors.length,
      categories: uniqueCategories.size,
      thisMonth: 0,
    };
  };

  const stats = calculateStats();

  // Extract unique vendor types for filters
  const uniqueTypes = Array.from(
    new Set(vendors.filter(v => v.vendorType).map(v => v.vendorType))
  ).sort();

  const vendorTypeColors: Record<string, string> = {
    staffing: 'blue',
    consulting: 'purple',
    technology: 'green',
    services: 'orange',
  };

  const columns = [
    {
      title: 'Vendor Code',
      dataIndex: 'vendorCode',
      key: 'vendorCode',
      width: 140,
      sorter: (a: VendorListItem, b: VendorListItem) => a.vendorCode.localeCompare(b.vendorCode),
      render: (code: string) => (
        <Tag color="blue" style={{ borderRadius: 6, fontFamily: 'monospace', fontWeight: 600 }}>
          {code}
        </Tag>
      ),
    },
    {
      title: 'Vendor Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: VendorListItem, b: VendorListItem) => a.name.localeCompare(b.name),
      render: (name: string, record: VendorListItem) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{name}</span>
          {record.isPreferred && (
            <Tag color="gold" style={{ borderRadius: 4, fontSize: 11 }}>
              Preferred
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'vendorType',
      key: 'vendorType',
      width: 130,
      render: (type: string) =>
        type ? (
          <Tag color={vendorTypeColors[type.toLowerCase()] || 'default'} style={{ borderRadius: 6 }}>
            {type}
          </Tag>
        ) : (
          <span>—</span>
        ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (record: VendorListItem) => (
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
      title: 'Resources',
      key: 'resources',
      width: 120,
      render: (record: VendorListItem) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>
            Active: {record.activeResourcesCount}
          </span>
          <span style={{ fontSize: 12, color: '#666' }}>
            Total: {record.totalResourcesSupplied}
          </span>
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (record: VendorListItem) => (
        <Tag color={record.isActive ? 'green' : 'red'} style={{ borderRadius: 6 }}>
          {record.isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (record: VendorListItem) => (
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
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Total Vendors</Text>
            <Title level={2} style={{ color: '#fff', margin: 0 }}>{stats.total}</Title>
            <ShopOutlined style={{ fontSize: 24, color: 'rgba(255,255,255,0.8)' }} />
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
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Categories</Text>
            <Title level={2} style={{ color: '#fff', margin: 0 }}>{stats.categories}</Title>
            <AppstoreOutlined style={{ fontSize: 24, color: 'rgba(255,255,255,0.8)' }} />
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
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>This Month</Text>
            <Title level={2} style={{ color: '#fff', margin: 0 }}>{stats.thisMonth}</Title>
            <StarOutlined style={{ fontSize: 24, color: 'rgba(255,255,255,0.8)' }} />
          </Space>
        </Card>
      </Col>
    </Row>
  );

  const renderCardsView = () => (
    <Row gutter={[16, 16]}>
      {filteredVendors.map(vendor => (
        <Col xs={24} sm={12} lg={8} xl={6} key={vendor.id}>
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
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ShopOutlined style={{ fontSize: 24, color: '#fff' }} />
                  </div>
                  <div>
                    <Title level={5} style={{ margin: 0 }}>{vendor.name}</Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>{vendor.vendorCode}</Text>
                  </div>
                </Space>
                <Dropdown menu={getActionMenu(vendor)} trigger={['click']}>
                  <Button
                    type="text"
                    icon={<MoreOutlined />}
                    style={{ padding: 4 }}
                  />
                </Dropdown>
              </div>

              {vendor.vendorType && (
                <Tag color={vendorTypeColors[vendor.vendorType.toLowerCase()] || 'default'} style={{ borderRadius: 6 }}>
                  {vendor.vendorType}
                </Tag>
              )}

              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Contact:</Text>
                <br />
                {vendor.primaryContactName ? (
                  <>
                    <Text strong style={{ fontSize: 13 }}>{vendor.primaryContactName}</Text>
                    <br />
                    {vendor.primaryContactEmail && (
                      <Text type="secondary" style={{ fontSize: 12 }}>{vendor.primaryContactEmail}</Text>
                    )}
                    {vendor.primaryContactPhone && (
                      <>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>{vendor.primaryContactPhone}</Text>
                      </>
                    )}
                  </>
                ) : (
                  <Text type="secondary">Not set</Text>
                )}
              </div>

              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Rating:</Text>
                <br />
                <Rate disabled defaultValue={4} style={{ fontSize: 14 }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Tag
                  color={vendor.isActive ? 'green' : 'red'}
                  icon={vendor.isActive ? <CheckCircleOutlined /> : undefined}
                  style={{ borderRadius: 6 }}
                >
                  {vendor.isActive ? 'Active' : 'Inactive'}
                </Tag>
                {vendor.isPreferred && (
                  <Tag color="gold" icon={<StarOutlined />} style={{ borderRadius: 6 }}>
                    Preferred
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
              <ShopOutlined /> Vendors
            </Title>
            <Text type="secondary">Manage vendor relationships and contracts</Text>
          </div>
          <Space wrap>
            <Input
              placeholder="Search vendors..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 250, borderRadius: 8 }}
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/vendors/create')}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: 8,
              }}
            >
              Create Vendor
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
              placeholder="Vendor Type"
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
              placeholder="Status"
              value={selectedStatus}
              onChange={handleStatusChange}
              allowClear
              style={{ width: 150 }}
            >
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
            {(selectedType || selectedStatus || searchText) && (
              <Button onClick={handleClearFilters}>Clear All Filters</Button>
            )}
            <Text type="secondary" style={{ marginLeft: 'auto' }}>
              Showing {filteredVendors.length} of {vendors.length} vendors
            </Text>
          </Space>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert
            message="Error Loading Vendors"
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
                dataSource={filteredVendors}
                rowKey="id"
                locale={{
                  emptyText: searchText
                    ? `No vendors match "${searchText}"`
                    : 'No vendors found. Click "Create Vendor" to add one.'
                }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} vendors`,
                }}
              />
            </Card>
          )
        )}
      </Space>
    </div>
  );
};
