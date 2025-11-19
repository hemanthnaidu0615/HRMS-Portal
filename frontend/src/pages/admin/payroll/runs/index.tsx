import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Timeline,
  Button,
  Tag,
  message,
  Modal,
  Space,
  Empty,
  Spin,
  Badge
} from 'antd';
import {
  PlusOutlined,
  DollarOutlined,
  TeamOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  DeleteOutlined,
  EditOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';
import './runs.css';

interface PayrollRun {
  id: string;
  payPeriod: string;
  startDate: string;
  endDate: string;
  processedDate?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalEmployees: number;
  totalAmount: number;
}

const RunsListPage: React.FC = () => {
  const [data, setData] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/payroll/runs`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch payroll runs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete Payroll Run',
      content: 'Are you sure you want to delete this payroll run? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(
            `${API_BASE_URL}/payroll/runs/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          message.success('Payroll run deleted successfully');
          fetchData();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to delete payroll run');
        }
      },
    });
  };

  const handleProcess = async (id: string) => {
    Modal.confirm({
      title: 'Process Payroll',
      content: 'Are you sure you want to process this payroll run? This will generate payslips for all employees.',
      okText: 'Process',
      onOk: async () => {
        setProcessing(id);
        try {
          const token = localStorage.getItem('token');
          await axios.post(
            `${API_BASE_URL}/payroll/runs/${id}/process`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          message.success('Payroll processed successfully');
          fetchData();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to process payroll');
        } finally {
          setProcessing(null);
        }
      },
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'processing':
        return <SyncOutlined spin style={{ color: '#1890ff' }} />;
      case 'pending':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case 'failed':
        return <CheckCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getStatusTag = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'success',
      processing: 'processing',
      pending: 'warning',
      failed: 'error',
    };
    return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate stats
  const totalPayouts = data.reduce((sum, run) => sum + (run.totalAmount || 0), 0);
  const totalEmployeesProcessed = data.reduce((sum, run) => sum + (run.totalEmployees || 0), 0);
  const completedRuns = data.filter(run => run.status === 'completed').length;
  const pendingRuns = data.filter(run => run.status === 'pending').length;

  return (
    <div className="payroll-runs-page">
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>
            <DollarOutlined style={{ marginRight: 12, color: '#faad14' }} />
            Payroll Runs
          </h1>
          <p style={{ margin: '8px 0 0 0', color: '#8c8c8c' }}>
            Manage and process payroll runs for all employees
          </p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin/payroll/runs/create')}
          style={{ background: '#faad14', borderColor: '#faad14' }}
        >
          Create Payroll Run
        </Button>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="Total Payouts"
              value={totalPayouts}
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
              title="Employees Paid"
              value={totalEmployeesProcessed}
              prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontSize: 24, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="Completed Runs"
              value={completedRuns}
              prefix={<CheckCircleOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontSize: 24, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="Pending Runs"
              value={pendingRuns}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14', fontSize: 24, fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Timeline */}
      <Card
        title={
          <span>
            <CalendarOutlined style={{ marginRight: 8 }} />
            Payroll History
          </span>
        }
        bordered={false}
        className="timeline-card"
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
          </div>
        ) : data.length === 0 ? (
          <Empty
            description="No payroll runs found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/payroll/runs/create')}
            >
              Create First Run
            </Button>
          </Empty>
        ) : (
          <Timeline mode="left">
            {data.map((run) => (
              <Timeline.Item
                key={run.id}
                dot={getStatusIcon(run.status)}
                color={
                  run.status === 'completed' ? 'green' :
                  run.status === 'processing' ? 'blue' :
                  run.status === 'pending' ? 'orange' : 'red'
                }
              >
                <Card
                  className="timeline-item-card"
                  bordered={false}
                  style={{ marginBottom: 16 }}
                >
                  <Row gutter={16} align="middle">
                    <Col flex="auto">
                      <div style={{ marginBottom: 8 }}>
                        <Space>
                          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                            {run.payPeriod}
                          </h3>
                          {getStatusTag(run.status)}
                        </Space>
                      </div>
                      <Row gutter={[16, 8]}>
                        <Col xs={24} sm={12} md={8}>
                          <div style={{ color: '#8c8c8c', fontSize: 12 }}>Period</div>
                          <div style={{ fontWeight: 500 }}>
                            {formatDate(run.startDate)} - {formatDate(run.endDate)}
                          </div>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                          <div style={{ color: '#8c8c8c', fontSize: 12 }}>Employees</div>
                          <div style={{ fontWeight: 500 }}>
                            <TeamOutlined style={{ marginRight: 4 }} />
                            {run.totalEmployees}
                          </div>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                          <div style={{ color: '#8c8c8c', fontSize: 12 }}>Total Amount</div>
                          <div style={{ fontWeight: 600, color: '#52c41a', fontSize: 16 }}>
                            {formatCurrency(run.totalAmount || 0)}
                          </div>
                        </Col>
                        {run.processedDate && (
                          <Col xs={24} sm={12} md={8}>
                            <div style={{ color: '#8c8c8c', fontSize: 12 }}>Processed On</div>
                            <div style={{ fontWeight: 500 }}>
                              {formatDate(run.processedDate)}
                            </div>
                          </Col>
                        )}
                      </Row>
                    </Col>
                    <Col>
                      <Space direction="vertical" size="small">
                        {run.status === 'pending' && (
                          <Button
                            type="primary"
                            icon={<PlayCircleOutlined />}
                            onClick={() => handleProcess(run.id)}
                            loading={processing === run.id}
                            style={{ width: '100%', background: '#52c41a', borderColor: '#52c41a' }}
                          >
                            Process
                          </Button>
                        )}
                        <Button
                          icon={<EditOutlined />}
                          onClick={() => navigate(`/admin/payroll/runs/${run.id}/edit`)}
                          disabled={run.status === 'completed'}
                          style={{ width: '100%' }}
                        >
                          Edit
                        </Button>
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDelete(run.id)}
                          disabled={run.status === 'completed'}
                          style={{ width: '100%' }}
                        >
                          Delete
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </Card>
              </Timeline.Item>
            ))}
          </Timeline>
        )}
      </Card>
    </div>
  );
};

export default RunsListPage;
