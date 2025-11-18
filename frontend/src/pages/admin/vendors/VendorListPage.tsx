import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Alert, Typography, Space, Skeleton, Tag, Input, Select, Modal, message } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { getAllVendors, deleteVendor, VendorListItem } from '../../../api/vendorApi';

const { Title } = Typography;

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
      width: 220,
      render: (record: VendorListItem) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/vendors/${record.id}`)}
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
            onClick={() => navigate(`/admin/vendors/${record.id}/edit`)}
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
              <Title level={3} style={{ margin: 0 }}>Vendors</Title>
              <p style={{ color: '#666', margin: '4px 0 0 0', fontSize: 14 }}>
                Manage vendor relationships and contracts
              </p>
            </div>
            <Space wrap>
              <Input
                placeholder="Search vendors..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 250, borderRadius: 6 }}
                allowClear
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/admin/vendors/create')}
                style={{
                  background: '#0a0d54',
                  borderColor: '#0a0d54',
                  borderRadius: 6,
                }}
              >
                Create Vendor
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
              placeholder="Vendor Type"
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
              placeholder="Status"
              value={selectedStatus}
              onChange={handleStatusChange}
              allowClear
              style={{ width: 150, borderRadius: 6 }}
            >
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
            {(selectedType || selectedStatus || searchText) && (
              <Button onClick={handleClearFilters} style={{ borderRadius: 6 }}>
                Clear All Filters
              </Button>
            )}
            <span style={{ marginLeft: 'auto', color: '#666' }}>
              Showing {filteredVendors.length} of {vendors.length} vendors
            </span>
          </div>

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

          {loading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : (
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
          )}
        </Space>
      </Card>
    </div>
  );
};
