import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Tag,
  message,
  Modal,
  Row,
  Col,
  Select,
  Input,
  Typography,
  Spin,
  Badge,
  Statistic,
  Image,
  Tooltip,
  QRCode,
} from 'antd';
import {
  LaptopOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  QrcodeOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  CalendarOutlined,
  TagOutlined,
  SearchOutlined,
  FilterOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';
import { EmptyState } from '../../../../components/EmptyState';

const { Option } = Select;
const { Text, Title } = Typography;

interface Asset {
  id: string;
  assetTag: string;
  name: string;
  category: {
    id: string;
    name: string;
  };
  serialNumber: string;
  purchaseDate: string;
  cost: number;
  status: 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'RETIRED';
  location: string;
  imageUrl?: string;
  description?: string;
}

const AssetsListPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');
  const [searchText, setSearchText] = useState('');
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [assets, categoryFilter, statusFilter, locationFilter, searchText]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await http.get('/api/assets/assets');
      setAssets(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...assets];

    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter((asset) => asset.category.id === categoryFilter);
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((asset) => asset.status === statusFilter);
    }

    if (locationFilter !== 'ALL') {
      filtered = filtered.filter((asset) => asset.location === locationFilter);
    }

    if (searchText) {
      filtered = filtered.filter(
        (asset) =>
          asset.name.toLowerCase().includes(searchText.toLowerCase()) ||
          asset.assetTag.toLowerCase().includes(searchText.toLowerCase()) ||
          asset.serialNumber.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredAssets(filtered);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete Asset',
      content: 'Are you sure you want to delete this asset? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await http.delete(`/api/assets/assets/${id}`);
          message.success('Asset deleted successfully');
          fetchAssets();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to delete asset');
        }
      },
    });
  };

  const showQRCode = (asset: Asset) => {
    setSelectedAsset(asset);
    setQrModalVisible(true);
  };

  const getStatusConfig = (status: string) => {
    const configs: any = {
      AVAILABLE: {
        color: 'green',
        icon: <CheckCircleOutlined />,
        label: 'Available',
        gradient: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
      },
      ASSIGNED: {
        color: 'blue',
        icon: <LaptopOutlined />,
        label: 'Assigned',
        gradient: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
      },
      MAINTENANCE: {
        color: 'orange',
        icon: <ToolOutlined />,
        label: 'Maintenance',
        gradient: 'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)',
      },
      RETIRED: {
        color: 'red',
        icon: <StopOutlined />,
        label: 'Retired',
        gradient: 'linear-gradient(135deg, #8c8c8c 0%, #bfbfbf 100%)',
      },
    };
    return configs[status] || configs.AVAILABLE;
  };

  const stats = {
    total: assets.length,
    available: assets.filter((a) => a.status === 'AVAILABLE').length,
    assigned: assets.filter((a) => a.status === 'ASSIGNED').length,
    maintenance: assets.filter((a) => a.status === 'MAINTENANCE').length,
    totalValue: assets.reduce((sum, a) => sum + a.cost, 0),
  };

  const categories = Array.from(new Set(assets.map((a) => a.category.name)));
  const locations = Array.from(new Set(assets.map((a) => a.location)));

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ margin: 0, color: '#fa8c16' }}>
                <LaptopOutlined style={{ marginRight: 12 }} />
                Asset Management
              </Title>
              <Text type="secondary">Track and manage company assets</Text>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/assets/assets/create')}
              style={{
                background: 'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)',
                border: 'none',
                height: 44,
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(250, 140, 22, 0.3)',
              }}
            >
              Add Asset
            </Button>
          </Col>
        </Row>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6} lg={4}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Total Assets</span>}
              value={stats.total}
              valueStyle={{ color: '#fff', fontSize: 28 }}
              prefix={<AppstoreOutlined />}
            />
          </PremiumCard>
        </Col>
        <Col xs={24} sm={12} md={6} lg={5}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Available</span>}
              value={stats.available}
              valueStyle={{ color: '#fff', fontSize: 28 }}
              prefix={<CheckCircleOutlined />}
            />
          </PremiumCard>
        </Col>
        <Col xs={24} sm={12} md={6} lg={5}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Assigned</span>}
              value={stats.assigned}
              valueStyle={{ color: '#fff', fontSize: 28 }}
              prefix={<LaptopOutlined />}
            />
          </PremiumCard>
        </Col>
        <Col xs={24} sm={12} md={6} lg={5}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #fa8c16 0%, #ffc53d 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Maintenance</span>}
              value={stats.maintenance}
              valueStyle={{ color: '#fff', fontSize: 28 }}
              prefix={<ToolOutlined />}
            />
          </PremiumCard>
        </Col>
        <Col xs={24} sm={24} md={24} lg={5}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Total Value</span>}
              value={stats.totalValue}
              prefix="$"
              valueStyle={{ color: '#fff', fontSize: 24 }}
              suffix={<DollarOutlined style={{ fontSize: 18 }} />}
            />
          </PremiumCard>
        </Col>
      </Row>

      {/* Filters */}
      <PremiumCard style={{ marginBottom: 24 }} bodyStyle={{ padding: 20 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Input
              size="large"
              placeholder="Search by name, asset tag, or serial number..."
              prefix={<SearchOutlined style={{ color: '#fa8c16' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col>
            <Select
              size="large"
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: 160, borderRadius: 8 }}
              suffixIcon={<FilterOutlined style={{ color: '#fa8c16' }} />}
            >
              <Option value="ALL">All Categories</Option>
              {categories.map((cat) => (
                <Option key={cat} value={cat}>
                  {cat}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Select
              size="large"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150, borderRadius: 8 }}
            >
              <Option value="ALL">All Status</Option>
              <Option value="AVAILABLE">Available</Option>
              <Option value="ASSIGNED">Assigned</Option>
              <Option value="MAINTENANCE">Maintenance</Option>
              <Option value="RETIRED">Retired</Option>
            </Select>
          </Col>
          <Col>
            <Select
              size="large"
              value={locationFilter}
              onChange={setLocationFilter}
              style={{ width: 150, borderRadius: 8 }}
            >
              <Option value="ALL">All Locations</Option>
              {locations.map((loc) => (
                <Option key={loc} value={loc}>
                  {loc}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </PremiumCard>

      {/* Assets Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <Spin size="large" />
        </div>
      ) : filteredAssets.length === 0 ? (
        <EmptyState
          icon={<LaptopOutlined />}
          title="No Assets Found"
          subtitle="No assets found matching your criteria"
          action={{
            text: 'Add Asset',
            icon: <PlusOutlined />,
            onClick: () => navigate('/admin/assets/assets/create'),
          }}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredAssets.map((asset) => {
            const statusConfig = getStatusConfig(asset.status);

            return (
              <Col xs={24} sm={12} md={8} lg={6} key={asset.id}>
                <PremiumCard
                  hoverable
                  style={{
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: '1px solid #f0f0f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    height: '100%',
                  }}
                  bodyStyle={{ padding: 0 }}
                >
                  {/* Image */}
                  <div
                    style={{
                      height: 180,
                      background: asset.imageUrl
                        ? `url(${asset.imageUrl})`
                        : 'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {!asset.imageUrl && <LaptopOutlined style={{ fontSize: 64, color: 'rgba(255,255,255,0.5)' }} />}

                    {/* Status Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                      }}
                    >
                      <Badge
                        count={statusConfig.label}
                        style={{
                          background: statusConfig.gradient,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          border: 'none',
                        }}
                      />
                    </div>

                    {/* QR Code Button */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                      }}
                    >
                      <Tooltip title="View QR Code">
                        <Button
                          shape="circle"
                          icon={<QrcodeOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            showQRCode(asset);
                          }}
                          style={{
                            background: 'rgba(255,255,255,0.9)',
                            border: 'none',
                          }}
                        />
                      </Tooltip>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: 16 }}>
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                      {/* Asset Tag */}
                      <div>
                        <Tag color="orange" style={{ fontSize: 11, fontWeight: 600 }}>
                          <TagOutlined /> {asset.assetTag}
                        </Tag>
                      </div>

                      {/* Name */}
                      <Title level={5} style={{ margin: 0 }} ellipsis={{ rows: 1 }}>
                        {asset.name}
                      </Title>

                      {/* Category */}
                      <Tag color="blue">{asset.category.name}</Tag>

                      {/* Details */}
                      <Space direction="vertical" size={4} style={{ width: '100%', marginTop: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Serial Number:
                          </Text>
                          <Text style={{ fontSize: 12, fontWeight: 500 }}>{asset.serialNumber}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <EnvironmentOutlined /> Location:
                          </Text>
                          <Text style={{ fontSize: 12, fontWeight: 500 }}>{asset.location}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <DollarOutlined /> Cost:
                          </Text>
                          <Text style={{ fontSize: 12, fontWeight: 600, color: '#fa8c16' }}>
                            ${asset.cost.toLocaleString()}
                          </Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <CalendarOutlined /> Purchased:
                          </Text>
                          <Text style={{ fontSize: 12 }}>
                            {dayjs(asset.purchaseDate).format('MMM YYYY')}
                          </Text>
                        </div>
                      </Space>

                      {/* Actions */}
                      <div
                        style={{
                          borderTop: '1px solid #f0f0f0',
                          paddingTop: 12,
                          marginTop: 12,
                        }}
                      >
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/admin/assets/assets/${asset.id}/edit`)}
                            style={{ paddingLeft: 0 }}
                          >
                            Edit
                          </Button>
                          <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(asset.id)}
                          >
                            Delete
                          </Button>
                        </Space>
                      </div>
                    </Space>
                  </div>
                </PremiumCard>
              </Col>
            );
          })}
        </Row>
      )}

      {/* QR Code Modal */}
      <Modal
        title={
          <span>
            <QrcodeOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
            Asset QR Code
          </span>
        }
        open={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={null}
        centered
      >
        {selectedAsset && (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Title level={4}>{selectedAsset.name}</Title>
            <Tag color="orange" style={{ marginBottom: 24 }}>
              {selectedAsset.assetTag}
            </Tag>
            <div style={{ background: '#fff', padding: 16, display: 'inline-block' }}>
              <QRCode
                value={JSON.stringify({
                  id: selectedAsset.id,
                  assetTag: selectedAsset.assetTag,
                  name: selectedAsset.name,
                })}
                size={200}
              />
            </div>
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">Scan to view asset details</Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AssetsListPage;
