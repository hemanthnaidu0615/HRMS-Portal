import { useEffect, useState } from 'react';
import { Card, Alert, Typography, Space, Skeleton, Empty, Tag } from 'antd';
import { TeamOutlined, UserOutlined } from '@ant-design/icons';
import { getEmployeeTree, EmployeeTreeNodeResponse } from '../../../api/employeeManagementApi';
import './OrgChart.css';

const { Title } = Typography;

export const OrgChartPage = () => {
  const [treeData, setTreeData] = useState<EmployeeTreeNodeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTree();
  }, []);

  const loadTree = async () => {
    try {
      setLoading(true);
      const data = await getEmployeeTree();
      setTreeData(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load organization chart');
    } finally {
      setLoading(false);
    }
  };

  const renderEmployeeNode = (employee: EmployeeTreeNodeResponse) => {
    const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
    const displayName = fullName || employee.email;
    const initials = fullName
      ? `${employee.firstName?.[0] || ''}${employee.lastName?.[0] || ''}`.toUpperCase()
      : employee.email.substring(0, 2).toUpperCase();

    return (
      <div key={employee.employeeId} className="org-chart-node-wrapper">
        <div className="org-chart-node">
          <div className="employee-avatar">{initials}</div>
          <div className="employee-info">
            <div className="employee-name">{displayName}</div>
            {employee.positionName && (
              <Tag color="blue" style={{ fontSize: '11px', marginTop: '4px' }}>
                {employee.positionName}
              </Tag>
            )}
            {employee.departmentName && (
              <div className="employee-department">{employee.departmentName}</div>
            )}
          </div>
        </div>

        {employee.reports && employee.reports.length > 0 && (
          <div className="org-chart-children">
            <div className="org-chart-line"></div>
            <div className="org-chart-reports">
              {employee.reports.map(report => renderEmployeeNode(report))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#f0f2f5' }}>
      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <TeamOutlined style={{ fontSize: '24px', color: '#0a0d54' }} />
            <Title level={3} style={{ margin: 0 }}>Organization Chart</Title>
          </div>

          {error && (
            <Alert message={error} type="error" showIcon closable />
          )}

          {loading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : treeData.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No employees in the organization yet"
            />
          ) : (
            <div className="org-chart-container">
              {treeData.map(rootEmployee => renderEmployeeNode(rootEmployee))}
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};
