import React from 'react';
import { Layout, Typography, Space } from 'antd';

const { Content } = Layout;
const { Title, Text } = Typography;

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

/**
 * Premium Auth Layout Component
 * Clean, centered layout for authentication pages
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: '#f5f7fa',
      }}
    >
      <Content
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 440,
            animation: 'fadeIn 0.3s ease-in-out',
          }}
        >
          {/* Logo & Branding */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: 48,
            }}
          >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              {/* Logo */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #0a0d54 0%, #15195c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: 24,
                  margin: '0 auto',
                  boxShadow: '0 4px 12px rgba(10, 13, 84, 0.15)',
                }}
              >
                HR
              </div>

              {/* Title */}
              <div>
                <Title
                  level={2}
                  style={{
                    margin: 0,
                    marginBottom: 8,
                    fontSize: 28,
                    fontWeight: 600,
                    color: '#111111',
                    letterSpacing: '-0.02em',
                  }}
                >
                  HRMS Portal
                </Title>
                <Text
                  style={{
                    fontSize: 15,
                    color: '#64748b',
                  }}
                >
                  Enterprise Human Resource Management
                </Text>
              </div>
            </Space>
          </div>

          {/* Auth Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 12,
              padding: '40px 32px',
              boxShadow:
                '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
              border: '1px solid #e8edf2',
            }}
          >
            {/* Card Title */}
            <div style={{ marginBottom: 32, textAlign: 'center' }}>
              <Title
                level={3}
                style={{
                  margin: 0,
                  marginBottom: 8,
                  fontSize: 20,
                  fontWeight: 600,
                  color: '#111111',
                }}
              >
                {title}
              </Title>
              {subtitle && (
                <Text
                  style={{
                    fontSize: 14,
                    color: '#64748b',
                  }}
                >
                  {subtitle}
                </Text>
              )}
            </div>

            {/* Form Content */}
            {children}
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: 24,
              textAlign: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 13,
                color: '#94a3b8',
              }}
            >
              &copy; {new Date().getFullYear()} HRMS Portal. All rights reserved.
            </Text>
          </div>
        </div>
      </Content>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Layout>
  );
};

export default AuthLayout;
