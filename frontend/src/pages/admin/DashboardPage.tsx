import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Skeleton, Alert, Tag, Progress } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { getEmployees, EmployeeSummaryResponse } from '../../api/employeeManagementApi';

const { Title } = Typography;

interface DepartmentStats {
  name: string;
  count: number;
  percentage: number;
}

interface EmploymentTypeStats {
  type: string;
  count: number;
  color: string;
}

export const DashboardPage = () => {
  const [employees, setEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await getEmployees();
      setEmployees(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const totalEmployees = employees.length;
  const onProbation = employees.filter(emp => emp.isProbation).length;

  // Calculate department distribution
  const departmentMap = new Map<string, number>();
  employees.forEach(emp => {
    if (emp.departmentName) {
      departmentMap.set(emp.departmentName, (departmentMap.get(emp.departmentName) || 0) + 1);
    }
  });

  const departmentStats: DepartmentStats[] = Array.from(departmentMap.entries())
    .map(([name, count]) => ({
      name,
      count,
      percentage: (count / totalEmployees) * 100,
    }))
    .sort((a, b) => b.count - a.count);

  // Calculate employment type distribution
  const employmentTypeMap = new Map<string, number>();
  employees.forEach(emp => {
    const type = emp.employmentType || 'Not Set';
    employmentTypeMap.set(type, (employmentTypeMap.get(type) || 0) + 1);
  });

  const employmentTypeColors: Record<string, string> = {
    internal: '#52c41a',
    client: '#1890ff',
    contract: '#fa8c16',
    bench: '#f5222d',
    'Not Set': '#d9d9d9',
  };

  const employmentTypeStats: EmploymentTypeStats[] = Array.from(employmentTypeMap.entries())
    .map(([type, count]) => ({
      type,
      count,
      color: employmentTypeColors[type] || '#d9d9d9',
    }))
    .sort((a, b) => b.count - a.count);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
          <p style={{ color: '#666', marginTop: 8 }}>Overview of your organization</p>
        </div>

        {error && (
          <Alert message={error} type="error" showIcon closable />
        )}

        {/* Key Metrics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Employees"
                value={totalEmployees}
                prefix={<UserOutlined style={{ color: '#0a0d54' }} />}
                valueStyle={{ color: '#0a0d54' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="On Probation"
                value={onProbation}
                prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
                valueStyle={{ color: '#fa8c16' }}
                suffix={totalEmployees > 0 ? `/ ${totalEmployees}` : ''}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Departments"
                value={departmentMap.size}
                prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Active Employees"
                value={totalEmployees - onProbation}
                prefix={<SafetyCertificateOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Detailed Stats */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card
              title="Employees by Department"
              style={{ borderRadius: 12, height: '100%' }}
            >
              {departmentStats.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                  No departments assigned yet
                </div>
              ) : (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {departmentStats.map(dept => (
                    <div key={dept.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontWeight: 500 }}>{dept.name}</span>
                        <span style={{ color: '#666' }}>
                          {dept.count} ({dept.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress
                        percent={dept.percentage}
                        showInfo={false}
                        strokeColor={{
                          '0%': '#0a0d54',
                          '100%': '#1890ff',
                        }}
                      />
                    </div>
                  ))}
                </Space>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title="Employment Type Distribution"
              style={{ borderRadius: 12, height: '100%' }}
            >
              {employmentTypeStats.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                  No employment types set
                </div>
              ) : (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {employmentTypeStats.map(type => (
                    <div key={type.type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            background: type.color,
                          }}
                        />
                        <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>
                          {type.type}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Tag color={type.color} style={{ margin: 0 }}>
                          {type.count}
                        </Tag>
                        <span style={{ color: '#666', minWidth: '50px', textAlign: 'right' }}>
                          {((type.count / totalEmployees) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </Space>
              )}
            </Card>
          </Col>
        </Row>

        {/* Probation Details */}
        {onProbation > 0 && (
          <Card title="Probation Overview" style={{ borderRadius: 12 }}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div style={{ background: '#fff7e6', padding: 16, borderRadius: 8, border: '1px solid #ffd591' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ClockCircleOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>
                        {onProbation} {onProbation === 1 ? 'employee' : 'employees'} currently on probation
                      </div>
                      <div style={{ color: '#666', marginTop: 4 }}>
                        {((onProbation / totalEmployees) * 100).toFixed(1)}% of total workforce
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        )}
      </Space>
    </div>
  );
};
