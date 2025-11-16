import { Card, Row, Col, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export const DashboardPage = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  return (
    <div className="p-6" style={{ background: '#dde4eb', minHeight: '100vh' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={2} style={{ color: '#0a0d54', marginBottom: '24px' }}>
            Employee Dashboard
          </Title>
        </Col>

        <Col xs={24} md={16} lg={12}>
          <Card
            className="shadow-md"
            style={{
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
            }}
          >
            <div className="flex items-center mb-4">
              <UserOutlined style={{ fontSize: '24px', color: '#0a0d54', marginRight: '12px' }} />
              <Title level={4} style={{ margin: 0, color: '#0a0d54' }}>
                Welcome!
              </Title>
            </div>

            {user && (
              <div className="mb-4">
                <Text type="secondary">You are logged in as: </Text>
                <Text strong style={{ color: '#0a0d54' }}>{user.email}</Text>
              </div>
            )}

            <Text type="secondary" style={{ fontStyle: 'italic' }}>
              Employee functionality coming soon...
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
