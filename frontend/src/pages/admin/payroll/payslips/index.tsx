import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Tag,
  message,
  Modal,
  Space,
  Empty,
  Spin,
  Select,
  Input,
  Divider,
  Progress,
  Statistic,
  Badge
} from 'antd';
import {
  PlusOutlined,
  DollarOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  SearchOutlined,
  FilterOutlined,
  RiseOutlined,
  FallOutlined,
  WalletOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';
import { Pie } from '@ant-design/charts';
import './payslips.css';

const { Option } = Select;
const { Search } = Input;

interface Payslip {
  id: string;
  employee: string;
  employeeId: string;
  payPeriod: string;
  basicSalary: number;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  status: 'draft' | 'generated' | 'sent' | 'paid';
  month: string;
  year: number;
}

const PayslipsListPage: React.FC = () => {
  const [data, setData] = useState<Payslip[]>([]);
  const [filteredData, setFilteredData] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterData();
  }, [data, filterStatus, searchText]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/payroll/payslips`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch payslips');
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = [...data];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(item =>
        item.employee.toLowerCase().includes(searchText.toLowerCase()) ||
        item.payPeriod.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredData(filtered);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete Payslip',
      content: 'Are you sure you want to delete this payslip? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(
            `${API_BASE_URL}/payroll/payslips/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          message.success('Payslip deleted successfully');
          fetchData();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to delete payslip');
        }
      },
    });
  };

  const handleDownload = async (id: string, employee: string) => {
    setDownloadingId(id);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/payroll/payslips/${id}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip_${employee}_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      message.success('Payslip downloaded successfully');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to download payslip');
    } finally {
      setDownloadingId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      draft: { color: 'default', text: 'DRAFT' },
      generated: { color: 'processing', text: 'GENERATED' },
      sent: { color: 'warning', text: 'SENT' },
      paid: { color: 'success', text: 'PAID' },
    };
    const config = statusConfig[status] || { color: 'default', text: status.toUpperCase() };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getSalaryBreakdownData = (payslip: Payslip) => {
    const earnings = payslip.grossSalary - payslip.basicSalary;
    return [
      { type: 'Basic Salary', value: payslip.basicSalary },
      { type: 'Earnings', value: earnings },
      { type: 'Deductions', value: payslip.deductions },
    ];
  };

  // Calculate statistics
  const totalNetSalary = filteredData.reduce((sum, item) => sum + (item.netSalary || 0), 0);
  const totalGrossSalary = filteredData.reduce((sum, item) => sum + (item.grossSalary || 0), 0);
  const totalDeductions = filteredData.reduce((sum, item) => sum + (item.deductions || 0), 0);
  const paidCount = filteredData.filter(item => item.status === 'paid').length;

  return (
    <div className="payslips-page">
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>
            <FileTextOutlined style={{ marginRight: 12, color: '#faad14' }} />
            Payslips
          </h1>
          <p style={{ margin: '8px 0 0 0', color: '#8c8c8c' }}>
            Manage employee payslips and salary breakdowns
          </p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin/payroll/payslips/create')}
          style={{ background: '#faad14', borderColor: '#faad14' }}
        >
          Generate Payslip
        </Button>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="Total Net Salary"
              value={totalNetSalary}
              precision={2}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#52c41a', fontSize: 24, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="Gross Salary"
              value={totalGrossSalary}
              precision={2}
              prefix={<RiseOutlined style={{ color: '#1890ff' }} />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#1890ff', fontSize: 24, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="Total Deductions"
              value={totalDeductions}
              precision={2}
              prefix={<FallOutlined style={{ color: '#ff4d4f' }} />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#ff4d4f', fontSize: 24, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="Paid Payslips"
              value={paidCount}
              suffix={`/ ${filteredData.length}`}
              prefix={<WalletOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontSize: 24, fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card
        bordered={false}
        style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
      >
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search by employee or period"
              allowClear
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              style={{ width: '100%' }}
              size="large"
              placeholder="Filter by status"
              value={filterStatus}
              onChange={setFilterStatus}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">All Status</Option>
              <Option value="draft">Draft</Option>
              <Option value="generated">Generated</Option>
              <Option value="sent">Sent</Option>
              <Option value="paid">Paid</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ color: '#8c8c8c' }}>
              Showing <strong>{filteredData.length}</strong> of <strong>{data.length}</strong> payslips
            </div>
          </Col>
        </Row>
      </Card>

      {/* Payslip Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : filteredData.length === 0 ? (
        <Card bordered={false}>
          <Empty
            description={searchText || filterStatus !== 'all' ? 'No payslips match your filters' : 'No payslips found'}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            {!searchText && filterStatus === 'all' && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/admin/payroll/payslips/create')}
              >
                Generate First Payslip
              </Button>
            )}
          </Empty>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredData.map((payslip) => (
            <Col xs={24} md={12} lg={8} key={payslip.id}>
              <Badge.Ribbon
                text={getStatusTag(payslip.status)}
                color={
                  payslip.status === 'paid' ? 'green' :
                  payslip.status === 'sent' ? 'orange' :
                  payslip.status === 'generated' ? 'blue' : 'gray'
                }
              >
                <Card
                  className="payslip-card"
                  bordered={false}
                  hoverable
                  style={{
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    height: '100%',
                  }}
                >
                  {/* Employee Info */}
                  <div style={{ marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#262626' }}>
                      {payslip.employee}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', color: '#8c8c8c', fontSize: 14 }}>
                      {payslip.payPeriod} • {payslip.month} {payslip.year}
                    </p>
                  </div>

                  <Divider style={{ margin: '16px 0' }} />

                  {/* Salary Breakdown */}
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <div>
                      <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>
                        Basic Salary
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 500 }}>
                        {formatCurrency(payslip.basicSalary)}
                      </div>
                    </div>

                    <div>
                      <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>
                        Gross Salary
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 500, color: '#1890ff' }}>
                        {formatCurrency(payslip.grossSalary)}
                      </div>
                    </div>

                    <div>
                      <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>
                        Deductions
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 500, color: '#ff4d4f' }}>
                        - {formatCurrency(payslip.deductions)}
                      </div>
                    </div>

                    <Divider style={{ margin: '8px 0' }} />

                    <div>
                      <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>
                        Net Salary
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 600, color: '#52c41a' }}>
                        {formatCurrency(payslip.netSalary)}
                      </div>
                    </div>

                    {/* Deduction Percentage */}
                    <div>
                      <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>
                        Deduction Rate
                      </div>
                      <Progress
                        percent={Number(((payslip.deductions / payslip.grossSalary) * 100).toFixed(1))}
                        strokeColor="#ff4d4f"
                        size="small"
                      />
                    </div>
                  </Space>

                  <Divider style={{ margin: '16px 0' }} />

                  {/* Actions */}
                  <Space direction="vertical" style={{ width: '100%' }} size="small">
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={() => handleDownload(payslip.id, payslip.employee)}
                      loading={downloadingId === payslip.id}
                      block
                      style={{ background: '#52c41a', borderColor: '#52c41a' }}
                    >
                      Download PDF
                    </Button>
                    <Space style={{ width: '100%' }}>
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/admin/payroll/payslips/${payslip.id}/edit`)}
                        disabled={payslip.status === 'paid'}
                        style={{ flex: 1 }}
                      >
                        Edit
                      </Button>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(payslip.id)}
                        disabled={payslip.status === 'paid'}
                        style={{ flex: 1 }}
                      >
                        Delete
                      </Button>
                    </Space>
                  </Space>
                </Card>
              </Badge.Ribbon>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default PayslipsListPage;
