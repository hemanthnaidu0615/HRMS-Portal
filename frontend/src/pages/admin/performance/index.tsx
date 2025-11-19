import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const PerformanceDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>
        <TrophyOutlined style={{ color: '#eb2f96', marginRight: 8 }} />
        Performance Management
      </h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            onClick={() => navigate(`/admin/performance/cycles`)}
            style={{ borderColor: '#eb2f96' }}
          >
            <Statistic
              title="Performance Cycles"
              value={0}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
<Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            onClick={() => navigate(`/admin/performance/goals`)}
            style={{ borderColor: '#eb2f96' }}
          >
            <Statistic
              title="Goals"
              value={0}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
<Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            onClick={() => navigate(`/admin/performance/reviews`)}
            style={{ borderColor: '#eb2f96' }}
          >
            <Statistic
              title="Reviews"
              value={0}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PerformanceDashboardPage;
