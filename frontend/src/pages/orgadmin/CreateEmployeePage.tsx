import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Input,
  Button,
  Alert,
  Typography,
  Space,
  Steps,
  Form,
  Select,
  DatePicker,
  Switch,
  Divider,
  Tag,
  Row,
  Col,
  message,
} from 'antd';
import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
  BankOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { orgadminApi } from '../../api/orgadminApi';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

interface Department {
  id: string;
  name: string;
}

interface Position {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  user: {
    email: string;
  };
  department?: {
    name: string;
  };
  position?: {
    name: string;
  };
}

interface PermissionGroup {
  id: string;
  name: string;
  description: string;
}

export const CreateEmployeePage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form data
  const [formData, setFormData] = useState<any>({
    email: '',
    temporaryPassword: '',
    departmentId: null,
    positionId: null,
    reportsToId: null,
    employmentType: 'internal',
    clientName: '',
    projectId: '',
    contractEndDate: null,
    isProbation: false,
    probationStartDate: null,
    probationEndDate: null,
    probationStatus: 'active',
    permissionGroupIds: [],
  });

  // Dropdown data
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);

  useEffect(() => {
    loadDropdownData();
  }, []);

  const loadDropdownData = async () => {
    try {
      const [deptsRes, posRes, empsRes, permsRes] = await Promise.all([
        fetch('/api/orgadmin/structure/departments', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch('/api/orgadmin/structure/positions', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch('/api/orgadmin/employees', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch('/api/orgadmin/permissions/groups', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);

      if (deptsRes.ok) setDepartments(await deptsRes.json());
      if (posRes.ok) setPositions(await posRes.json());
      if (empsRes.ok) {
        const empsData = await empsRes.json();
        setEmployees(empsData.content || empsData);
      }
      if (permsRes.ok) setPermissionGroups(await permsRes.json());
    } catch (err) {
      console.error('Failed to load dropdown data:', err);
    }
  };

  const handleNext = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      setFormData({ ...formData, ...values });
      setCurrentStep(currentStep + 1);
    } catch (err) {
      console.log('Validation failed:', err);
    }
  };

  const handlePrevious = () => {
    const values = form.getFieldsValue();
    setFormData({ ...formData, ...values });
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      const finalData = { ...formData, ...values };

      setLoading(true);
      setError('');

      // Convert date objects to strings
      const payload = {
        email: finalData.email,
        temporaryPassword: finalData.temporaryPassword,
        departmentId: finalData.departmentId || null,
        positionId: finalData.positionId || null,
        reportsToId: finalData.reportsToId || null,
        employmentType: finalData.employmentType,
        clientName: finalData.clientName || null,
        projectId: finalData.projectId || null,
        contractEndDate: finalData.contractEndDate ? finalData.contractEndDate.format('YYYY-MM-DD') : null,
        isProbation: finalData.isProbation || false,
        probationStartDate: finalData.probationStartDate ? finalData.probationStartDate.format('YYYY-MM-DD') : null,
        probationEndDate: finalData.probationEndDate ? finalData.probationEndDate.format('YYYY-MM-DD') : null,
        probationStatus: finalData.isProbation ? finalData.probationStatus : null,
        permissionGroupIds: finalData.permissionGroupIds || [],
      };

      await orgadminApi.createEmployee(payload);
      setSuccess(true);
      message.success('Employee created successfully!');
      setTimeout(() => {
        navigate('/admin/employees');
      }, 2000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to create employee';
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Basic Info',
      icon: <UserOutlined />,
    },
    {
      title: 'Organization',
      icon: <BankOutlined />,
    },
    {
      title: 'Employment',
      icon: <SafetyCertificateOutlined />,
    },
    {
      title: 'Permissions',
      icon: <SafetyCertificateOutlined />,
    },
    {
      title: 'Review',
      icon: <CheckCircleOutlined />,
    },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Invalid email format' },
              ]}
              initialValue={formData.email}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="employee@company.com"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="temporaryPassword"
              label="Temporary Password"
              rules={[{ required: true, message: 'Temporary password is required' }]}
              initialValue={formData.temporaryPassword}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter temporary password"
                size="large"
              />
            </Form.Item>

            <Alert
              message="First Login"
              description="The employee will be required to change this password on their first login."
              type="info"
              showIcon
            />
          </Space>
        );

      case 1:
        return (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Form.Item
              name="departmentId"
              label="Department"
              initialValue={formData.departmentId}
            >
              <Select
                placeholder="Select department"
                size="large"
                allowClear
              >
                {departments.map((dept) => (
                  <Option key={dept.id} value={dept.id}>
                    {dept.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="positionId"
              label="Position"
              initialValue={formData.positionId}
            >
              <Select
                placeholder="Select position"
                size="large"
                allowClear
              >
                {positions.map((pos) => (
                  <Option key={pos.id} value={pos.id}>
                    {pos.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="reportsToId"
              label="Reports To (Manager)"
              initialValue={formData.reportsToId}
            >
              <Select
                placeholder="Select manager"
                size="large"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {employees.map((emp) => (
                  <Option key={emp.id} value={emp.id}>
                    {emp.user.email}
                    {emp.position && ` - ${emp.position.name}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Space>
        );

      case 2:
        return (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Form.Item
              name="employmentType"
              label="Employment Type"
              initialValue={formData.employmentType}
            >
              <Select size="large">
                <Option value="internal">Internal</Option>
                <Option value="contract">Contract</Option>
                <Option value="client">Client</Option>
              </Select>
            </Form.Item>

            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.employmentType !== curr.employmentType}>
              {({ getFieldValue }) => {
                const empType = getFieldValue('employmentType');
                return (
                  <>
                    {empType === 'client' && (
                      <Form.Item
                        name="clientName"
                        label="Client Name"
                        initialValue={formData.clientName}
                      >
                        <Input placeholder="Enter client name" size="large" />
                      </Form.Item>
                    )}

                    {(empType === 'contract' || empType === 'client') && (
                      <>
                        <Form.Item
                          name="projectId"
                          label="Project ID"
                          initialValue={formData.projectId}
                        >
                          <Input placeholder="Enter project ID" size="large" />
                        </Form.Item>
                        <Form.Item
                          name="contractEndDate"
                          label="Contract End Date"
                          initialValue={formData.contractEndDate}
                        >
                          <DatePicker size="large" style={{ width: '100%' }} />
                        </Form.Item>
                      </>
                    )}
                  </>
                );
              }}
            </Form.Item>

            <Divider />

            <Form.Item
              name="isProbation"
              label="Probation Period"
              valuePropName="checked"
              initialValue={formData.isProbation}
            >
              <Switch />
            </Form.Item>

            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.isProbation !== curr.isProbation}>
              {({ getFieldValue }) =>
                getFieldValue('isProbation') && (
                  <>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="probationStartDate"
                          label="Start Date"
                          rules={[{ required: true, message: 'Start date is required' }]}
                          initialValue={formData.probationStartDate}
                        >
                          <DatePicker size="large" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="probationEndDate"
                          label="End Date"
                          rules={[{ required: true, message: 'End date is required' }]}
                          initialValue={formData.probationEndDate}
                        >
                          <DatePicker size="large" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="probationStatus"
                      label="Probation Status"
                      initialValue={formData.probationStatus || 'active'}
                    >
                      <Select size="large">
                        <Option value="active">Active</Option>
                        <Option value="completed">Completed</Option>
                        <Option value="extended">Extended</Option>
                      </Select>
                    </Form.Item>
                  </>
                )
              }
            </Form.Item>
          </Space>
        );

      case 3:
        return (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Form.Item
              name="permissionGroupIds"
              label="Permission Groups"
              initialValue={formData.permissionGroupIds}
            >
              <Select
                mode="multiple"
                placeholder="Select permission groups"
                size="large"
                allowClear
              >
                {permissionGroups.map((group) => (
                  <Option key={group.id} value={group.id}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{group.name}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        {group.description}
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Alert
              message="Default Permissions"
              description="If no permission groups are selected, the employee will receive default EMPLOYEE_BASIC permissions."
              type="info"
              showIcon
            />
          </Space>
        );

      case 4:
        const reviewData = { ...formData, ...form.getFieldsValue() };
        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title="Basic Information" size="small">
              <p><strong>Email:</strong> {reviewData.email}</p>
              <p><strong>Temporary Password:</strong> ••••••••</p>
            </Card>

            <Card title="Organization Assignment" size="small">
              <p>
                <strong>Department:</strong>{' '}
                {departments.find((d) => d.id === reviewData.departmentId)?.name || 'Not assigned'}
              </p>
              <p>
                <strong>Position:</strong>{' '}
                {positions.find((p) => p.id === reviewData.positionId)?.name || 'Not assigned'}
              </p>
              <p>
                <strong>Reports To:</strong>{' '}
                {employees.find((e) => e.id === reviewData.reportsToId)?.user.email || 'Not assigned'}
              </p>
            </Card>

            <Card title="Employment Details" size="small">
              <p>
                <strong>Employment Type:</strong>{' '}
                <Tag color={reviewData.employmentType === 'internal' ? 'green' : 'blue'}>
                  {reviewData.employmentType}
                </Tag>
              </p>
              {reviewData.clientName && (
                <p><strong>Client Name:</strong> {reviewData.clientName}</p>
              )}
              {reviewData.projectId && (
                <p><strong>Project ID:</strong> {reviewData.projectId}</p>
              )}
              {reviewData.contractEndDate && (
                <p>
                  <strong>Contract End Date:</strong>{' '}
                  {dayjs(reviewData.contractEndDate).format('YYYY-MM-DD')}
                </p>
              )}
              {reviewData.isProbation && (
                <>
                  <Divider />
                  <p>
                    <strong>Probation Period:</strong>{' '}
                    <Tag color="orange">Yes</Tag>
                  </p>
                  <p>
                    <strong>Start Date:</strong>{' '}
                    {reviewData.probationStartDate ? dayjs(reviewData.probationStartDate).format('YYYY-MM-DD') : 'N/A'}
                  </p>
                  <p>
                    <strong>End Date:</strong>{' '}
                    {reviewData.probationEndDate ? dayjs(reviewData.probationEndDate).format('YYYY-MM-DD') : 'N/A'}
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <Tag>{reviewData.probationStatus}</Tag>
                  </p>
                </>
              )}
            </Card>

            <Card title="Permissions" size="small">
              {reviewData.permissionGroupIds && reviewData.permissionGroupIds.length > 0 ? (
                <Space wrap>
                  {reviewData.permissionGroupIds.map((id: string) => {
                    const group = permissionGroups.find((g) => g.id === id);
                    return group ? <Tag key={id} color="blue">{group.name}</Tag> : null;
                  })}
                </Space>
              ) : (
                <Text type="secondary">Default EMPLOYEE_BASIC permissions will be applied</Text>
              )}
            </Card>
          </Space>
        );

      default:
        return null;
    }
  };

  if (success) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Card>
            <Alert
              message="Employee Created Successfully!"
              description="The employee has been created and will receive an email with their temporary credentials. Redirecting..."
              type="success"
              showIcon
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Card
          style={{
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Title level={3}>Create New Employee</Title>

            <Steps current={currentStep} style={{ marginBottom: 24 }}>
              {steps.map((step, index) => (
                <Step key={index} title={step.title} icon={step.icon} />
              ))}
            </Steps>

            {error && (
              <Alert
                message="Error Creating Employee"
                description={error}
                type="error"
                showIcon
                closable
                onClose={() => setError('')}
              />
            )}

            <Form form={form} layout="vertical">
              {renderStepContent()}
            </Form>

            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              {currentStep > 0 && (
                <Button onClick={handlePrevious} style={{ borderRadius: 8 }}>
                  Previous
                </Button>
              )}
              {currentStep < steps.length - 1 && (
                <Button
                  type="primary"
                  onClick={handleNext}
                  style={{
                    background: '#0a0d54',
                    borderColor: '#0a0d54',
                    borderRadius: 8,
                  }}
                >
                  Next
                </Button>
              )}
              {currentStep === steps.length - 1 && (
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={loading}
                  style={{
                    background: '#0a0d54',
                    borderColor: '#0a0d54',
                    borderRadius: 8,
                  }}
                >
                  Create Employee
                </Button>
              )}
              <Button
                onClick={() => navigate('/admin/employees')}
                style={{ borderRadius: 8 }}
              >
                Cancel
              </Button>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
};
