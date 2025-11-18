import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const PayrollDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>
        <DollarOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
        Payroll Management
      </h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            onClick={() => navigate(`/admin/payroll/components`)}
            style={{ borderColor: '#fa8c16' }}
          >
            <Statistic
              title="Salary Components"
              value={0}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
<Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            onClick={() => navigate(`/admin/payroll/runs`)}
            style={{ borderColor: '#fa8c16' }}
          >
            <Statistic
              title="Payroll Runs"
              value={0}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
<Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            onClick={() => navigate(`/admin/payroll/payslips`)}
            style={{ borderColor: '#fa8c16' }}
          >
            <Statistic
              title="Payslips"
              value={0}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PayrollDashboardPage;
