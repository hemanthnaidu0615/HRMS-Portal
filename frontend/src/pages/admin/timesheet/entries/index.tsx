import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Table,
  Tag,
  message,
  Modal,
  Row,
  Col,
  Statistic,
  DatePicker,
  Select,
  Input,
  Tooltip,
  Badge,
  Typography,
  Spin,
} from 'antd';
import {
  FieldTimeOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ProjectOutlined,
  CalendarOutlined,
  FilterOutlined,
  SearchOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';
import { EmptyState } from '../../../../components/EmptyState';

dayjs.extend(isoWeek);

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text, Title } = Typography;

interface TimesheetEntry {
  id: string;
  employee: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    name: string;
  };
  task: {
    id: string;
    name: string;
  };
  date: string;
  hours: number;
  description: string;
  billable: boolean;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
}

interface WeekData {
  [key: string]: {
    [key: string]: TimesheetEntry[];
  };
}

const TimesheetEntriesPage: React.FC = () => {
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [weekData, setWeekData] = useState<WeekData>({});
  const [loading, setLoading] = useState(false);
  const [currentWeek, setCurrentWeek] = useState<Dayjs>(dayjs());
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  const weekStart = currentWeek.startOf('isoWeek');
  const weekDays = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));

  useEffect(() => {
    fetchEntries();
  }, [currentWeek, selectedEmployee]);

  useEffect(() => {
    processWeekData();
  }, [entries]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const response = await http.get('/api/timesheet/entries', {
        params: {
          weekStart: weekStart.format('YYYY-MM-DD'),
          weekEnd: weekStart.add(6, 'day').format('YYYY-MM-DD'),
          employee: selectedEmployee || undefined,
        },
      });
      setEntries(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch timesheet entries');
    } finally {
      setLoading(false);
    }
  };

  const processWeekData = () => {
    const data: WeekData = {};

    entries.forEach((entry) => {
      const projectKey = `${entry.project.id}-${entry.project.name}`;
      if (!data[projectKey]) {
        data[projectKey] = {};
      }

      const dateKey = dayjs(entry.date).format('YYYY-MM-DD');
      if (!data[projectKey][dateKey]) {
        data[projectKey][dateKey] = [];
      }

      data[projectKey][dateKey].push(entry);
    });

    setWeekData(data);
  };

  const handleSubmitWeek = async () => {
    Modal.confirm({
      title: 'Submit Timesheet for Week',
      content: 'Are you sure you want to submit this week\'s timesheet? This cannot be undone.',
      okText: 'Submit',
      okType: 'primary',
      icon: <SendOutlined style={{ color: '#722ed1' }} />,
      onOk: async () => {
        try {
          await http.post('/api/timesheet/entries/submit', {
            weekStart: weekStart.format('YYYY-MM-DD'),
            weekEnd: weekStart.add(6, 'day').format('YYYY-MM-DD'),
          });
          message.success('Timesheet submitted successfully');
          fetchEntries();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to submit timesheet');
        }
      },
    });
  };

  const getDayTotal = (date: Dayjs): number => {
    const dateKey = date.format('YYYY-MM-DD');
    let total = 0;

    Object.values(weekData).forEach((projectData) => {
      const entries = projectData[dateKey] || [];
      entries.forEach((entry) => {
        total += entry.hours;
      });
    });

    return total;
  };

  const getWeekTotal = (): number => {
    return entries.reduce((sum, entry) => sum + entry.hours, 0);
  };

  const getBillableHours = (): number => {
    return entries.filter((e) => e.billable).reduce((sum, entry) => sum + entry.hours, 0);
  };

  const getNonBillableHours = (): number => {
    return entries.filter((e) => !e.billable).reduce((sum, entry) => sum + entry.hours, 0);
  };

  const getCellColor = (entries: TimesheetEntry[]): string => {
    if (entries.length === 0) return '#fff';
    const allBillable = entries.every((e) => e.billable);
    const someBillable = entries.some((e) => e.billable);

    if (allBillable) return '#f6ffed';
    if (someBillable) return '#fff7e6';
    return '#fafafa';
  };

  const columns: any[] = [
    {
      title: <Text strong style={{ color: '#722ed1' }}>Project</Text>,
      dataIndex: 'project',
      key: 'project',
      fixed: 'left',
      width: 200,
      render: (text: string) => (
        <Space>
          <ProjectOutlined style={{ color: '#722ed1' }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    ...weekDays.map((day) => ({
      title: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 600, color: '#722ed1' }}>{day.format('ddd')}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>{day.format('MMM DD')}</div>
        </div>
      ),
      dataIndex: day.format('YYYY-MM-DD'),
      key: day.format('YYYY-MM-DD'),
      width: 120,
      align: 'center' as const,
      render: (entries: TimesheetEntry[]) => {
        if (!entries || entries.length === 0) {
          return (
            <Tooltip title="Click to add entry">
              <div
                style={{
                  padding: '8px',
                  cursor: 'pointer',
                  borderRadius: 6,
                  transition: 'all 0.3s',
                }}
                onClick={() => navigate('/admin/timesheet/entries/create')}
              >
                <Text type="secondary">-</Text>
              </div>
            </Tooltip>
          );
        }

        const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
        const billableCount = entries.filter((e) => e.billable).length;

        return (
          <Tooltip
            title={
              <div>
                {entries.map((entry) => (
                  <div key={entry.id}>
                    {entry.task.name}: {entry.hours}h {entry.billable ? '(B)' : '(NB)'}
                  </div>
                ))}
              </div>
            }
          >
            <div
              style={{
                padding: '8px',
                cursor: 'pointer',
                borderRadius: 6,
                background: getCellColor(entries),
                border: '1px solid #f0f0f0',
                transition: 'all 0.3s',
              }}
              onClick={() => navigate(`/admin/timesheet/entries/${entries[0].id}/edit`)}
            >
              <div style={{ fontWeight: 600, fontSize: 16, color: '#262626' }}>
                {totalHours}h
              </div>
              {billableCount > 0 && (
                <Badge
                  count={billableCount}
                  style={{
                    background: '#52c41a',
                    fontSize: 10,
                  }}
                />
              )}
            </div>
          </Tooltip>
        );
      },
    })),
    {
      title: <Text strong style={{ color: '#722ed1' }}>Total</Text>,
      dataIndex: 'total',
      key: 'total',
      fixed: 'right',
      width: 100,
      align: 'center' as const,
      render: (total: number) => (
        <div style={{ fontWeight: 600, fontSize: 16, color: '#722ed1' }}>
          {total}h
        </div>
      ),
    },
  ];

  const dataSource = Object.entries(weekData).map(([projectKey, projectData]) => {
    const [projectId, projectName] = projectKey.split('-');
    const rowData: any = {
      key: projectKey,
      project: projectName,
    };

    let rowTotal = 0;
    weekDays.forEach((day) => {
      const dateKey = day.format('YYYY-MM-DD');
      rowData[dateKey] = projectData[dateKey] || [];
      rowTotal += (projectData[dateKey] || []).reduce((sum, e) => sum + e.hours, 0);
    });

    rowData.total = rowTotal;
    return rowData;
  });

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ margin: 0, color: '#722ed1' }}>
                <FieldTimeOutlined style={{ marginRight: 12 }} />
                Timesheet Entries
              </Title>
              <Text type="secondary">Weekly timesheet view</Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                size="large"
                icon={<SendOutlined />}
                onClick={handleSubmitWeek}
                style={{
                  background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
                  color: '#fff',
                  border: 'none',
                  height: 44,
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(114, 46, 209, 0.3)',
                }}
              >
                Submit Week
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => navigate('/admin/timesheet/entries/create')}
                style={{
                  background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
                  border: 'none',
                  height: 44,
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(114, 46, 209, 0.3)',
                }}
              >
                Add Entry
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Total Hours</span>}
              value={getWeekTotal()}
              suffix="h"
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<ClockCircleOutlined />}
            />
          </PremiumCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Billable</span>}
              value={getBillableHours()}
              suffix="h"
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<DollarOutlined />}
            />
          </PremiumCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Non-Billable</span>}
              value={getNonBillableHours()}
              suffix="h"
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<ClockCircleOutlined />}
            />
          </PremiumCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Projects</span>}
              value={Object.keys(weekData).length}
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<ProjectOutlined />}
            />
          </PremiumCard>
        </Col>
      </Row>

      {/* Week Navigation & Filters */}
      <PremiumCard style={{ marginBottom: 24 }} bodyStyle={{ padding: 20 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <Space>
              <Button onClick={() => setCurrentWeek(currentWeek.subtract(1, 'week'))}>
                Previous Week
              </Button>
              <DatePicker
                value={currentWeek}
                onChange={(date) => date && setCurrentWeek(date)}
                picker="week"
                style={{ width: 200 }}
              />
              <Button onClick={() => setCurrentWeek(currentWeek.add(1, 'week'))}>
                Next Week
              </Button>
              <Button type="link" onClick={() => setCurrentWeek(dayjs())}>
                Today
              </Button>
            </Space>
          </Col>
          <Col flex="auto" />
          <Col>
            <Input
              placeholder="Search..."
              prefix={<SearchOutlined style={{ color: '#722ed1' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200, borderRadius: 8 }}
            />
          </Col>
        </Row>
      </PremiumCard>

      {/* Timesheet Grid */}
      <PremiumCard
        style={{
          background: 'linear-gradient(to bottom, #ffffff, #f9fafb)',
        }}
        bodyStyle={{ padding: 24 }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <Spin size="large" />
          </div>
        ) : dataSource.length === 0 ? (
          <EmptyState
            icon={<FieldTimeOutlined />}
            title="No Timesheet Entries"
            subtitle="Start tracking your time by adding your first entry"
            action={{
              text: 'Add Entry',
              icon: <PlusOutlined />,
              onClick: () => navigate('/admin/timesheet/entries/create'),
            }}
          />
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={dataSource}
              pagination={false}
              scroll={{ x: 1400 }}
              bordered
              style={{ marginBottom: 16 }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row style={{ background: '#fafafa' }}>
                    <Table.Summary.Cell index={0}>
                      <Text strong style={{ color: '#722ed1' }}>Daily Total</Text>
                    </Table.Summary.Cell>
                    {weekDays.map((day, index) => (
                      <Table.Summary.Cell index={index + 1} key={day.format('YYYY-MM-DD')} align="center">
                        <Text strong style={{ fontSize: 16, color: '#722ed1' }}>
                          {getDayTotal(day)}h
                        </Text>
                      </Table.Summary.Cell>
                    ))}
                    <Table.Summary.Cell index={8} align="center">
                      <Text strong style={{ fontSize: 16, color: '#722ed1' }}>
                        {getWeekTotal()}h
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />

            {/* Legend */}
            <div style={{ marginTop: 16 }}>
              <Space>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 20, height: 20, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }} />
                  <Text type="secondary">Billable</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 20, height: 20, background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 4 }} />
                  <Text type="secondary">Mixed</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 20, height: 20, background: '#fafafa', border: '1px solid #d9d9d9', borderRadius: 4 }} />
                  <Text type="secondary">Non-Billable</Text>
                </div>
              </Space>
            </div>
          </>
        )}
      </PremiumCard>
    </div>
  );
};

export default TimesheetEntriesPage;
