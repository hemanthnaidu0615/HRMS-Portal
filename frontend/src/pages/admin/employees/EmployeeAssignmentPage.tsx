import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button, Select, Input, DatePicker, Typography, Space, Skeleton, Alert, message, Divider } from 'antd';
import { CheckOutlined, CloseOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getEmployeeDetails, updateEmployeeAssignment, getEmployees, EmployeeDetailResponse, EmployeeSummaryResponse } from '../../../api/employeeManagementApi';
import { getDepartments, getPositions, DepartmentResponse, PositionResponse } from '../../../api/structureApi';

const { Title } = Typography;

export const EmployeeAssignmentPage = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<EmployeeDetailResponse | null>(null);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [positions, setPositions] = useState<PositionResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [positionId, setPositionId] = useState<string | null>(null);
  const [reportsToEmployeeId, setReportsToEmployeeId] = useState<string | null>(null);
  const [employmentType, setEmploymentType] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [contractEndDate, setContractEndDate] = useState<dayjs.Dayjs | null>(null);

  const employmentTypeOptions = [
    { label: 'Internal', value: 'internal' },
    { label: 'Client', value: 'client' },
    { label: 'Contract', value: 'contract' },
    { label: 'Bench', value: 'bench' }
  ];

  useEffect(() => {
    if (employeeId) {
      loadData();
    }
  }, [employeeId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [empData, deptData, posData, empListData] = await Promise.all([
        getEmployeeDetails(employeeId!),
        getDepartments(),
        getPositions(),
        getEmployees()
      ]);

      setEmployee(empData);
      setDepartments(deptData);
      setPositions(posData);
      setEmployees(empListData.filter(e => e.employeeId !== employeeId));

      setDepartmentId(empData.departmentId);
      setPositionId(empData.positionId);
      setReportsToEmployeeId(empData.reportsToEmployeeId);
      setEmploymentType(empData.employmentType);
      setClientId(empData.clientId || '');
      setProjectId(empData.projectId || '');
      setContractEndDate(empData.contractEndDate ? dayjs(empData.contractEndDate) : null);

      setError('');
    } catch (err: any) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      await updateEmployeeAssignment(employeeId!, {
        departmentId: departmentId || null,
        positionId: positionId || null,
        reportsToEmployeeId: reportsToEmployeeId || null,
        employmentType: employmentType || null,
        clientId: clientId || null,
        projectId: projectId || null,
        contractEndDate: contractEndDate ? contractEndDate.format('YYYY-MM-DD') : null
      });

      message.success('Assignment updated');
      setTimeout(() => navigate(`/admin/employees/${employeeId}`), 1000);
    } catch (err: any) {
      message.error('Failed to update assignment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <Card
          style={{
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <Card
          style={{
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Alert message={error || 'Employee not found'} type="error" showIcon />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0 }}>Edit Employee Assignment</Title>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/admin/employees/${employeeId}`)}
              style={{ borderRadius: 8 }}
            >
              Back
            </Button>
          </div>

          <form onSubmit={handleSubmit}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={5}>Reporting</Title>
                <Divider style={{ margin: '12px 0' }} />
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: 8,
                    fontWeight: 500
                  }}>
                    Reports To
                  </label>
                  <Select
                    value={reportsToEmployeeId}
                    onChange={setReportsToEmployeeId}
                    options={employees.map(emp => ({
                      label: `${emp.email}${emp.positionName ? ` (${emp.positionName})` : ''}`,
                      value: emp.employeeId
                    }))}
                    placeholder="Select manager"
                    allowClear
                    size="large"
                    style={{ width: '100%', borderRadius: 8 }}
                  />
                </div>
              </div>

              <div>
                <Title level={5}>Structure</Title>
                <Divider style={{ margin: '12px 0' }} />
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: 8,
                      fontWeight: 500
                    }}>
                      Department
                    </label>
                    <Select
                      value={departmentId}
                      onChange={setDepartmentId}
                      options={departments.map(dept => ({
                        label: dept.name,
                        value: dept.id
                      }))}
                      placeholder="Select department"
                      allowClear
                      size="large"
                      style={{ width: '100%', borderRadius: 8 }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: 8,
                      fontWeight: 500
                    }}>
                      Position
                    </label>
                    <Select
                      value={positionId}
                      onChange={setPositionId}
                      options={positions.map(pos => ({
                        label: pos.name,
                        value: pos.id
                      }))}
                      placeholder="Select position"
                      allowClear
                      size="large"
                      style={{ width: '100%', borderRadius: 8 }}
                    />
                  </div>
                </Space>
              </div>

              <div>
                <Title level={5}>Employment</Title>
                <Divider style={{ margin: '12px 0' }} />
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: 8,
                      fontWeight: 500
                    }}>
                      Employment Type
                    </label>
                    <Select
                      value={employmentType}
                      onChange={setEmploymentType}
                      options={employmentTypeOptions}
                      placeholder="Select employment type"
                      allowClear
                      size="large"
                      style={{ width: '100%', borderRadius: 8 }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: 8,
                      fontWeight: 500
                    }}>
                      Client ID
                    </label>
                    <Input
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="Enter client ID"
                      size="large"
                      style={{ borderRadius: 8 }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: 8,
                      fontWeight: 500
                    }}>
                      Project ID
                    </label>
                    <Input
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      placeholder="Enter project ID"
                      size="large"
                      style={{ borderRadius: 8 }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: 8,
                      fontWeight: 500
                    }}>
                      Contract End Date
                    </label>
                    <DatePicker
                      value={contractEndDate}
                      onChange={setContractEndDate}
                      placeholder="Select date"
                      size="large"
                      format="YYYY-MM-DD"
                      style={{ width: '100%', borderRadius: 8 }}
                    />
                  </div>
                </Space>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<CheckOutlined />}
                  loading={saving}
                  style={{
                    background: '#0a0d54',
                    borderColor: '#0a0d54',
                    borderRadius: 8
                  }}
                >
                  Save
                </Button>
                <Button
                  icon={<CloseOutlined />}
                  onClick={() => navigate(`/admin/employees/${employeeId}`)}
                  style={{ borderRadius: 8 }}
                >
                  Cancel
                </Button>
              </div>
            </Space>
          </form>
        </Space>
      </Card>
    </div>
  );
};
