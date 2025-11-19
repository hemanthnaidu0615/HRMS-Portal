import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Tag,
  Button,
  Space,
  Input,
  Select,
  message,
  Modal,
  Avatar,
  Spin,
  Typography,
  Statistic,
  Rate,
  Tooltip,
  Progress,
  Divider,
} from 'antd';
import {
  TrophyOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  UserOutlined,
  CalendarOutlined,
  SearchOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';
import { EmptyState } from '../../../../components/EmptyState';

const { Option } = Select;
const { Text, Title } = Typography;

interface Review {
  id: string;
  employee: {
    id: string;
    name: string;
    avatar?: string;
    position?: string;
  };
  reviewer: {
    id: string;
    name: string;
    avatar?: string;
  };
  cycle: {
    id: string;
    name: string;
  };
  rating: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'COMPLETED';
  reviewDate: string;
  strengths?: string;
  improvements?: string;
  goals?: string;
}

const ReviewsListPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [ratingFilter, setRatingFilter] = useState<string>('ALL');
  const [cycleFilter, setCycleFilter] = useState<string>('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reviews, searchText, statusFilter, ratingFilter, cycleFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await http.get('/api/performance/reviews');
      setReviews(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reviews];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(
        (review) =>
          review.employee.name.toLowerCase().includes(searchText.toLowerCase()) ||
          review.reviewer.name.toLowerCase().includes(searchText.toLowerCase()) ||
          review.cycle.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((review) => review.status === statusFilter);
    }

    // Rating filter
    if (ratingFilter !== 'ALL') {
      const rating = parseInt(ratingFilter);
      filtered = filtered.filter((review) => Math.round(review.rating) === rating);
    }

    // Cycle filter
    if (cycleFilter !== 'ALL') {
      filtered = filtered.filter((review) => review.cycle.id === cycleFilter);
    }

    setFilteredReviews(filtered);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete Review',
      content: 'Are you sure you want to delete this review?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await http.delete(`/api/performance/reviews/${id}`);
          message.success('Review deleted successfully');
          fetchReviews();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to delete review');
        }
      },
    });
  };

  const getStatusConfig = (status: string) => {
    const configs: any = {
      DRAFT: {
        color: 'default',
        icon: <EditOutlined />,
        label: 'Draft',
      },
      SUBMITTED: {
        color: 'blue',
        icon: <ClockCircleOutlined />,
        label: 'Submitted',
      },
      APPROVED: {
        color: 'green',
        icon: <CheckCircleOutlined />,
        label: 'Approved',
      },
      COMPLETED: {
        color: 'purple',
        icon: <TrophyOutlined />,
        label: 'Completed',
      },
    };
    return configs[status] || configs.DRAFT;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return '#52c41a';
    if (rating >= 3.5) return '#1890ff';
    if (rating >= 2.5) return '#faad14';
    return '#f5222d';
  };

  const stats = {
    total: reviews.length,
    avgRating: reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0',
    completed: reviews.filter((r) => r.status === 'COMPLETED').length,
    pending: reviews.filter((r) => r.status === 'SUBMITTED').length,
  };

  const cycles = Array.from(new Set(reviews.map((r) => r.cycle.id))).map((id) => {
    const review = reviews.find((r) => r.cycle.id === id);
    return { id, name: review?.cycle.name || '' };
  });

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ margin: 0, color: '#eb2f96' }}>
                <TrophyOutlined style={{ marginRight: 12 }} />
                Performance Reviews
              </Title>
              <Text type="secondary">Track and manage employee performance evaluations</Text>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/performance/reviews/create')}
              style={{
                background: 'linear-gradient(135deg, #eb2f96 0%, #f759ab 100%)',
                border: 'none',
                height: 44,
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(235, 47, 150, 0.3)',
              }}
            >
              Create Review
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
              background: 'linear-gradient(135deg, #eb2f96 0%, #f759ab 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Total Reviews</span>}
              value={stats.total}
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<TrophyOutlined />}
            />
          </PremiumCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Average Rating</span>}
              value={stats.avgRating}
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<StarOutlined />}
            />
          </PremiumCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Completed</span>}
              value={stats.completed}
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<CheckCircleOutlined />}
            />
          </PremiumCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Pending</span>}
              value={stats.pending}
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<ClockCircleOutlined />}
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
              placeholder="Search by employee, reviewer, or cycle..."
              prefix={<SearchOutlined style={{ color: '#eb2f96' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col>
            <Select
              size="large"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150, borderRadius: 8 }}
              suffixIcon={<FilterOutlined style={{ color: '#eb2f96' }} />}
            >
              <Option value="ALL">All Status</Option>
              <Option value="DRAFT">Draft</Option>
              <Option value="SUBMITTED">Submitted</Option>
              <Option value="APPROVED">Approved</Option>
              <Option value="COMPLETED">Completed</Option>
            </Select>
          </Col>
          <Col>
            <Select
              size="large"
              value={ratingFilter}
              onChange={setRatingFilter}
              style={{ width: 150, borderRadius: 8 }}
            >
              <Option value="ALL">All Ratings</Option>
              <Option value="5">5 Stars</Option>
              <Option value="4">4 Stars</Option>
              <Option value="3">3 Stars</Option>
              <Option value="2">2 Stars</Option>
              <Option value="1">1 Star</Option>
            </Select>
          </Col>
          {cycles.length > 0 && (
            <Col>
              <Select
                size="large"
                value={cycleFilter}
                onChange={setCycleFilter}
                style={{ width: 200, borderRadius: 8 }}
              >
                <Option value="ALL">All Cycles</Option>
                {cycles.map((cycle) => (
                  <Option key={cycle.id} value={cycle.id}>
                    {cycle.name}
                  </Option>
                ))}
              </Select>
            </Col>
          )}
        </Row>
      </PremiumCard>

      {/* Reviews Grid */}
      <div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <Spin size="large" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <PremiumCard>
            <EmptyState
              icon={<TrophyOutlined />}
              title="No Reviews Found"
              subtitle="No performance reviews match your criteria"
              action={{
                text: 'Create Review',
                icon: <PlusOutlined />,
                onClick: () => navigate('/admin/performance/reviews/create'),
              }}
            />
          </PremiumCard>
        ) : (
          <Row gutter={[16, 16]}>
            {filteredReviews.map((review) => {
              const statusConfig = getStatusConfig(review.status);
              return (
                <Col xs={24} sm={12} lg={8} key={review.id}>
                  <PremiumCard
                    hoverable
                    style={{
                      height: '100%',
                      borderRadius: 12,
                      border: '1px solid #f0f0f0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease',
                    }}
                    bodyStyle={{ padding: 0 }}
                  >
                    {/* Card Header */}
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #eb2f96 0%, #f759ab 100%)',
                        padding: '20px',
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                      }}
                    >
                      <Space align="start" style={{ width: '100%' }}>
                        <Avatar
                          size={56}
                          src={review.employee.avatar}
                          icon={<UserOutlined />}
                          style={{
                            border: '3px solid rgba(255,255,255,0.3)',
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <Title level={5} style={{ color: '#fff', margin: 0, marginBottom: 4 }}>
                            {review.employee.name}
                          </Title>
                          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                            {review.employee.position || 'Employee'}
                          </Text>
                          <div style={{ marginTop: 8 }}>
                            <Rate
                              disabled
                              value={review.rating}
                              style={{ fontSize: 16, color: '#ffd700' }}
                            />
                          </div>
                        </div>
                      </Space>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: '20px' }}>
                      <Space direction="vertical" size={12} style={{ width: '100%' }}>
                        {/* Rating Score */}
                        <div style={{ textAlign: 'center', padding: '16px 0' }}>
                          <div
                            style={{
                              fontSize: 48,
                              fontWeight: 700,
                              background: `linear-gradient(135deg, ${getRatingColor(review.rating)} 0%, ${getRatingColor(review.rating)}dd 100%)`,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              lineHeight: 1,
                            }}
                          >
                            {review.rating.toFixed(1)}
                          </div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Overall Rating
                          </Text>
                        </div>

                        <Divider style={{ margin: 0 }} />

                        {/* Details */}
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Reviewer
                            </Text>
                            <div>
                              <Space size={8}>
                                <Avatar
                                  size={20}
                                  src={review.reviewer.avatar}
                                  icon={<UserOutlined />}
                                />
                                <Text strong>{review.reviewer.name}</Text>
                              </Space>
                            </div>
                          </div>

                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Review Cycle
                            </Text>
                            <div>
                              <Tag color="#eb2f96" style={{ borderRadius: 4 }}>
                                {review.cycle.name}
                              </Tag>
                            </div>
                          </div>

                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Review Date
                            </Text>
                            <div>
                              <Space size={4}>
                                <CalendarOutlined style={{ color: '#eb2f96' }} />
                                <Text>{dayjs(review.reviewDate).format('MMM DD, YYYY')}</Text>
                              </Space>
                            </div>
                          </div>

                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Status
                            </Text>
                            <div>
                              <Tag
                                color={statusConfig.color}
                                icon={statusConfig.icon}
                                style={{ borderRadius: 4 }}
                              >
                                {statusConfig.label}
                              </Tag>
                            </div>
                          </div>
                        </Space>

                        <Divider style={{ margin: 0 }} />

                        {/* Actions */}
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Button
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/admin/performance/reviews/${review.id}`)}
                            style={{ padding: 0, color: '#eb2f96' }}
                          >
                            View
                          </Button>
                          <Space>
                            <Tooltip title="Edit">
                              <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => navigate(`/admin/performance/reviews/${review.id}/edit`)}
                                style={{ color: '#1890ff' }}
                              />
                            </Tooltip>
                            <Tooltip title="Delete">
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleDelete(review.id)}
                              />
                            </Tooltip>
                          </Space>
                        </Space>
                      </Space>
                    </div>
                  </PremiumCard>
                </Col>
              );
            })}
          </Row>
        )}
      </div>
    </div>
  );
};

export default ReviewsListPage;
