import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const RecruitmentDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>
        <TeamOutlined style={{ color: '#13c2c2', marginRight: 8 }} />
        Recruitment Management
      </h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            onClick={() => navigate(`/admin/recruitment/jobs`)}
            style={{ borderColor: '#13c2c2' }}
          >
            <Statistic
              title="Job Postings"
              value={0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
<Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            onClick={() => navigate(`/admin/recruitment/applications`)}
            style={{ borderColor: '#13c2c2' }}
          >
            <Statistic
              title="Applications"
              value={0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
<Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            onClick={() => navigate(`/admin/recruitment/interviews`)}
            style={{ borderColor: '#13c2c2' }}
          >
            <Statistic
              title="Interviews"
              value={0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RecruitmentDashboardPage;
