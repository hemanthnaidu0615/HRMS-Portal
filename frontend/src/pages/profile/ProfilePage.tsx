import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, Alert, Row, Col, Divider, Tag } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, BankOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getMyProfile, changePassword, UserProfile, ChangePasswordRequest } from '../../api/profileApi';

const { Title, Text } = Typography;

export const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getMyProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values: ChangePasswordRequest) => {
    try {
      setChangePasswordError('');
      setChangePasswordSuccess('');
      setChangePasswordLoading(true);
      await changePassword(values);
      setChangePasswordSuccess('Password changed successfully!');
      form.resetFields();
      // Reload profile to update mustChangePassword flag
      await loadProfile();
    } catch (err: any) {
      setChangePasswordError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setChangePasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Text>Loading profile...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Alert message={error} type="error" showIcon />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={2}>My Profile</Title>
            <Text type="secondary">View and manage your profile information</Text>
          </div>

          <Card
            title={
              <Space>
                <UserOutlined />
                Profile Information
              </Space>
            }
            style={{ borderRadius: 12 }}
          >
            <Row gutter={[16, 24]}>
              <Col span={24}>
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Text type="secondary">
                    <MailOutlined /> Email
                  </Text>
                  <Title level={4} style={{ margin: 0 }}>
                    {profile.email}
                  </Title>
                </Space>
              </Col>

              {profile.organizationName && (
                <Col span={24}>
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <Text type="secondary">
                      <BankOutlined /> Organization
                    </Text>
                    <Title level={4} style={{ margin: 0 }}>
                      {profile.organizationName}
                    </Title>
                  </Space>
                </Col>
              )}

              <Col span={12}>
                <Space direction="vertical" size={4}>
                  <Text type="secondary">Account Created</Text>
                  <Text strong>{new Date(profile.createdAt).toLocaleDateString()}</Text>
                </Space>
              </Col>

              <Col span={12}>
                <Space direction="vertical" size={4}>
                  <Text type="secondary">Password Status</Text>
                  {profile.mustChangePassword ? (
                    <Tag color="warning">Must Change Password</Tag>
                  ) : (
                    <Tag color="success" icon={<CheckCircleOutlined />}>
                      Password Set
                    </Tag>
                  )}
                </Space>
              </Col>
            </Row>
          </Card>

          <Card
            title={
              <Space>
                <LockOutlined />
                Change Password
              </Space>
            }
            style={{ borderRadius: 12 }}
          >
            {changePasswordSuccess && (
              <Alert
                message={changePasswordSuccess}
                type="success"
                showIcon
                closable
                style={{ marginBottom: 16 }}
                onClose={() => setChangePasswordSuccess('')}
              />
            )}
            {changePasswordError && (
              <Alert
                message={changePasswordError}
                type="error"
                showIcon
                closable
                style={{ marginBottom: 16 }}
                onClose={() => setChangePasswordError('')}
              />
            )}

            <Form
              form={form}
              layout="vertical"
              onFinish={handleChangePassword}
              autoComplete="off"
            >
              <Form.Item
                label="Current Password"
                name="currentPassword"
                rules={[
                  { required: true, message: 'Please enter your current password' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter current password"
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item
                label="New Password"
                name="newPassword"
                rules={[
                  { required: true, message: 'Please enter your new password' },
                  { min: 6, message: 'Password must be at least 6 characters' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter new password"
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item
                label="Confirm New Password"
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Please confirm your new password' },
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
                  prefix={<LockOutlined />}
                  placeholder="Confirm new password"
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={changePasswordLoading}
                  size="large"
                  style={{
                    background: '#0a0d54',
                    borderColor: '#0a0d54',
                    borderRadius: 8,
                  }}
                >
                  Change Password
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Space>
      </div>
    </div>
  );
};
