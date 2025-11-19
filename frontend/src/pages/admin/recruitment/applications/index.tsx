import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Modal, Card, Input, Select, Rate, Avatar, Dropdown, MenuProps } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  DownloadOutlined,
  CalendarOutlined,
  StarOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  FileTextOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';

const { Search } = Input;

interface Application {
  id: string;
  candidateName: string;
  email: string;
  phone: string;
  jobPosting: string;
  jobPostingId?: string;
  status: string;
  appliedDate: string;
  source: string;
  resumeUrl?: string;
  rating?: number;
  experience?: string;
  currentCompany?: string;
}

const ApplicationsListPage: React.FC = () => {
  const [data, setData] = useState<Application[]>([]);
  const [filteredData, setFilteredData] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [selectedSource, setSelectedSource] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchText, selectedStatus, selectedSource, data]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/recruitment/applications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(response.data);
      setFilteredData(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...data];

    if (searchText) {
      filtered = filtered.filter(app =>
        app.candidateName?.toLowerCase().includes(searchText.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        app.jobPosting?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter(app => app.status === selectedStatus);
    }

    if (selectedSource) {
      filtered = filtered.filter(app => app.source === selectedSource);
    }

    setFilteredData(filtered);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete Application',
      content: 'Are you sure you want to delete this application? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(
            `${API_BASE_URL}/recruitment/applications/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          message.success('Application deleted successfully');
          fetchData();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to delete application');
        }
      },
    });
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_BASE_URL}/recruitment/applications/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success('Status updated successfully');
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleRatingChange = async (id: string, rating: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_BASE_URL}/recruitment/applications/${id}/rating`,
        { rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success('Rating updated successfully');
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update rating');
    }
  };

  const handleDownloadResume = (resumeUrl: string, candidateName: string) => {
    if (!resumeUrl) {
      message.warning('Resume not available');
      return;
    }
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = resumeUrl;
    link.download = `${candidateName}_Resume.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleScheduleInterview = (applicationId: string, candidateName: string) => {
    navigate(`/admin/recruitment/interviews/create`, {
      state: { applicationId, candidateName }
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'New': 'blue',
      'Reviewing': 'orange',
      'Shortlisted': 'cyan',
      'Interview Scheduled': 'purple',
      'Interviewed': 'geekblue',
      'Offered': 'green',
      'Hired': 'success',
      'Rejected': 'red',
      'Withdrawn': 'default',
    };
    return colors[status] || 'default';
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      'Website': 'blue',
      'LinkedIn': 'cyan',
      'Referral': 'purple',
      'Job Board': 'orange',
      'Direct': 'green',
    };
    return colors[source] || 'default';
  };

  const uniqueSources = Array.from(new Set(data.map(app => app.source).filter(Boolean)));

  const getActionItems = (record: Application): MenuProps['items'] => [
    {
      key: 'view',
      label: 'View Details',
      icon: <EyeOutlined />,
      onClick: () => navigate(`/admin/recruitment/applications/${record.id}`),
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: <EditOutlined />,
      onClick: () => navigate(`/admin/recruitment/applications/${record.id}/edit`),
    },
    {
      key: 'interview',
      label: 'Schedule Interview',
      icon: <CalendarOutlined />,
      onClick: () => handleScheduleInterview(record.id, record.candidateName),
    },
    {
      key: 'resume',
      label: 'Download Resume',
      icon: <DownloadOutlined />,
      onClick: () => handleDownloadResume(record.resumeUrl || '', record.candidateName),
      disabled: !record.resumeUrl,
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDelete(record.id),
    },
  ];

  const columns = [
    {
      title: 'Candidate',
      dataIndex: 'candidateName',
      key: 'candidateName',
      width: 250,
      render: (text: string, record: Application) => (
        <Space>
          <Avatar
            size={40}
            style={{
              background: 'linear-gradient(135deg, #13c2c2 0%, #0e9c9c 100%)',
              fontWeight: 600,
            }}
            icon={<UserOutlined />}
          >
            {text?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Space direction="vertical" size={0}>
            <span style={{ fontWeight: 500, fontSize: 14 }}>{text}</span>
            <Space size="small" style={{ fontSize: 12, color: '#8c8c8c' }}>
              <MailOutlined />
              <span>{record.email}</span>
            </Space>
            {record.phone && (
              <Space size="small" style={{ fontSize: 12, color: '#8c8c8c' }}>
                <PhoneOutlined />
                <span>{record.phone}</span>
              </Space>
            )}
          </Space>
        </Space>
      ),
    },
    {
      title: 'Job Position',
      dataIndex: 'jobPosting',
      key: 'jobPosting',
      width: 200,
      render: (text: string, record: Application) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500, color: '#13c2c2' }}>{text}</span>
          {record.experience && (
            <span style={{ fontSize: 12, color: '#8c8c8c' }}>{record.experience} experience</span>
          )}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (status: string, record: Application) => (
        <Select
          value={status}
          onChange={(value) => handleStatusChange(record.id, value)}
          style={{ width: '100%' }}
          size="small"
        >
          <Select.Option value="New">
            <Tag color="blue" style={{ margin: 0 }}>New</Tag>
          </Select.Option>
          <Select.Option value="Reviewing">
            <Tag color="orange" style={{ margin: 0 }}>Reviewing</Tag>
          </Select.Option>
          <Select.Option value="Shortlisted">
            <Tag color="cyan" style={{ margin: 0 }}>Shortlisted</Tag>
          </Select.Option>
          <Select.Option value="Interview Scheduled">
            <Tag color="purple" style={{ margin: 0 }}>Interview Scheduled</Tag>
          </Select.Option>
          <Select.Option value="Interviewed">
            <Tag color="geekblue" style={{ margin: 0 }}>Interviewed</Tag>
          </Select.Option>
          <Select.Option value="Offered">
            <Tag color="green" style={{ margin: 0 }}>Offered</Tag>
          </Select.Option>
          <Select.Option value="Hired">
            <Tag color="success" style={{ margin: 0 }}>Hired</Tag>
          </Select.Option>
          <Select.Option value="Rejected">
            <Tag color="red" style={{ margin: 0 }}>Rejected</Tag>
          </Select.Option>
          <Select.Option value="Withdrawn">
            <Tag color="default" style={{ margin: 0 }}>Withdrawn</Tag>
          </Select.Option>
        </Select>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 160,
      render: (rating: number, record: Application) => (
        <Rate
          value={rating || 0}
          onChange={(value) => handleRatingChange(record.id, value)}
          style={{ fontSize: 16 }}
        />
      ),
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      width: 120,
      render: (source: string) => (
        <Tag color={getSourceColor(source)} style={{ borderRadius: 6 }}>
          {source}
        </Tag>
      ),
    },
    {
      title: 'Applied Date',
      dataIndex: 'appliedDate',
      key: 'appliedDate',
      width: 120,
      sorter: (a: Application, b: Application) =>
        new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime(),
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: Application) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<CalendarOutlined />}
            onClick={() => handleScheduleInterview(record.id, record.candidateName)}
            style={{
              background: '#13c2c2',
              borderColor: '#13c2c2',
              borderRadius: 6,
            }}
          >
            Interview
          </Button>
          {record.resumeUrl && (
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadResume(record.resumeUrl || '', record.candidateName)}
              style={{ borderRadius: 6 }}
            >
              Resume
            </Button>
          )}
          <Dropdown menu={{ items: getActionItems(record) }} trigger={['click']}>
            <Button size="small" icon={<MoreOutlined />} style={{ borderRadius: 6 }} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#13c2c2' }}>
                <FileTextOutlined style={{ marginRight: 8 }} />
                Job Applications
              </h2>
              <p style={{ margin: '4px 0 0 0', color: '#8c8c8c' }}>
                Review and manage all candidate applications
              </p>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/recruitment/applications/create')}
              style={{
                background: '#13c2c2',
                borderColor: '#13c2c2',
                borderRadius: 8,
                fontWeight: 600,
              }}
            >
              Add Application
            </Button>
          </div>

          {/* Filters */}
          <Space wrap size="middle" style={{ width: '100%' }}>
            <Input
              placeholder="Search by candidate name, email, or job..."
              prefix={<SearchOutlined style={{ color: '#13c2c2' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              style={{ width: 350, borderRadius: 8 }}
              allowClear
            />
            <Select
              placeholder="Filter by Status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              allowClear
              size="large"
              style={{ width: 200, borderRadius: 8 }}
            >
              <Select.Option value="New">New</Select.Option>
              <Select.Option value="Reviewing">Reviewing</Select.Option>
              <Select.Option value="Shortlisted">Shortlisted</Select.Option>
              <Select.Option value="Interview Scheduled">Interview Scheduled</Select.Option>
              <Select.Option value="Interviewed">Interviewed</Select.Option>
              <Select.Option value="Offered">Offered</Select.Option>
              <Select.Option value="Hired">Hired</Select.Option>
              <Select.Option value="Rejected">Rejected</Select.Option>
              <Select.Option value="Withdrawn">Withdrawn</Select.Option>
            </Select>
            <Select
              placeholder="Filter by Source"
              value={selectedSource}
              onChange={setSelectedSource}
              allowClear
              size="large"
              style={{ width: 180, borderRadius: 8 }}
            >
              {uniqueSources.map(source => (
                <Select.Option key={source} value={source}>{source}</Select.Option>
              ))}
            </Select>
            {(searchText || selectedStatus || selectedSource) && (
              <span style={{ color: '#8c8c8c', fontSize: 14 }}>
                Showing {filteredData.length} of {data.length} applications
              </span>
            )}
          </Space>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            rowKey="id"
            scroll={{ x: 1400 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} applications`,
              style: { marginTop: 16 },
            }}
            locale={{
              emptyText: searchText || selectedStatus || selectedSource
                ? 'No applications match your filters'
                : 'No applications found',
            }}
            rowClassName={() => 'hover-row'}
            style={{
              marginTop: 16,
            }}
          />
        </Space>
      </Card>
    </div>
  );
};

export default ApplicationsListPage;
