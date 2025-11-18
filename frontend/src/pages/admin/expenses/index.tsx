import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const ExpensesDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>
        <WalletOutlined style={{ color: '#f5222d', marginRight: 8 }} />
        Expenses Management
      </h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            onClick={() => navigate(`/admin/expenses/claims`)}
            style={{ borderColor: '#f5222d' }}
          >
            <Statistic
              title="Expense Claims"
              value={0}
              prefix={<WalletOutlined />}
            />
          </Card>
        </Col>
<Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            onClick={() => navigate(`/admin/expenses/categories`)}
            style={{ borderColor: '#f5222d' }}
          >
            <Statistic
              title="Expense Categories"
              value={0}
              prefix={<WalletOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ExpensesDashboardPage;
