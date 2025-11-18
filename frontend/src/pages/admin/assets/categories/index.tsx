import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  message,
  Modal,
  Row,
  Col,
  Input,
  Typography,
  Spin,
  Statistic,
  Badge,
} from 'antd';
import {
  AppstoreOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PercentageOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';
import { EmptyState } from '../../../../components/EmptyState';

const { Text, Title } = Typography;

interface Category {
  id: string;
  name: string;
  description: string;
  depreciationRate: number;
  lifespanYears: number;
  assetCount: number;
}

const AssetCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [categories, searchText]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await http.get('/api/assets/categories');
      setCategories(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...categories];

    if (searchText) {
      filtered = filtered.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchText.toLowerCase()) ||
          cat.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredCategories(filtered);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete Category',
      content: 'Are you sure you want to delete this category? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await http.delete(`/api/assets/categories/${id}`);
          message.success('Category deleted successfully');
          fetchCategories();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to delete category');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <AppstoreOutlined style={{ color: '#fa8c16' }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Depreciation Rate',
      dataIndex: 'depreciationRate',
      key: 'depreciationRate',
      align: 'center' as const,
      render: (rate: number) => (
        <Tag color="blue" icon={<PercentageOutlined />}>
          {rate}% / year
        </Tag>
      ),
    },
    {
      title: 'Lifespan',
      dataIndex: 'lifespanYears',
      key: 'lifespanYears',
      align: 'center' as const,
      render: (years: number) => (
        <Tag color="purple" icon={<ClockCircleOutlined />}>
          {years} years
        </Tag>
      ),
    },
    {
      title: 'Assets',
      dataIndex: 'assetCount',
      key: 'assetCount',
      align: 'center' as const,
      render: (count: number) => <Badge count={count} showZero style={{ background: '#fa8c16' }} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center' as const,
      render: (_: any, record: Category) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/assets/categories/${record.id}/edit`)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const stats = {
    total: categories.length,
    totalAssets: categories.reduce((sum, cat) => sum + cat.assetCount, 0),
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ margin: 0, color: '#fa8c16' }}>
                <AppstoreOutlined style={{ marginRight: 12 }} />
                Asset Categories
              </Title>
              <Text type="secondary">Manage asset types and depreciation settings</Text>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/assets/categories/create')}
              style={{
                background: 'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)',
                border: 'none',
                height: 44,
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(250, 140, 22, 0.3)',
              }}
            >
              Add Category
            </Button>
          </Col>
        </Row>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Total Categories</span>}
              value={stats.total}
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<AppstoreOutlined />}
            />
          </PremiumCard>
        </Col>
        <Col xs={24} sm={12}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Total Assets</span>}
              value={stats.totalAssets}
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<AppstoreOutlined />}
            />
          </PremiumCard>
        </Col>
      </Row>

      {/* Search */}
      <PremiumCard style={{ marginBottom: 24 }} bodyStyle={{ padding: 20 }}>
        <Input
          size="large"
          placeholder="Search categories..."
          prefix={<SearchOutlined style={{ color: '#fa8c16' }} />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ borderRadius: 8 }}
        />
      </PremiumCard>

      {/* Table */}
      <PremiumCard
        style={{
          background: 'linear-gradient(to bottom, #ffffff, #f9fafb)',
        }}
        bodyStyle={{ padding: 24 }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <Spin size="large" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <EmptyState
            icon={<AppstoreOutlined />}
            title="No Categories"
            subtitle="No asset categories found"
            action={{
              text: 'Add Category',
              icon: <PlusOutlined />,
              onClick: () => navigate('/admin/assets/categories/create'),
            }}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredCategories}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} categories`,
            }}
            bordered
          />
        )}
      </PremiumCard>
    </div>
  );
};

export default AssetCategoriesPage;
