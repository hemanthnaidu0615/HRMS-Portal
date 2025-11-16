import { useEffect, useState } from 'react';
import { Card, Tree, Skeleton, Alert, Typography, Space, Descriptions } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { ApartmentOutlined } from '@ant-design/icons';
import { getEmployeeTree, EmployeeTreeNodeResponse } from '../../../api/employeeManagementApi';

const { Title, Text } = Typography;

export const EmployeeTreePage = () => {
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedNode, setSelectedNode] = useState<EmployeeTreeNodeResponse | null>(null);

  useEffect(() => {
    loadTree();
  }, []);

  const loadTree = async () => {
    try {
      setLoading(true);
      const data = await getEmployeeTree();
      const nodes = data.map(toTreeNode);
      setTreeData(nodes);
      setError('');
    } catch (err: any) {
      setError('Failed to load employee tree');
    } finally {
      setLoading(false);
    }
  };

  const toTreeNode = (node: EmployeeTreeNodeResponse): DataNode => {
    return {
      key: node.employeeId,
      title: (
        <div>
          <div style={{ fontWeight: 600 }}>{node.email}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {node.positionName && <span style={{ marginRight: 8 }}>{node.positionName}</span>}
            {node.departmentName && <span>{node.departmentName}</span>}
          </div>
        </div>
      ),
      data: node,
      children: (node.reports || []).map(toTreeNode),
      icon: <ApartmentOutlined />
    } as DataNode & { data: EmployeeTreeNodeResponse };
  };

  const handleNodeSelect = (selectedKeys: React.Key[], info: any) => {
    if (info.node && info.node.data) {
      setSelectedNode(info.node.data);
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0 }}>Employee Reporting Tree</Title>
          </div>

          {error && (
            <Alert message={error} type="error" showIcon closable />
          )}

          {loading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : (
            <div>
              <Tree
                showLine
                showIcon
                treeData={treeData}
                defaultExpandAll
                onSelect={handleNodeSelect}
                style={{
                  background: '#f5f5f5',
                  padding: 16,
                  borderRadius: 8
                }}
              />
              {selectedNode && (
                <Card
                  title="Selected Employee"
                  style={{
                    marginTop: 24,
                    borderRadius: 8,
                    background: '#f9f9f9'
                  }}
                >
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="Email">{selectedNode.email}</Descriptions.Item>
                    <Descriptions.Item label="Position">{selectedNode.positionName || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Department">{selectedNode.departmentName || '—'}</Descriptions.Item>
                  </Descriptions>
                </Card>
              )}
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};
