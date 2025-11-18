import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const LeaveDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>
        <CalendarOutlined style={{ color: '#52c41a', marginRight: 8 }} />
        Leave Management
      </h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            onClick={() => navigate(`/admin/leave/types`)}
            style={{ borderColor: '#52c41a' }}
          >
            <Statistic
              title="Leave Types"
              value={0}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
<Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            onClick={() => navigate(`/admin/leave/applications`)}
            style={{ borderColor: '#52c41a' }}
          >
            <Statistic
              title="Leave Applications"
              value={0}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
<Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            onClick={() => navigate(`/admin/leave/balance`)}
            style={{ borderColor: '#52c41a' }}
          >
            <Statistic
              title="Leave Balance"
              value={0}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
<Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            onClick={() => navigate(`/admin/leave/holidays`)}
            style={{ borderColor: '#52c41a' }}
          >
            <Statistic
              title="Holidays"
              value={0}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LeaveDashboardPage;
