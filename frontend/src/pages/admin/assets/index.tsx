import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { LaptopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const AssetsDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>
        <LaptopOutlined style={{ color: '#faad14', marginRight: 8 }} />
        Assets Management
      </h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            onClick={() => navigate(`/admin/assets/assets`)}
            style={{ borderColor: '#faad14' }}
          >
            <Statistic
              title="Assets"
              value={0}
              prefix={<LaptopOutlined />}
            />
          </Card>
        </Col>
<Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            onClick={() => navigate(`/admin/assets/assignments`)}
            style={{ borderColor: '#faad14' }}
          >
            <Statistic
              title="Assignments"
              value={0}
              prefix={<LaptopOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AssetsDashboardPage;
