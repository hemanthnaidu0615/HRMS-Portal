import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  message,
  Modal,
  Card,
  Row,
  Col,
  Statistic,
  Badge,
  Tooltip,
  Switch
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
  PercentageOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SafetyOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';
import './components.css';

interface SalaryComponent {
  id: string;
  name: string;
  type: 'earning' | 'deduction';
  calculationType: 'fixed' | 'percentage';
  percentage?: number;
  amount?: number;
  isTaxable: boolean;
  isActive: boolean;
}

const ComponentsListPage: React.FC = () => {
  const [data, setData] = useState<SalaryComponent[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/payroll/components`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch salary components');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete Salary Component',
      content: 'Are you sure you want to delete this salary component? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(
            `${API_BASE_URL}/payroll/components/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          message.success('Salary component deleted successfully');
          fetchData();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to delete salary component');
        }
      },
    });
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_BASE_URL}/payroll/components/${id}/toggle-active`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success(`Component ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update component status');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const getTypeTag = (type: string) => {
    return type === 'earning' ? (
      <Tag icon={<RiseOutlined />} color="success">
        EARNING
      </Tag>
    ) : (
      <Tag icon={<FallOutlined />} color="error">
        DEDUCTION
      </Tag>
    );
  };

  const getCalculationTypeTag = (type: string) => {
    return type === 'fixed' ? (
      <Tag icon={<DollarOutlined />} color="blue">
        FIXED
      </Tag>
    ) : (
      <Tag icon={<PercentageOutlined />} color="purple">
        PERCENTAGE
      </Tag>
    );
  };

  const columns = [
    {
      title: 'Component Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: SalaryComponent) => (
        <Space>
          <Badge
            status={record.isActive ? 'success' : 'default'}
            text={<strong>{text}</strong>}
          />
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => getTypeTag(type),
      filters: [
        { text: 'Earning', value: 'earning' },
        { text: 'Deduction', value: 'deduction' },
      ],
      onFilter: (value: any, record: SalaryComponent) => record.type === value,
    },
    {
      title: 'Calculation Type',
      dataIndex: 'calculationType',
      key: 'calculationType',
      render: (type: string) => getCalculationTypeTag(type),
      filters: [
        { text: 'Fixed', value: 'fixed' },
        { text: 'Percentage', value: 'percentage' },
      ],
      onFilter: (value: any, record: SalaryComponent) => record.calculationType === value,
    },
    {
      title: 'Value',
      key: 'value',
      render: (_: any, record: SalaryComponent) => (
        <span style={{ fontWeight: 500, fontSize: 15 }}>
          {record.calculationType === 'fixed'
            ? formatCurrency(record.amount || 0)
            : `${record.percentage}%`}
        </span>
      ),
    },
    {
      title: 'Tax Status',
      dataIndex: 'isTaxable',
      key: 'isTaxable',
      render: (isTaxable: boolean) => (
        isTaxable ? (
          <Tooltip title="This component is taxable">
            <Tag icon={<SafetyOutlined />} color="warning">
              TAXABLE
            </Tag>
          </Tooltip>
        ) : (
          <Tooltip title="This component is not taxable">
            <Tag icon={<SafetyOutlined />} color="default">
              NON-TAXABLE
            </Tag>
          </Tooltip>
        )
      ),
      filters: [
        { text: 'Taxable', value: true },
        { text: 'Non-Taxable', value: false },
      ],
      onFilter: (value: any, record: SalaryComponent) => record.isTaxable === value,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: SalaryComponent) => (
        <Tooltip title={isActive ? 'Click to deactivate' : 'Click to activate'}>
          <Switch
            checked={isActive}
            onChange={() => handleToggleActive(record.id, isActive)}
            checkedChildren={<CheckCircleOutlined />}
            unCheckedChildren={<CloseCircleOutlined />}
          />
        </Tooltip>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value: any, record: SalaryComponent) => record.isActive === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right' as const,
      width: 150,
      render: (_: any, record: SalaryComponent) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/payroll/components/${record.id}/edit`)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Calculate statistics
  const totalComponents = data.length;
  const activeComponents = data.filter(c => c.isActive).length;
  const earningsCount = data.filter(c => c.type === 'earning').length;
  const deductionsCount = data.filter(c => c.type === 'deduction').length;
  const taxableCount = data.filter(c => c.isTaxable).length;

  return (
    <div className="components-page">
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>
            <DollarOutlined style={{ marginRight: 12, color: '#faad14' }} />
            Salary Components
          </h1>
          <p style={{ margin: '8px 0 0 0', color: '#8c8c8c' }}>
            Manage earnings and deductions for payroll processing
          </p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin/payroll/components/create')}
          style={{ background: '#faad14', borderColor: '#faad14' }}
        >
          Create Component
        </Button>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="Total Components"
              value={totalComponents}
              prefix={<DollarOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontSize: 24, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="Active Components"
              value={activeComponents}
              suffix={`/ ${totalComponents}`}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: 24, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="Earnings"
              value={earningsCount}
              prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: 24, fontWeight: 600 }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              Deductions: {deductionsCount}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="Taxable"
              value={taxableCount}
              suffix={`/ ${totalComponents}`}
              prefix={<SafetyOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14', fontSize: 24, fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} components`,
          }}
          scroll={{ x: 1000 }}
          rowClassName={(record) => record.isActive ? '' : 'inactive-row'}
        />
      </Card>
    </div>
  );
};

export default ComponentsListPage;
