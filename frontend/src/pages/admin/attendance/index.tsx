import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const AttendanceDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>
        <ClockCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
        Attendance Management
      </h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            onClick={() => navigate(`/admin/attendance/shifts`)}
            style={{ borderColor: '#1890ff' }}
          >
            <Statistic
              title="Shifts"
              value={0}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
<Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            onClick={() => navigate(`/admin/attendance/records`)}
            style={{ borderColor: '#1890ff' }}
          >
            <Statistic
              title="Attendance Records"
              value={0}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
<Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            onClick={() => navigate(`/admin/attendance/regularization`)}
            style={{ borderColor: '#1890ff' }}
          >
            <Statistic
              title="Regularization"
              value={0}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AttendanceDashboardPage;
