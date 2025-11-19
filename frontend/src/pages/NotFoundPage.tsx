import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

/**
 * NotFoundPage Component
 * Displays 404 error page for non-existent routes
 */
export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '100px 0', textAlign: 'center' }}>
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={[
          <Button type="primary" key="home" onClick={() => navigate('/')}>
            Back Home
          </Button>,
          <Button key="back" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        ]}
      />
    </div>
  );
};
