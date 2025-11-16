import { useEffect, useState } from 'react';
import { Card, Tree, Spin, Alert, Row, Col, Descriptions } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { getEmployeeTree, EmployeeTreeNodeResponse } from '../../../api/employeeManagementApi';

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

  const toTreeNode = (node: EmployeeTreeNodeResponse): DataNode & { nodeData?: EmployeeTreeNodeResponse } => {
    return {
      key: node.employeeId,
      title: (
        <div>
          <div className="font-semibold">{node.email}</div>
          {(node.positionName || node.departmentName) && (
            <div className="text-xs text-gray-500">
              {node.positionName && <span className="mr-2">{node.positionName}</span>}
              {node.departmentName && <span>{node.departmentName}</span>}
            </div>
          )}
        </div>
      ),
      children: (node.reports || []).map(toTreeNode),
      nodeData: node,
    };
  };

  const handleSelect = (_: React.Key[], info: any) => {
    if (info.node && info.node.nodeData) {
      setSelectedNode(info.node.nodeData);
    }
  };

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
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#0a0d54' }}>
              Employee Reporting Tree
            </h2>

            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                closable
                onClose={() => setError('')}
                className="mb-4"
              />
            )}

            {loading ? (
              <div className="text-center py-12">
                <Spin size="large" />
              </div>
            ) : (
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={14}>
                  <Tree
                    treeData={treeData}
                    onSelect={handleSelect}
                    defaultExpandAll
                    showLine
                    style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e0e0e0' }}
                  />
                </Col>
                {selectedNode && (
                  <Col xs={24} lg={10}>
                    <Card
                      title="Selected Employee"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                      }}
                    >
                      <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Email">
                          <strong>{selectedNode.email}</strong>
                        </Descriptions.Item>
                        <Descriptions.Item label="Position">
                          {selectedNode.positionName || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Department">
                          {selectedNode.departmentName || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Reports">
                          {selectedNode.reports?.length || 0} direct report(s)
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                )}
              </Row>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
