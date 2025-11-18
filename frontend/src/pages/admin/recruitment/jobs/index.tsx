import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Space, Tag, message, Modal, Input, Select, Statistic, Badge, Skeleton, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined, EnvironmentOutlined, TeamOutlined, ClockCircleOutlined, DollarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';

const { Search } = Input;

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  experience: string;
  openings: number;
  status: string;
  description?: string;
  requirements?: string;
  skills?: string[];
  salaryMin?: number;
  salaryMax?: number;
  postedDate?: string;
  applicationCount?: number;
}

const JobsListPage: React.FC = () => {
  const [data, setData] = useState<Job[]>([]);
  const [filteredData, setFilteredData] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchText, selectedDepartment, selectedLocation, selectedStatus, data]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/recruitment/jobs`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(response.data);
      setFilteredData(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch job postings');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...data];

    if (searchText) {
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        job.department?.toLowerCase().includes(searchText.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedDepartment) {
      filtered = filtered.filter(job => job.department === selectedDepartment);
    }

    if (selectedLocation) {
      filtered = filtered.filter(job => job.location === selectedLocation);
    }

    if (selectedStatus) {
      filtered = filtered.filter(job => job.status === selectedStatus);
    }

    setFilteredData(filtered);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete Job Posting',
      content: 'Are you sure you want to delete this job posting? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(
            `${API_BASE_URL}/recruitment/jobs/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          message.success('Job posting deleted successfully');
          fetchData();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to delete job posting');
        }
      },
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Open': '#52c41a',
      'Closed': '#ff4d4f',
      'On Hold': '#faad14',
      'Draft': '#d9d9d9',
    };
    return colors[status] || '#13c2c2';
  };

  const getEmploymentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Full-time': 'blue',
      'Part-time': 'cyan',
      'Contract': 'purple',
      'Internship': 'orange',
    };
    return colors[type] || 'default';
  };

  const uniqueDepartments = Array.from(new Set(data.map(job => job.department).filter(Boolean)));
  const uniqueLocations = Array.from(new Set(data.map(job => job.location).filter(Boolean)));

  const stats = {
    total: data.length,
    open: data.filter(job => job.status === 'Open').length,
    applications: data.reduce((sum, job) => sum + (job.applicationCount || 0), 0),
  };

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header Section */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#13c2c2' }}>
              <TeamOutlined style={{ marginRight: 8 }} />
              Job Postings
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#8c8c8c' }}>
              Manage and track all job openings
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/recruitment/jobs/create')}
            style={{
              background: '#13c2c2',
              borderColor: '#13c2c2',
              borderRadius: 8,
              height: 44,
              fontWeight: 600,
            }}
          >
            Post New Job
          </Button>
        </div>

        {/* Stats Cards */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>Total Jobs</span>}
                value={stats.total}
                valueStyle={{ color: '#fff', fontWeight: 600, fontSize: 32 }}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #13c2c2 0%, #0e9c9c 100%)' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>Open Positions</span>}
                value={stats.open}
                valueStyle={{ color: '#fff', fontWeight: 600, fontSize: 32 }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>Total Applications</span>}
                value={stats.applications}
                valueStyle={{ color: '#fff', fontWeight: 600, fontSize: 32 }}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card bordered={false} style={{ borderRadius: 12, marginBottom: 16 }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Input
                  placeholder="Search jobs by title, department, location..."
                  prefix={<SearchOutlined style={{ color: '#13c2c2' }} />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  size="large"
                  style={{ borderRadius: 8 }}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Select
                  placeholder="Department"
                  value={selectedDepartment}
                  onChange={setSelectedDepartment}
                  allowClear
                  size="large"
                  style={{ width: '100%', borderRadius: 8 }}
                >
                  {uniqueDepartments.map(dept => (
                    <Select.Option key={dept} value={dept}>{dept}</Select.Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Select
                  placeholder="Location"
                  value={selectedLocation}
                  onChange={setSelectedLocation}
                  allowClear
                  size="large"
                  style={{ width: '100%', borderRadius: 8 }}
                >
                  {uniqueLocations.map(loc => (
                    <Select.Option key={loc} value={loc}>{loc}</Select.Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Status"
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  allowClear
                  size="large"
                  style={{ width: '100%', borderRadius: 8 }}
                >
                  <Select.Option value="Open">Open</Select.Option>
                  <Select.Option value="Closed">Closed</Select.Option>
                  <Select.Option value="On Hold">On Hold</Select.Option>
                  <Select.Option value="Draft">Draft</Select.Option>
                </Select>
              </Col>
            </Row>
            {(searchText || selectedDepartment || selectedLocation || selectedStatus) && (
              <div style={{ color: '#8c8c8c', fontSize: 14 }}>
                Showing {filteredData.length} of {data.length} jobs
              </div>
            )}
          </Space>
        </Card>
      </div>

      {/* Job Cards */}
      {loading ? (
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map(i => (
            <Col xs={24} lg={12} key={i}>
              <Card style={{ borderRadius: 12 }}>
                <Skeleton active />
              </Card>
            </Col>
          ))}
        </Row>
      ) : filteredData.length === 0 ? (
        <Card style={{ borderRadius: 12 }}>
          <Empty
            description={
              <span style={{ color: '#8c8c8c' }}>
                {searchText || selectedDepartment || selectedLocation || selectedStatus
                  ? 'No jobs match your filters'
                  : 'No job postings found. Create your first job posting!'}
              </span>
            }
          >
            {!searchText && !selectedDepartment && !selectedLocation && !selectedStatus && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/admin/recruitment/jobs/create')}
                style={{ background: '#13c2c2', borderColor: '#13c2c2', borderRadius: 8 }}
              >
                Post New Job
              </Button>
            )}
          </Empty>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredData.map((job) => (
            <Col xs={24} lg={12} key={job.id}>
              <Card
                hoverable
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                }}
                bodyStyle={{ padding: 0 }}
              >
                {/* Card Header with Gradient */}
                <div
                  style={{
                    background: `linear-gradient(135deg, #13c2c2 0%, ${getStatusColor(job.status)} 100%)`,
                    padding: '20px 24px',
                    color: '#fff',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                    <h3 style={{ margin: 0, color: '#fff', fontSize: 18, fontWeight: 600, flex: 1 }}>
                      {job.title}
                    </h3>
                    <Badge
                      count={job.applicationCount || 0}
                      style={{ backgroundColor: '#fff', color: '#13c2c2', fontWeight: 600, boxShadow: '0 0 0 1px #13c2c2 inset' }}
                    />
                  </div>
                  <Space size="middle" wrap>
                    <span style={{ fontSize: 13, opacity: 0.95 }}>
                      <TeamOutlined style={{ marginRight: 4 }} />
                      {job.department}
                    </span>
                    <span style={{ fontSize: 13, opacity: 0.95 }}>
                      <EnvironmentOutlined style={{ marginRight: 4 }} />
                      {job.location}
                    </span>
                  </Space>
                </div>

                {/* Card Body */}
                <div style={{ padding: 24 }}>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                      <Row gutter={16}>
                        <Col span={12}>
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ color: '#8c8c8c', fontSize: 13 }}>Employment Type</span>
                            <div style={{ marginTop: 4 }}>
                              <Tag color={getEmploymentTypeColor(job.employmentType)} style={{ borderRadius: 6 }}>
                                {job.employmentType}
                              </Tag>
                            </div>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ color: '#8c8c8c', fontSize: 13 }}>Experience</span>
                            <div style={{ marginTop: 4, fontWeight: 500 }}>
                              {job.experience}
                            </div>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div>
                            <span style={{ color: '#8c8c8c', fontSize: 13 }}>Openings</span>
                            <div style={{ marginTop: 4, fontWeight: 600, fontSize: 16, color: '#13c2c2' }}>
                              {job.openings} {job.openings === 1 ? 'Position' : 'Positions'}
                            </div>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div>
                            <span style={{ color: '#8c8c8c', fontSize: 13 }}>Status</span>
                            <div style={{ marginTop: 4 }}>
                              <Badge
                                status={job.status === 'Open' ? 'success' : job.status === 'Closed' ? 'error' : 'warning'}
                                text={<span style={{ fontWeight: 500, color: getStatusColor(job.status) }}>{job.status}</span>}
                              />
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>

                    {job.skills && job.skills.length > 0 && (
                      <div>
                        <div style={{ color: '#8c8c8c', fontSize: 13, marginBottom: 8 }}>Required Skills</div>
                        <Space wrap size="small">
                          {job.skills.slice(0, 5).map((skill, idx) => (
                            <Tag key={idx} style={{ borderRadius: 12, border: '1px solid #13c2c2', color: '#13c2c2', background: '#e6fffb' }}>
                              {skill}
                            </Tag>
                          ))}
                          {job.skills.length > 5 && (
                            <Tag style={{ borderRadius: 12 }}>+{job.skills.length - 5} more</Tag>
                          )}
                        </Space>
                      </div>
                    )}

                    {(job.salaryMin || job.salaryMax) && (
                      <div>
                        <span style={{ color: '#8c8c8c', fontSize: 13 }}>Salary Range</span>
                        <div style={{ marginTop: 4, fontWeight: 500, color: '#52c41a' }}>
                          <DollarOutlined style={{ marginRight: 4 }} />
                          {job.salaryMin ? `$${job.salaryMin.toLocaleString()}` : 'N/A'} - {job.salaryMax ? `$${job.salaryMax.toLocaleString()}` : 'N/A'}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                      <Space size="small" wrap>
                        <Button
                          type="primary"
                          icon={<EyeOutlined />}
                          onClick={() => navigate(`/admin/recruitment/jobs/${job.id}`)}
                          style={{ borderRadius: 6, background: '#13c2c2', borderColor: '#13c2c2' }}
                        >
                          View
                        </Button>
                        <Button
                          icon={<EditOutlined />}
                          onClick={() => navigate(`/admin/recruitment/jobs/${job.id}/edit`)}
                          style={{ borderRadius: 6 }}
                        >
                          Edit
                        </Button>
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDelete(job.id)}
                          style={{ borderRadius: 6 }}
                        >
                          Delete
                        </Button>
                      </Space>
                    </div>
                  </Space>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default JobsListPage;
