import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Input, Button, Alert, Result } from 'antd';
import { MailOutlined, SendOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { AuthLayout } from '../../layouts/AuthLayout';
import { authApi } from '../../api/authApi';

/**
 * Premium Forgot Password Page
 * Request password reset link
 */
export const ForgotPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState('');
  const [form] = Form.useForm();

  const handleForgotPassword = async (values: { email: string }) => {
    setError('');
    setLoading(true);

    try {
      await authApi.forgotPassword(values.email);
      setSuccess(true);
      setEmailSent(values.email);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          'Failed to send reset email. Please check your email address and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Check Your Email">
        <Result
          status="success"
          icon={<MailOutlined style={{ color: '#52c41a' }} />}
          title="Reset Link Sent"
          subTitle={
            <div style={{ color: '#64748b' }}>
              We've sent a password reset link to{' '}
              <strong style={{ color: '#111111' }}>{emailSent}</strong>
              <br />
              <br />
              Please check your inbox and follow the instructions to reset your password.
              The link will expire in 1 hour.
            </div>
          }
          extra={
            <Link to="/login">
              <Button
                type="primary"
                size="large"
                icon={<ArrowLeftOutlined />}
                style={{ height: 48, fontSize: 16, fontWeight: 500 }}
              >
                Back to Login
              </Button>
            </Link>
          }
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="Enter your email to receive a reset link"
    >
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError('')}
          style={{ marginBottom: 24 }}
        />
      )}

      <Alert
        message="Password Reset"
        description="We'll send you an email with instructions to reset your password."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        name="forgotPassword"
        onFinish={handleForgotPassword}
        layout="vertical"
        size="large"
        requiredMark="optional"
      >
        <Form.Item
          name="email"
          label="Email Address"
          rules={[
            { required: true, message: 'Please enter your email address' },
            { type: 'email', message: 'Please enter a valid email address' },
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
            placeholder="you@company.com"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
            icon={<SendOutlined />}
            style={{
              height: 48,
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            Send Reset Link
          </Button>
        </Form.Item>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link
            to="/login"
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#0a0d54',
            }}
          >
            <ArrowLeftOutlined style={{ marginRight: 4 }} />
            Back to Login
          </Link>
        </div>
      </Form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
