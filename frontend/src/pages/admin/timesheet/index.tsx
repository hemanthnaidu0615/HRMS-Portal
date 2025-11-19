import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { FieldTimeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const TimesheetDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>
        <FieldTimeOutlined style={{ color: '#722ed1', marginRight: 8 }} />
        Timesheet Management
      </h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            onClick={() => navigate(`/admin/timesheet/timesheets`)}
            style={{ borderColor: '#722ed1' }}
          >
            <Statistic
              title="Timesheets"
              value={0}
              prefix={<FieldTimeOutlined />}
            />
          </Card>
        </Col>
<Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            onClick={() => navigate(`/admin/timesheet/tasks`)}
            style={{ borderColor: '#722ed1' }}
          >
            <Statistic
              title="Project Tasks"
              value={0}
              prefix={<FieldTimeOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TimesheetDashboardPage;
