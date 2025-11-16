import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button, Spin, Alert, Row, Col, Form, Select, Input, DatePicker, Space, Divider } from 'antd';
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { message } from 'antd';
import dayjs from 'dayjs';
import { getEmployeeDetails, updateEmployeeAssignment, getEmployees, EmployeeDetailResponse, EmployeeSummaryResponse } from '../../../api/employeeManagementApi';
import { getDepartments, getPositions, DepartmentResponse, PositionResponse } from '../../../api/structureApi';

export const EmployeeAssignmentPage = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [employee, setEmployee] = useState<EmployeeDetailResponse | null>(null);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [positions, setPositions] = useState<PositionResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

      form.setFieldsValue({
        departmentId: empData.departmentId,
        positionId: empData.positionId,
        reportsToEmployeeId: empData.reportsToEmployeeId,
        employmentType: empData.employmentType,
        clientId: empData.clientId || '',
        projectId: empData.projectId || '',
        contractEndDate: empData.contractEndDate ? dayjs(empData.contractEndDate) : null,
      });

      setError('');
    } catch (err: any) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setSaving(true);
      await updateEmployeeAssignment(employeeId!, {
        departmentId: values.departmentId || null,
        positionId: values.positionId || null,
        reportsToEmployeeId: values.reportsToEmployeeId || null,
        employmentType: values.employmentType || null,
        clientId: values.clientId || null,
        projectId: values.projectId || null,
        contractEndDate: values.contractEndDate ? values.contractEndDate.format('YYYY-MM-DD') : null
      });

      message.success('Assignment updated successfully');
      setTimeout(() => navigate(`/admin/employees/${employeeId}`), 1000);
    } catch (err: any) {
      message.error('Failed to update assignment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6" style={{ background: '#dde4eb', minHeight: '100vh' }}>
        <Card className="shadow-md">
          <div className="text-center py-12">
            <Spin size="large" />
          </div>
        </Card>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="p-6" style={{ background: '#dde4eb', minHeight: '100vh' }}>
        <Card className="shadow-md">
          <Alert
            message={error || 'Employee not found'}
            type="error"
            showIcon
            className="mb-4"
          />
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/admin/employees')}
          >
            Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6" style={{ background: '#dde4eb', minHeight: '100vh' }}>
      <Row justify="center">
        <Col xs={24} lg={20} xl={16}>
          <Card
            className="shadow-md"
            style={{
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#0a0d54', margin: 0 }}>
                Edit Employee Assignment
              </h2>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(`/admin/employees/${employeeId}`)}
              >
                Back
              </Button>
            </div>

            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
              autoComplete="off"
            >
              <Divider orientation="left" style={{ color: '#0a0d54', fontWeight: 'bold' }}>
                Reporting
              </Divider>

              <Form.Item
                label="Reports To"
                name="reportsToEmployeeId"
              >
                <Select
                  placeholder="Select manager"
                  size="large"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={employees.map(emp => ({
                    label: `${emp.email}${emp.positionName ? ` (${emp.positionName})` : ''}`,
                    value: emp.employeeId,
                  }))}
                />
              </Form.Item>

              <Divider orientation="left" style={{ color: '#0a0d54', fontWeight: 'bold' }}>
                Structure
              </Divider>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Department"
                    name="departmentId"
                  >
                    <Select
                      placeholder="Select department"
                      size="large"
                      allowClear
                      options={departments.map(dept => ({
                        label: dept.name,
                        value: dept.id,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Position"
                    name="positionId"
                  >
                    <Select
                      placeholder="Select position"
                      size="large"
                      allowClear
                      options={positions.map(pos => ({
                        label: pos.name,
                        value: pos.id,
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left" style={{ color: '#0a0d54', fontWeight: 'bold' }}>
                Employment
              </Divider>

              <Form.Item
                label="Employment Type"
                name="employmentType"
              >
                <Select
                  placeholder="Select employment type"
                  size="large"
                  allowClear
                  options={employmentTypeOptions}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Client ID"
                    name="clientId"
                  >
                    <Input
                      placeholder="Enter client ID"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Project ID"
                    name="projectId"
                  >
                    <Input
                      placeholder="Enter project ID"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Contract End Date"
                name="contractEndDate"
              >
                <DatePicker
                  placeholder="Select date"
                  size="large"
                  format="YYYY-MM-DD"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item className="mt-6">
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<CheckOutlined />}
                    loading={saving}
                    size="large"
                    style={{ background: '#0a0d54', borderColor: '#0a0d54' }}
                  >
                    Save
                  </Button>
                  <Button
                    icon={<CloseOutlined />}
                    onClick={() => navigate(`/admin/employees/${employeeId}`)}
                    size="large"
                  >
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
