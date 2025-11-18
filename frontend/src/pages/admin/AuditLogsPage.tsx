import React, { useEffect, useState } from 'react';
import {
  Card, Table, Tag, Typography, Space, Select, Button, Tooltip, Alert, Input, Pagination,
  Descriptions, Modal, Row, Col, message
} from 'antd';
import {
  HistoryOutlined, FilterOutlined, ReloadOutlined, EyeOutlined,
  CheckCircleOutlined, CloseCircleOutlined, UserOutlined, GlobalOutlined,
  ClockCircleOutlined, FileTextOutlined, ExportOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { auditLogApi, type AuditLogEntry } from '../../api/auditLogApi';
import { exportToExcelCSV, formatDateForExport } from '../../utils/exportUtils';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Search } = Input;

export const AuditLogsPage: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [actionType, setActionType] = useState<string | undefined>(undefined);
  const [entityType, setEntityType] = useState<string | undefined>(undefined);
  const [actionTypes, setActionTypes] = useState<string[]>([]);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);

  // Detail modal
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadAuditLogs();
  }, [currentPage, pageSize, actionType, entityType]);

  const loadFilterOptions = async () => {
    try {
      const [actions, entities] = await Promise.all([
        auditLogApi.getActionTypes(),
        auditLogApi.getEntityTypes(),
      ]);
      setActionTypes(actions);
      setEntityTypes(entities);
    } catch (err: any) {
      console.error('Failed to load filter options:', err);
    }
  };

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await auditLogApi.getAuditLogs(currentPage, pageSize, actionType, entityType);
      setAuditLogs(data.content);
      setTotalElements(data.totalElements);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleActionTypeChange = (value: string | undefined) => {
    setActionType(value);
    setCurrentPage(0); // Reset to first page
  };

  const handleEntityTypeChange = (value: string | undefined) => {
    setEntityType(value);
    setCurrentPage(0); // Reset to first page
  };

  const handleClearFilters = () => {
    setActionType(undefined);
    setEntityType(undefined);
    setCurrentPage(0);
  };

  const handleViewDetails = (record: AuditLogEntry) => {
    setSelectedLog(record);
    setDetailModalVisible(true);
  };

  const handleExportToCSV = () => {
    if (auditLogs.length === 0) {
      message.warning('No audit logs to export');
      return;
    }

    // Define field mapping for export
    const fieldMapping: Record<string, string | ((log: AuditLogEntry) => any)> = {
      'Timestamp': (log: AuditLogEntry) => formatDateForExport(log.performedAt),
      'Action Type': 'actionType',
      'Entity Type': 'entityType',
      'Entity ID': 'entityId',
      'Status': 'status',
      'Performed By': (log: AuditLogEntry) => log.performedBy?.email || 'System',
      'IP Address': 'ipAddress',
      'Old Value': 'oldValue',
      'New Value': 'newValue',
      'Error Message': 'errorMessage',
      'Metadata': 'metadata',
    };

    const timestamp = new Date().toISOString().split('T')[0];
    const filterInfo = actionType || entityType ? `-filtered` : '';
    const filename = `audit-logs-${timestamp}${filterInfo}.csv`;

    exportToExcelCSV(auditLogs, filename, fieldMapping);
    message.success(`Exported ${auditLogs.length} audit logs to CSV`);
  };

  const getActionTypeColor = (actionType: string): string => {
    if (actionType.includes('CREATE')) return 'green';
    if (actionType.includes('UPDATE')) return 'blue';
    if (actionType.includes('DELETE')) return 'red';
    if (actionType.includes('GRANT') || actionType.includes('ASSIGN')) return 'cyan';
    if (actionType.includes('REVOKE') || actionType.includes('REMOVE')) return 'orange';
    if (actionType.includes('APPROVE')) return 'green';
    if (actionType.includes('REJECT')) return 'red';
    if (actionType.includes('ESCALATION')) return 'magenta';
    return 'default';
  };

  const getActionTypeIcon = (actionType: string): React.ReactNode => {
    if (actionType.includes('DELETE') || actionType.includes('REVOKE') || actionType.includes('REMOVE')) {
      return <CloseCircleOutlined />;
    }
    if (actionType.includes('CREATE') || actionType.includes('GRANT') || actionType.includes('APPROVE')) {
      return <CheckCircleOutlined />;
    }
    return <FileTextOutlined />;
  };

  const columns: ColumnsType<AuditLogEntry> = [
    {
      title: 'Time',
      dataIndex: 'performedAt',
      key: 'performedAt',
      width: 180,
      render: (performedAt: string) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 13 }}>
            {dayjs(performedAt).format('MMM DD, YYYY')}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(performedAt).format('HH:mm:ss')} ({dayjs(performedAt).fromNow()})
          </Text>
        </Space>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'actionType',
      key: 'actionType',
      width: 200,
      render: (actionType: string, record: AuditLogEntry) => (
        <Space>
          <Tag color={getActionTypeColor(actionType)} icon={getActionTypeIcon(actionType)}>
            {actionType.replace(/_/g, ' ')}
          </Tag>
          {record.status === 'FAILED' && (
            <Tooltip title={record.errorMessage || 'Action failed'}>
              <Tag color="error" icon={<CloseCircleOutlined />}>FAILED</Tag>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Entity',
      key: 'entity',
      width: 200,
      render: (_, record: AuditLogEntry) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 13 }}>{record.entityType || 'N/A'}</Text>
          {record.entityId && (
            <Text type="secondary" style={{ fontSize: 11 }} copyable>
              ID: {record.entityId.substring(0, 8)}...
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Performed By',
      dataIndex: 'performedBy',
      key: 'performedBy',
      width: 220,
      render: (performedBy: AuditLogEntry['performedBy']) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <Text style={{ fontSize: 13 }}>{performedBy?.email || 'System'}</Text>
        </Space>
      ),
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 140,
      render: (ipAddress: string) => (
        ipAddress ? (
          <Space>
            <GlobalOutlined style={{ color: '#52c41a' }} />
            <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>{ipAddress}</Text>
          </Space>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>N/A</Text>
        )
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record: AuditLogEntry) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <div style={{ maxWidth: 1600, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16
          }}>
            <div>
              <Title level={2} style={{ margin: 0, marginBottom: 4 }}>
                <HistoryOutlined style={{ marginRight: 12 }} />
                Audit Logs
              </Title>
              <Text type="secondary" style={{ fontSize: 15 }}>
                Complete audit trail of all actions in your organization
              </Text>
            </div>
            <Space>
              <Button
                icon={<ExportOutlined />}
                onClick={handleExportToCSV}
                disabled={auditLogs.length === 0}
                size="large"
              >
                Export CSV
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadAuditLogs}
                size="large"
              >
                Refresh
              </Button>
            </Space>
          </div>

          {/* Info Banner */}
          <Alert
            message="Audit Trail"
            description="This page shows a complete history of all actions performed in your organization. Use filters to narrow down specific actions or entities."
            type="info"
            showIcon
            closable
            icon={<HistoryOutlined />}
            style={{ borderRadius: 8 }}
          />
        </div>

        {/* Filters */}
        <Card
          style={{ marginBottom: 24, borderRadius: 12 }}
          bodyStyle={{ padding: 16 }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={10}>
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <Text strong style={{ fontSize: 13 }}>Action Type</Text>
                <Select
                  placeholder="Filter by action type"
                  style={{ width: '100%' }}
                  allowClear
                  value={actionType}
                  onChange={handleActionTypeChange}
                  options={actionTypes.map(type => ({ label: type.replace(/_/g, ' '), value: type }))}
                  showSearch
                  optionFilterProp="label"
                />
              </Space>
            </Col>
            <Col xs={24} sm={10}>
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <Text strong style={{ fontSize: 13 }}>Entity Type</Text>
                <Select
                  placeholder="Filter by entity type"
                  style={{ width: '100%' }}
                  allowClear
                  value={entityType}
                  onChange={handleEntityTypeChange}
                  options={entityTypes.map(type => ({ label: type, value: type }))}
                  showSearch
                  optionFilterProp="label"
                />
              </Space>
            </Col>
            <Col xs={24} sm={4}>
              <Button
                block
                onClick={handleClearFilters}
                disabled={!actionType && !entityType}
                style={{ marginTop: 20 }}
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card
          bordered={false}
          style={{
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
              style={{ marginBottom: 16 }}
            />
          )}

          <Table
            columns={columns}
            dataSource={auditLogs}
            rowKey="id"
            loading={loading}
            pagination={false}
            scroll={{ x: 1200 }}
            locale={{
              emptyText: (
                <div style={{ padding: '40px 0' }}>
                  <HistoryOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                  <div>
                    <Text type="secondary">No audit logs found</Text>
                  </div>
                </div>
              ),
            }}
          />

          {/* Custom Pagination */}
          {totalElements > 0 && (
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Space>
                <Text type="secondary">
                  Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} logs
                </Text>
                <Pagination
                  current={currentPage + 1}
                  total={totalElements}
                  pageSize={pageSize}
                  onChange={(page, size) => {
                    setCurrentPage(page - 1);
                    setPageSize(size);
                  }}
                  showSizeChanger
                  pageSizeOptions={['20', '50', '100', '200']}
                />
              </Space>
            </div>
          )}
        </Card>

        {/* Detail Modal */}
        <Modal
          title={
            <Space>
              <HistoryOutlined />
              <span>Audit Log Details</span>
            </Space>
          }
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Close
            </Button>
          ]}
          width={700}
        >
          {selectedLog && (
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Action Type">
                <Tag color={getActionTypeColor(selectedLog.actionType)} icon={getActionTypeIcon(selectedLog.actionType)}>
                  {selectedLog.actionType.replace(/_/g, ' ')}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={selectedLog.status === 'SUCCESS' ? 'success' : 'error'}>
                  {selectedLog.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Entity Type">{selectedLog.entityType || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Entity ID">
                <Text copyable>{selectedLog.entityId || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Performed By">
                {selectedLog.performedBy?.email || 'System'}
              </Descriptions.Item>
              <Descriptions.Item label="Performed At">
                {dayjs(selectedLog.performedAt).format('MMMM DD, YYYY HH:mm:ss')}
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ({dayjs(selectedLog.performedAt).fromNow()})
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="IP Address">{selectedLog.ipAddress || 'N/A'}</Descriptions.Item>
              {selectedLog.oldValue && (
                <Descriptions.Item label="Old Value">
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 12 }}>
                    {selectedLog.oldValue}
                  </pre>
                </Descriptions.Item>
              )}
              {selectedLog.newValue && (
                <Descriptions.Item label="New Value">
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 12 }}>
                    {selectedLog.newValue}
                  </pre>
                </Descriptions.Item>
              )}
              {selectedLog.errorMessage && (
                <Descriptions.Item label="Error Message">
                  <Text type="danger">{selectedLog.errorMessage}</Text>
                </Descriptions.Item>
              )}
              {selectedLog.metadata && (
                <Descriptions.Item label="Metadata">
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 11, background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                    {JSON.stringify(JSON.parse(selectedLog.metadata), null, 2)}
                  </pre>
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Modal>
      </div>
    </div>
  );
};
