import React, { useEffect, useState } from 'react';
import { Card, Typography, Space, Tag, Avatar, Spin, Alert, Button, Empty } from 'antd';
import {
  UserOutlined, TeamOutlined, ApartmentOutlined, ArrowLeftOutlined,
  IdcardOutlined, MailOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { orgadminApi, type OrgChartNode } from '../../api/orgadminApi';

const { Title, Text } = Typography;

interface TreeNodeProps {
  node: OrgChartNode;
  children?: OrgChartNode[];
  onNodeClick: (nodeId: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, children, onNodeClick }) => {
  const fullName = `${node.firstName || ''} ${node.lastName || ''}`.trim() || node.email;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '10px' }}>
      <Card
        hoverable
        onClick={() => onNodeClick(node.id)}
        style={{
          width: 280,
          borderRadius: 12,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '2px solid #f0f0f0',
          transition: 'all 0.3s',
        }}
        bodyStyle={{ padding: 16 }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar size={48} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {fullName}
              </div>
              {node.employeeCode && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <IdcardOutlined /> {node.employeeCode}
                </Text>
              )}
            </div>
          </div>

          {node.positionName && (
            <Tag color="blue" style={{ borderRadius: 6 }}>
              {node.positionName}
            </Tag>
          )}

          {node.departmentName && (
            <Tag color="green" icon={<ApartmentOutlined />} style={{ borderRadius: 6 }}>
              {node.departmentName}
            </Tag>
          )}

          {node.directReportCount > 0 && (
            <div style={{ fontSize: 12, color: '#666' }}>
              <TeamOutlined /> {node.directReportCount} direct {node.directReportCount === 1 ? 'report' : 'reports'}
            </div>
          )}
        </Space>
      </Card>

      {children && children.length > 0 && (
        <>
          <div style={{ width: 2, height: 30, backgroundColor: '#d9d9d9' }} />
          <div style={{ display: 'flex', position: 'relative' }}>
            {children.length > 1 && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  width: `calc(${(children.length - 1) * 300}px)`,
                  height: 2,
                  backgroundColor: '#d9d9d9',
                  transform: 'translateX(-50%)',
                }}
              />
            )}
            {children.map((child, idx) => (
              <div key={child.id} style={{ position: 'relative' }}>
                {children.length > 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '50%',
                      width: 2,
                      height: 30,
                      backgroundColor: '#d9d9d9',
                      transform: 'translateX(-50%)',
                    }}
                  />
                )}
                <TreeNode
                  node={child}
                  children={buildChildren(child.id)}
                  onNodeClick={onNodeClick}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  function buildChildren(parentId: string): OrgChartNode[] | undefined {
    const allNodes = (window as any).__orgChartNodes || [];
    return allNodes.filter((n: OrgChartNode) => n.reportsToId === parentId);
  }
};

export const OrganizationChartPage: React.FC = () => {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState<{ nodes: OrgChartNode[]; rootEmployeeIds: string[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrgChart();
  }, []);

  const loadOrgChart = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await orgadminApi.getOrganizationChart();
      setChartData({ nodes: data.nodes, rootEmployeeIds: data.rootEmployeeIds });
      (window as any).__orgChartNodes = data.nodes; // Store for tree building
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load organization chart');
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    navigate(`/admin/employees/${nodeId}`);
  };

  const buildTree = (rootId: string): OrgChartNode | null => {
    if (!chartData) return null;
    return chartData.nodes.find(n => n.id === rootId) || null;
  };

  const getDirectReports = (parentId: string): OrgChartNode[] => {
    if (!chartData) return [];
    return chartData.nodes.filter(n => n.reportsToId === parentId);
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" tip="Loading organization chart..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  if (!chartData || chartData.nodes.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <Empty
            description="No employees found in the organization"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0, marginBottom: 4 }}>
              <ApartmentOutlined style={{ marginRight: 12 }} />
              Organization Chart
            </Title>
            <Text type="secondary" style={{ fontSize: 15 }}>
              Hierarchical view of reporting relationships ({chartData.nodes.length} employees)
            </Text>
          </div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/admin/employees')}
            size="large"
          >
            Back to Employees
          </Button>
        </div>

        <div
          style={{
            overflowX: 'auto',
            overflowY: 'auto',
            padding: 40,
            backgroundColor: '#fff',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', gap: 40 }}>
              {chartData.rootEmployeeIds.map(rootId => {
                const rootNode = buildTree(rootId);
                if (!rootNode) return null;
                return (
                  <TreeNode
                    key={rootId}
                    node={rootNode}
                    children={getDirectReports(rootId)}
                    onNodeClick={handleNodeClick}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
