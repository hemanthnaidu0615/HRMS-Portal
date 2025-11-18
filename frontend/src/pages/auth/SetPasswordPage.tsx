import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Form, Input, Button } from 'antd';
import {
  LockOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  InfoCircleFilled,
  EyeInvisibleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { authApi } from '../../api/authApi';
import styles from './SetPasswordPage.module.css';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

/**
 * Premium Set Password Page
 * First-time password setup with strength indicator and requirements checklist
 */
export const SetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [form] = Form.useForm();

  const email = location.state?.email;

  // Redirect if no email in state
  if (!email) {
    return <Navigate to="/login" replace />;
  }

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

  const handleSetPassword = async (values: {
    temporaryPassword: string;
    newPassword: string;
  }) => {
    setError('');
    setLoading(true);

    try {
      await authApi.setPassword({
        email,
        temporaryPassword: values.temporaryPassword,
        newPassword: values.newPassword,
      });

      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          'Failed to set password. Please check your temporary password and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>
              <CheckCircleFilled />
            </div>
            <div className={styles.successMessage}>
              Your password has been set successfully!
            </div>
            <div className={styles.successNote}>Redirecting to login page...</div>
          </div>
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
          <h2 className={styles.title}>Set Your Password</h2>
          <p className={styles.subtitle}>Create a strong password for your account</p>
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
            For security reasons, please set a new password to continue. Use the temporary
            password from your email.
          </div>
        </div>

        <Form
          form={form}
          name="setPassword"
          onFinish={handleSetPassword}
          layout="vertical"
          size="large"
          requiredMark={false}
        >
          <Form.Item
            name="temporaryPassword"
            label={
              <span style={{ fontWeight: 500, color: '#334155' }}>Temporary Password</span>
            }
            rules={[{ required: true, message: 'Please enter your temporary password' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Enter temporary password from email"
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
              {loading ? 'Setting Password...' : 'Set Password & Continue'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default SetPasswordPage;
