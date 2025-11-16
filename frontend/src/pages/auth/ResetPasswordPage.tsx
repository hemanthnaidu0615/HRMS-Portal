import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Form, Input, Button, Alert, Progress, Result } from 'antd';
import { LockOutlined, CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { AuthLayout } from '../../layouts/AuthLayout';
import { authApi } from '../../api/authApi';

/**
 * Premium Reset Password Page
 * Reset password with token from email
 */
export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [form] = Form.useForm();

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 15;
    return Math.min(strength, 100);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const strength = calculatePasswordStrength(e.target.value);
    setPasswordStrength(strength);
  };

  const getStrengthColor = () => {
    if (passwordStrength < 40) return '#ff4d4f';
    if (passwordStrength < 70) return '#faad14';
    return '#52c41a';
  };

  const getStrengthText = () => {
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 70) return 'Medium';
    return 'Strong';
  };

  const handleResetPassword = async (values: { newPassword: string }) => {
    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await authApi.resetPassword(token, values.newPassword);
      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          'Failed to reset password. The reset link may have expired. Please request a new one.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Password Reset Successful">
        <Result
          status="success"
          icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          title="Password Reset Successfully"
          subTitle={
            <div style={{ color: '#64748b' }}>
              Your password has been reset successfully!
              <br />
              You can now sign in with your new password.
              <br />
              <br />
              Redirecting to login page...
            </div>
          }
          extra={
            <Link to="/login">
              <Button
                type="primary"
                size="large"
                style={{ height: 48, fontSize: 16, fontWeight: 500 }}
              >
                Go to Login
              </Button>
            </Link>
          }
        />
      </AuthLayout>
    );
  }

  if (!token) {
    return (
      <AuthLayout title="Invalid Reset Link">
        <Result
          status="error"
          title="Invalid Reset Link"
          subTitle="The password reset link is invalid or has expired. Please request a new one."
          extra={
            <Link to="/forgot-password">
              <Button
                type="primary"
                size="large"
                style={{ height: 48, fontSize: 16, fontWeight: 500 }}
              >
                Request New Link
              </Button>
            </Link>
          }
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Create a new password for your account"
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

      <Form
        form={form}
        name="resetPassword"
        onFinish={handleResetPassword}
        layout="vertical"
        size="large"
        requiredMark="optional"
      >
        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[
            { required: true, message: 'Please enter a new password' },
            { min: 8, message: 'Password must be at least 8 characters' },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: 'Password must contain uppercase, lowercase, and number',
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Create a strong password"
            onChange={handlePasswordChange}
          />
        </Form.Item>

        {/* Password Strength Indicator */}
        {passwordStrength > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 8,
                fontSize: 13,
              }}
            >
              <span style={{ color: '#64748b' }}>Password Strength:</span>
              <span style={{ color: getStrengthColor(), fontWeight: 500 }}>
                {getStrengthText()}
              </span>
            </div>
            <Progress
              percent={passwordStrength}
              strokeColor={getStrengthColor()}
              showInfo={false}
              size="small"
            />
          </div>
        )}

        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Re-enter your password"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
            style={{
              height: 48,
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            Reset Password
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

export default ResetPasswordPage;
