import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Input, Button } from 'antd';
import {
  MailOutlined,
  SendOutlined,
  ArrowLeftOutlined,
  CheckCircleFilled,
  InfoCircleFilled,
} from '@ant-design/icons';
import { authApi } from '../../api/authApi';
import styles from './ForgotPasswordPage.module.css';

/**
 * Premium Forgot Password Page
 * Request password reset link with gradient border and animations
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
      <div className={styles.container}>
        <div className={`${styles.card} ${styles.successCard}`}>
          <div className={styles.successIcon}>
            <CheckCircleFilled />
          </div>
          <h2 className={styles.successTitle}>Check Your Email</h2>
          <div className={styles.successMessage}>
            We've sent a password reset link to{' '}
            <span className={styles.successEmail}>{emailSent}</span>
            <br />
            <br />
            Please check your inbox and follow the instructions to reset your password.
            The link will expire in 1 hour.
          </div>
          <Link to="/login">
            <Button
              type="primary"
              size="large"
              icon={<ArrowLeftOutlined />}
              className={styles.submitButton}
              block
            >
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>
          <MailOutlined />
        </div>

        <div className={styles.header}>
          <h2 className={styles.title}>Forgot Password?</h2>
          <p className={styles.subtitle}>Enter your email to receive a reset link</p>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <div
              style={{
                background: '#fff1f0',
                border: '1px solid #ffccc7',
                borderRadius: '10px',
                padding: '12px 16px',
                color: '#cf1322',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          </div>
        )}

        <div className={styles.infoBox}>
          <InfoCircleFilled className={styles.infoIcon} />
          <div className={styles.infoText}>
            We'll send you an email with instructions to reset your password. Make sure to
            check your spam folder if you don't see it in your inbox.
          </div>
        </div>

        <Form
          form={form}
          name="forgotPassword"
          onFinish={handleForgotPassword}
          layout="vertical"
          size="large"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label={<span style={{ fontWeight: 500, color: '#334155' }}>Email Address</span>}
            rules={[
              { required: true, message: 'Please enter your email address' },
              { type: 'email', message: 'Please enter a valid email address' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
              placeholder="you@company.com"
              autoComplete="email"
              style={{
                height: 52,
                borderRadius: 10,
                fontSize: 15,
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              icon={<SendOutlined />}
              className={styles.submitButton}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Link to="/login" className={styles.backLink}>
            <ArrowLeftOutlined style={{ marginRight: 6 }} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
