import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  message,
  Modal,
  Input,
  Switch,
  Typography,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TagsOutlined,
  SearchOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface ExpenseCategory {
  id: string;
  name: string;
  code: string;
  maxAmount: number;
  requiresReceipt: boolean;
  requiresApproval: boolean;
  isActive: boolean;
}

const CategoriesListPage: React.FC = () => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<ExpenseCategory[]>([]);
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
      const response = await http.get('/api/expenses/categories');
      setCategories(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch expense categories');
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
          cat.code.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredCategories(filtered);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete Expense Category',
      content: 'Are you sure you want to delete this expense category?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await http.delete(`/api/expenses/categories/${id}`);
          message.success('Expense category deleted successfully');
          fetchCategories();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to delete expense category');
        }
      },
    });
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await http.patch(`/api/expenses/categories/${id}`, { isActive });
      message.success(`Category ${isActive ? 'activated' : 'deactivated'} successfully`);
      fetchCategories();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update category status');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const columns: ColumnsType<ExpenseCategory> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text: string, record: ExpenseCategory) => (
        <Space>
          <TagsOutlined style={{ color: '#f5222d' }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Max Amount',
      dataIndex: 'maxAmount',
      key: 'maxAmount',
      sorter: (a, b) => a.maxAmount - b.maxAmount,
      render: (amount: number) => (
        <Text strong style={{ color: '#f5222d' }}>
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: 'Requires Receipt',
      dataIndex: 'requiresReceipt',
      key: 'requiresReceipt',
      align: 'center',
      render: (value: boolean) =>
        value ? (
          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
        ) : (
          <CloseCircleOutlined style={{ color: '#d9d9d9', fontSize: 18 }} />
        ),
    },
    {
      title: 'Requires Approval',
      dataIndex: 'requiresApproval',
      key: 'requiresApproval',
      align: 'center',
      render: (value: boolean) =>
        value ? (
          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
        ) : (
          <CloseCircleOutlined style={{ color: '#d9d9d9', fontSize: 18 }} />
        ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      align: 'center',
      render: (isActive: boolean, record: ExpenseCategory) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleToggleActive(record.id, checked)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_: any, record: ExpenseCategory) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/expenses/categories/${record.id}/edit`)}
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
    active: categories.filter((c) => c.isActive).length,
    requireReceipt: categories.filter((c) => c.requiresReceipt).length,
    requireApproval: categories.filter((c) => c.requiresApproval).length,
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ margin: 0, color: '#f5222d' }}>
                <TagsOutlined style={{ marginRight: 12 }} />
                Expense Categories
              </Title>
              <Text type="secondary">Manage expense claim categories and limits</Text>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/expenses/categories/create')}
              style={{
                background: 'linear-gradient(135deg, #f5222d 0%, #ff4d4f 100%)',
                border: 'none',
                height: 44,
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(245, 34, 45, 0.3)',
              }}
            >
              Create Category
            </Button>
          </Col>
        </Row>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Total Categories</span>}
              value={stats.total}
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<TagsOutlined />}
            />
          </PremiumCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Active</span>}
              value={stats.active}
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<CheckCircleOutlined />}
            />
          </PremiumCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Require Receipt</span>}
              value={stats.requireReceipt}
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<DollarOutlined />}
            />
          </PremiumCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Require Approval</span>}
              value={stats.requireApproval}
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<CheckCircleOutlined />}
            />
          </PremiumCard>
        </Col>
      </Row>

      {/* Search */}
      <PremiumCard style={{ marginBottom: 24 }} bodyStyle={{ padding: 20 }}>
        <Input
          size="large"
          placeholder="Search by category name or code..."
          prefix={<SearchOutlined style={{ color: '#f5222d' }} />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ borderRadius: 8 }}
        />
      </PremiumCard>

      {/* Table */}
      <PremiumCard>
        <Table
          columns={columns}
          dataSource={filteredCategories}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} categories`,
          }}
        />
      </PremiumCard>
    </div>
  );
};

export default CategoriesListPage;
