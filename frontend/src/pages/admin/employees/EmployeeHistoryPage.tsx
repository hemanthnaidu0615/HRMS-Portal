import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Table, Button, Alert, Typography, Space, Skeleton, Timeline, Tag, Segmented, Select, DatePicker, Row, Col, Empty } from 'antd';
import { ArrowLeftOutlined, HistoryOutlined, EditOutlined, SwapOutlined, ClockCircleOutlined, UserOutlined, DownloadOutlined, FilterOutlined } from '@ant-design/icons';
import { getEmployeeHistory, EmployeeHistoryResponse } from '../../../api/employeeManagementApi';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const EmployeeHistoryPage = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const [history, setHistory] = useState<EmployeeHistoryResponse[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<EmployeeHistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');
  const [fieldFilter, setFieldFilter] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  useEffect(() => {
    if (employeeId) {
      loadHistory();
    }
  }, [employeeId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getEmployeeHistory(employeeId!);
      setHistory(data);
      setFilteredHistory(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [fieldFilter, dateRange, history]);

  const applyFilters = () => {
    let filtered = [...history];

    if (fieldFilter) {
      filtered = filtered.filter(item => item.changedField === fieldFilter);
    }

    if (dateRange && dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(item => {
        const itemDate = dayjs(item.changedAt);
        return itemDate.isAfter(dateRange[0]) && itemDate.isBefore(dateRange[1]);
      });
    }

    setFilteredHistory(filtered);
  };

  const uniqueFields = Array.from(new Set(history.map(item => item.changedField))).sort();

  const handleExport = () => {
    const headers = ['Field', 'Old Value', 'New Value', 'Changed By', 'Changed At'];
    const rows = filteredHistory.map(item => [
      item.changedField,
      item.oldValue || '',
      item.newValue || '',
      item.changedByEmail,
      new Date(item.changedAt).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row.map(cell => {
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `employee_history_${employeeId}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      title: 'Field',
      dataIndex: 'changedField',
      key: 'changedField',
      sorter: (a: EmployeeHistoryResponse, b: EmployeeHistoryResponse) =>
        a.changedField.localeCompare(b.changedField),
      render: (text: string) => (
        <Space>
          <HistoryOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Old Value',
      dataIndex: 'oldValue',
      key: 'oldValue',
      render: (text: string) => text || '—',
    },
    {
      title: 'New Value',
      dataIndex: 'newValue',
      key: 'newValue',
      render: (text: string) => text || '—',
    },
    {
      title: 'Changed By',
      dataIndex: 'changedByEmail',
      key: 'changedByEmail',
    },
    {
      title: 'Changed At',
      dataIndex: 'changedAt',
      key: 'changedAt',
      sorter: (a: EmployeeHistoryResponse, b: EmployeeHistoryResponse) =>
        new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime(),
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <Title level={3} style={{ margin: 0 }}>Employee History</Title>
              <Text type="secondary">{filteredHistory.length} change{filteredHistory.length !== 1 ? 's' : ''} recorded</Text>
            </div>
            <Space wrap>
              <Segmented
                options={[
                  { label: 'Timeline', value: 'timeline', icon: <ClockCircleOutlined /> },
                  { label: 'Table', value: 'table', icon: <HistoryOutlined /> },
                ]}
                value={viewMode}
                onChange={(value) => setViewMode(value as 'timeline' | 'table')}
              />
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExport}
                disabled={filteredHistory.length === 0}
                style={{ borderRadius: 8 }}
              >
                Export
              </Button>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(`/admin/employees/${employeeId}`)}
                type="primary"
                style={{ background: '#0a0d54', borderColor: '#0a0d54', borderRadius: 8 }}
              >
                Back
              </Button>
            </Space>
          </div>

          {/* Filters */}
          <Card size="small" style={{ background: '#f5f5f5', borderRadius: 8 }}>
            <Row gutter={16}>
              <Col xs={24} sm={12} lg={8}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text strong>Field Filter</Text>
                  <Select
                    placeholder="All Fields"
                    value={fieldFilter}
                    onChange={setFieldFilter}
                    allowClear
                    style={{ width: '100%' }}
                  >
                    {uniqueFields.map(field => (
                      <Select.Option key={field} value={field}>
                        {field}
                      </Select.Option>
                    ))}
                  </Select>
                </Space>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text strong>Date Range</Text>
                  <RangePicker
                    value={dateRange}
                    onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
                    style={{ width: '100%' }}
                  />
                </Space>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text strong>&nbsp;</Text>
                  {(fieldFilter || dateRange) && (
                    <Button
                      onClick={() => {
                        setFieldFilter(undefined);
                        setDateRange(null);
                      }}
                      style={{ borderRadius: 6 }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </Space>
              </Col>
            </Row>
          </Card>

          {error && (
            <Alert message={error} type="error" showIcon closable />
          )}

          {loading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : filteredHistory.length === 0 ? (
            <Empty
              description={
                fieldFilter || dateRange
                  ? 'No changes match the selected filters'
                  : 'No changes recorded yet. History will appear here when employee information is updated.'
              }
            />
          ) : viewMode === 'timeline' ? (
            <Timeline
              mode="left"
              items={filteredHistory.map((item) => ({
                dot: <SwapOutlined style={{ fontSize: 16 }} />,
                color: 'blue',
                children: (
                  <Card
                    size="small"
                    style={{
                      borderRadius: 8,
                      marginBottom: 8,
                      border: '1px solid #e8e8e8',
                      background: '#fafafa',
                    }}
                    bodyStyle={{ padding: '12px 16px' }}
                  >
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Tag color="blue" icon={<EditOutlined />} style={{ borderRadius: 6 }}>
                          {item.changedField}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(item.changedAt).toLocaleString()}
                        </Text>
                      </div>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>Old Value:</Text>
                          <div style={{ marginTop: 4, padding: '8px 12px', background: '#fff', borderRadius: 6, border: '1px solid #f0f0f0' }}>
                            <Text delete>{item.oldValue || '—'}</Text>
                          </div>
                        </div>
                        <SwapOutlined style={{ color: '#999' }} />
                        <div style={{ flex: 1 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>New Value:</Text>
                          <div style={{ marginTop: 4, padding: '8px 12px', background: '#fff', borderRadius: 6, border: '1px solid #f0f0f0' }}>
                            <Text strong style={{ color: '#52c41a' }}>{item.newValue || '—'}</Text>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <UserOutlined style={{ color: '#999', fontSize: 12 }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Changed by <Text strong>{item.changedByEmail}</Text>
                        </Text>
                      </div>
                    </Space>
                  </Card>
                ),
              }))}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredHistory}
              rowKey={(record) => `${record.changedField}-${record.changedAt}`}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} changes`,
              }}
            />
          )}
        </Space>
      </Card>
    </div>
  );
};
