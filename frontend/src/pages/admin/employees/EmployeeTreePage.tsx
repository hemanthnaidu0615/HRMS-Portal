import { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Tree, TreeNode } from 'primereact/tree';
import { Skeleton } from 'primereact/skeleton';
import { getEmployeeTree, EmployeeTreeNodeResponse } from '../../../api/employeeManagementApi';

export const EmployeeTreePage = () => {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
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

  const toTreeNode = (node: EmployeeTreeNodeResponse): TreeNode => {
    const label = (
      <div>
        <div className="font-semibold">{node.email}</div>
        <div className="text-xs text-gray-500">
          {node.positionName && <span className="mr-2">{node.positionName}</span>}
          {node.departmentName && <span>{node.departmentName}</span>}
        </div>
      </div>
    );

    return {
      key: node.employeeId,
      label,
      data: node,
      children: (node.reports || []).map(toTreeNode)
    };
  };

  const handleNodeSelect = (e: any) => {
    if (e.node && e.node.data) {
      setSelectedNode(e.node.data);
    }
  };

  const header = (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Employee Reporting Tree</h2>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <Card header={header}>
        {error && (
          <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {loading ? (
          <Skeleton height="400px" />
        ) : (
          <div className="space-y-4">
            <Tree
              value={treeData}
              selectionMode="single"
              onSelect={handleNodeSelect}
              className="w-full"
            />
            {selectedNode && (
              <Card title="Selected Employee" className="mt-4">
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">Email:</span> {selectedNode.email}
                  </div>
                  <div>
                    <span className="font-semibold">Position:</span> {selectedNode.positionName || '—'}
                  </div>
                  <div>
                    <span className="font-semibold">Department:</span> {selectedNode.departmentName || '—'}
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
