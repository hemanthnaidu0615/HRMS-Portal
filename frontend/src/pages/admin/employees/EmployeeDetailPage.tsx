import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button, Tag, Skeleton, Alert, Typography, Space, Descriptions } from 'antd';
import { EditOutlined, HistoryOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import { getEmployeeDetails, EmployeeDetailResponse } from '../../../api/employeeManagementApi';

const { Title } = Typography;

export const EmployeeDetailPage = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<EmployeeDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (employeeId) {
      loadEmployee();
    }
  }, [employeeId]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const data = await getEmployeeDetails(employeeId!);
      setEmployee(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load employee details');
    } finally {
      setLoading(false);
    }
  };

  const employmentTypeColors: Record<string, string> = {
    internal: 'green',
    client: 'blue',
    contract: 'orange',
    bench: 'red'
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <Card
          style={{
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <Card
          style={{
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Alert message={error || 'Employee not found'} type="error" showIcon />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0 }}>Employee Details</Title>
            <Space>
              <Button
                icon={<EditOutlined />}
                onClick={() => navigate(`/admin/employees/${employeeId}/assignment`)}
                style={{ borderRadius: 8 }}
              >
                Edit Assignment
              </Button>
              <Button
                icon={<HistoryOutlined />}
                onClick={() => navigate(`/admin/employees/${employeeId}/history`)}
                style={{ borderRadius: 8 }}
              >
                View History
              </Button>
              <Button
                icon={<SafetyCertificateOutlined />}
                onClick={() => navigate(`/orgadmin/employees/${employeeId}/permissions`)}
                style={{ borderRadius: 8 }}
              >
                Manage Permissions
              </Button>
              <Button
                icon={<ArrowLeftOutlined />}
                type="primary"
                onClick={() => navigate('/admin/employees')}
                style={{
                  background: '#0a0d54',
                  borderColor: '#0a0d54',
                  borderRadius: 8
                }}
              >
                Back
              </Button>
            </Space>
          </div>

          <Descriptions bordered column={2}>
            <Descriptions.Item label="Email">{employee.email}</Descriptions.Item>
            <Descriptions.Item label="Employment Type">
              {employee.employmentType ? (
                <Tag color={employmentTypeColors[employee.employmentType] || 'default'} style={{ borderRadius: 6 }}>
                  {employee.employmentType}
                </Tag>
              ) : (
                '—'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Department">
              {employee.departmentName ? (
                <Tag color="blue" style={{ borderRadius: 6 }}>{employee.departmentName}</Tag>
              ) : (
                '—'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Position">
              {employee.positionName ? (
                <Tag color="green" style={{ borderRadius: 6 }}>{employee.positionName}</Tag>
              ) : (
                '—'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Reports To">{employee.reportsToEmail || '—'}</Descriptions.Item>
            <Descriptions.Item label="Client ID">{employee.clientId || '—'}</Descriptions.Item>
            <Descriptions.Item label="Project ID">{employee.projectId || '—'}</Descriptions.Item>
            <Descriptions.Item label="Contract End Date">{employee.contractEndDate || '—'}</Descriptions.Item>
          </Descriptions>
        </Space>
      </Card>
    </div>
  );
};
