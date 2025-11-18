import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Form, Input, Button } from 'antd';
import {
  LockOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ArrowLeftOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { authApi } from '../../api/authApi';
import styles from './ResetPasswordPage.module.css';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

/**
 * Premium Reset Password Page
 * Reset password with token from email - includes strength meter and validation
 */
export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [form] = Form.useForm();

  // Password requirements
  const requirements: PasswordRequirement[] = [
    { label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
    { label: 'Contains uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
    { label: 'Contains lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
    { label: 'Contains number', test: (pwd) => /\d/.test(pwd) },
    { label: 'Contains special character', test: (pwd) => /[^a-zA-Z0-9]/.test(pwd) },
  ];

  // Calculate password strength
  const calculatePasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength += 20;
    if (pwd.length >= 12) strength += 20;
    if (/[a-z]/.test(pwd)) strength += 20;
    if (/[A-Z]/.test(pwd)) strength += 20;
    if (/\d/.test(pwd)) strength += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 10;
    return Math.min(strength, 100);
  };

  const passwordStrength = calculatePasswordStrength(password);

  const getStrengthColor = (): string => {
    if (passwordStrength < 40) return '#ef4444';
    if (passwordStrength < 70) return '#f59e0b';
    return '#22c55e';
  };

  const getStrengthText = (): string => {
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
      <div className={styles.container}>
        <div className={`${styles.card} ${styles.successCard}`}>
          <div className={styles.successIcon}>
            <CheckCircleFilled />
          </div>
          <h2 className={styles.successTitle}>Password Reset Successfully</h2>
          <div className={styles.successMessage}>
            Your password has been reset successfully!
            <br />
            You can now sign in with your new password.
            <br />
            <br />
            Redirecting to login page...
          </div>
          <Link to="/login">
            <Button
              type="primary"
              size="large"
              className={styles.submitButton}
              block
            >
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className={styles.container}>
        <div className={`${styles.card} ${styles.errorCard}`}>
          <div className={styles.errorIcon}>
            <WarningOutlined />
          </div>
          <h2 className={styles.errorTitle}>Invalid Reset Link</h2>
          <div className={styles.errorMessage}>
            The password reset link is invalid or has expired.
            <br />
            Please request a new one.
          </div>
          <Link to="/forgot-password">
            <Button
              type="primary"
              size="large"
              className={styles.submitButton}
              block
            >
              Request New Link
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.icon}>
            <LockOutlined />
          </div>
          <h2 className={styles.title}>Reset Your Password</h2>
          <p className={styles.subtitle}>Create a new password for your account</p>
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

        <Form
          form={form}
          name="resetPassword"
          onFinish={handleResetPassword}
          layout="vertical"
          size="large"
          requiredMark={false}
        >
          <Form.Item
            name="newPassword"
            label={<span style={{ fontWeight: 500, color: '#334155' }}>New Password</span>}
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
              onChange={(e) => setPassword(e.target.value)}
              style={{
                height: 52,
                borderRadius: 10,
                fontSize: 15,
              }}
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          {/* Password Strength Meter */}
          {password && (
            <div className={styles.strengthMeter}>
              <div className={styles.strengthHeader}>
                <span className={styles.strengthLabel}>Password Strength</span>
                <span
                  className={styles.strengthValue}
                  style={{ color: getStrengthColor() }}
                >
                  {getStrengthText()}
                </span>
              </div>
              <div className={styles.strengthBar}>
                <div
                  className={styles.strengthFill}
                  style={{
                    width: `${passwordStrength}%`,
                    background: getStrengthColor(),
                  }}
                />
              </div>

              {/* Requirements Checklist */}
              <div className={styles.requirements}>
                {requirements.map((req, index) => {
                  const isMet = req.test(password);
                  return (
                    <div
                      key={index}
                      className={
                        isMet ? styles.requirementChecked : styles.requirementUnchecked
                      }
                    >
                      <div className={styles.requirementIcon}>
                        {isMet ? <CheckCircleFilled /> : <CloseCircleFilled />}
                      </div>
                      <span>{req.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Form.Item
            name="confirmPassword"
            label={
              <span style={{ fontWeight: 500, color: '#334155' }}>Confirm New Password</span>
            }
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
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                height: 52,
                borderRadius: 10,
                fontSize: 15,
              }}
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          {/* Password Match Indicator */}
          {confirmPassword && password && (
            <div
              className={
                password === confirmPassword ? styles.matchSuccess : styles.matchError
              }
            >
              <div className={styles.matchIndicator}>
                <div className={styles.matchIcon}>
                  {password === confirmPassword ? (
                    <CheckCircleFilled />
                  ) : (
                    <CloseCircleFilled />
                  )}
                </div>
                <span>
                  {password === confirmPassword
                    ? 'Passwords match'
                    : 'Passwords do not match'}
                </span>
              </div>
            </div>
          )}

          <Form.Item style={{ marginTop: 32 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className={styles.submitButton}
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link to="/login" className={styles.backLink}>
            <ArrowLeftOutlined />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
