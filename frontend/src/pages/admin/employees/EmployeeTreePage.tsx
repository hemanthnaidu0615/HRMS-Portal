import { useEffect, useState } from 'react';
import { Card, Alert, Typography, Space, Skeleton, Empty, Tag, Input, Button, message, Tooltip } from 'antd';
import { TeamOutlined, SearchOutlined, DownloadOutlined, FullscreenOutlined, ZoomInOutlined, ZoomOutOutlined, ExpandOutlined, CompressOutlined } from '@ant-design/icons';
import { getEmployeeTree, EmployeeTreeNodeResponse } from '../../../api/employeeManagementApi';
import './OrgChart.css';

const { Title, Text } = Typography;

export const EmployeeTreePage = () => {
  const [treeData, setTreeData] = useState<EmployeeTreeNodeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [expandAll, setExpandAll] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

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

  const getAvatarColor = (index: number) => {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    ];
    return colors[index % colors.length];
  };

  const handleZoomIn = () => {
    if (zoomLevel < 2) {
      setZoomLevel(prev => prev + 0.1);
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 0.5) {
      setZoomLevel(prev => prev - 0.1);
    }
  };

  const handleExport = () => {
    message.info('Export feature: Capture the chart as image using browser screenshot tools');
  };

  const isHighlighted = (employee: EmployeeTreeNodeResponse) => {
    if (!searchText) return false;
    const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim().toLowerCase();
    const email = employee.email.toLowerCase();
    const searchLower = searchText.toLowerCase();
    return fullName.includes(searchLower) || email.includes(searchLower);
  };

  const renderEmployeeNode = (employee: EmployeeTreeNodeResponse, index: number = 0) => {
    const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
    const displayName = fullName || employee.email;
    const initials = fullName
      ? `${employee.firstName?.[0] || ''}${employee.lastName?.[0] || ''}`.toUpperCase()
      : employee.email.substring(0, 2).toUpperCase();

    const highlighted = isHighlighted(employee);

    return (
      <div key={employee.employeeId} className="org-chart-node-wrapper">
        <div
          className="org-chart-node"
          style={{
            border: highlighted ? '2px solid #52c41a' : '1px solid #e8e8e8',
            boxShadow: highlighted ? '0 4px 12px rgba(82, 196, 26, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
            background: highlighted ? '#f6ffed' : '#fff',
            transform: highlighted ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 0.3s',
          }}
        >
          <div className="employee-avatar" style={{ background: getAvatarColor(index) }}>
            {initials}
          </div>
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
              {employee.reports.map((report, idx) => renderEmployeeNode(report, index + idx + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        padding: fullscreen ? 0 : 24,
        minHeight: '100vh',
        background: '#f0f2f5',
        position: fullscreen ? 'fixed' : 'relative',
        top: fullscreen ? 0 : 'auto',
        left: fullscreen ? 0 : 'auto',
        right: fullscreen ? 0 : 'auto',
        bottom: fullscreen ? 0 : 'auto',
        zIndex: fullscreen ? 9999 : 'auto',
      }}
    >
      <Card
        style={{
          borderRadius: fullscreen ? 0 : 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          height: fullscreen ? '100vh' : 'auto',
          overflow: 'auto',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header with Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <TeamOutlined style={{ fontSize: '24px', color: '#0a0d54' }} />
              <Title level={3} style={{ margin: 0 }}>Organization Chart</Title>
            </div>
            <Space wrap>
              <Input
                placeholder="Search employees..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 200, borderRadius: 6 }}
                allowClear
              />
              <Tooltip title="Zoom Out">
                <Button
                  icon={<ZoomOutOutlined />}
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.5}
                  style={{ borderRadius: 6 }}
                />
              </Tooltip>
              <Text style={{ minWidth: 50, textAlign: 'center' }}>{Math.round(zoomLevel * 100)}%</Text>
              <Tooltip title="Zoom In">
                <Button
                  icon={<ZoomInOutlined />}
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 2}
                  style={{ borderRadius: 6 }}
                />
              </Tooltip>
              <Tooltip title={expandAll ? 'Collapse All' : 'Expand All'}>
                <Button
                  icon={expandAll ? <CompressOutlined /> : <ExpandOutlined />}
                  onClick={() => setExpandAll(!expandAll)}
                  style={{ borderRadius: 6 }}
                >
                  {expandAll ? 'Collapse' : 'Expand'}
                </Button>
              </Tooltip>
              <Tooltip title="Export Chart">
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleExport}
                  style={{ borderRadius: 6 }}
                >
                  Export
                </Button>
              </Tooltip>
              <Tooltip title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
                <Button
                  type="primary"
                  icon={<FullscreenOutlined />}
                  onClick={() => setFullscreen(!fullscreen)}
                  style={{ background: '#0a0d54', borderColor: '#0a0d54', borderRadius: 6 }}
                >
                  {fullscreen ? 'Exit' : 'Fullscreen'}
                </Button>
              </Tooltip>
            </Space>
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
            <div
              className="org-chart-container"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top center',
                transition: 'transform 0.3s',
                padding: '20px',
              }}
            >
              {treeData.map((rootEmployee, idx) => renderEmployeeNode(rootEmployee, idx))}
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};
