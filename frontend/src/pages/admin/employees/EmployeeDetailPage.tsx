import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button, Tag, Spin, Alert, Row, Col, Descriptions, Space } from 'antd';
import { EditOutlined, HistoryOutlined, SafetyOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { getEmployeeDetails, EmployeeDetailResponse } from '../../../api/employeeManagementApi';

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

  const employmentTypeColor: Record<string, string> = {
    internal: '#52c41a',
    client: '#1890ff',
    contract: '#faad14',
    bench: '#f5222d'
  };

  if (loading) {
    return (
      <div className="p-6" style={{ background: '#dde4eb', minHeight: '100vh' }}>
        <Row justify="center">
          <Col span={24}>
            <Card className="shadow-md">
              <div className="text-center py-12">
                <Spin size="large" />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="p-6" style={{ background: '#dde4eb', minHeight: '100vh' }}>
        <Row justify="center">
          <Col span={24}>
            <Card className="shadow-md">
              <Alert
                message={error || 'Employee not found'}
                type="error"
                showIcon
                className="mb-4"
              />
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/admin/employees')}
              >
                Back to Employees
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div className="p-6" style={{ background: '#dde4eb', minHeight: '100vh' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            className="shadow-md"
            style={{
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#0a0d54', margin: 0 }}>
                Employee Details
              </h2>
              <Space>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/admin/employees/${employeeId}/assignment`)}
                  style={{ background: '#0a0d54', borderColor: '#0a0d54' }}
                >
                  Edit Assignment
                </Button>
                <Button
                  icon={<HistoryOutlined />}
                  onClick={() => navigate(`/admin/employees/${employeeId}/history`)}
                >
                  View History
                </Button>
                <Button
                  icon={<SafetyOutlined />}
                  onClick={() => navigate(`/orgadmin/employees/${employeeId}/permissions`)}
                >
                  Manage Permissions
                </Button>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/admin/employees')}
                >
                  Back
                </Button>
              </Space>
            </div>

            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Descriptions column={1} bordered size="middle">
                  <Descriptions.Item label="Email">
                    <strong>{employee.email}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Employment Type">
                    {employee.employmentType ? (
                      <Tag color={employmentTypeColor[employee.employmentType] || '#d9d9d9'}>
                        {employee.employmentType}
                      </Tag>
                    ) : (
                      '—'
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Department">
                    {employee.departmentName ? (
                      <Tag color="#1890ff">{employee.departmentName}</Tag>
                    ) : (
                      '—'
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Position">
                    {employee.positionName ? (
                      <Tag color="#52c41a">{employee.positionName}</Tag>
                    ) : (
                      '—'
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Reports To">
                    {employee.reportsToEmail || '—'}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col xs={24} lg={12}>
                <Descriptions column={1} bordered size="middle">
                  <Descriptions.Item label="Client ID">
                    {employee.clientId || '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Project ID">
                    {employee.projectId || '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Contract End Date">
                    {employee.contractEndDate || '—'}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
