import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Typography,
  Space,
  Skeleton,
  Alert,
  message,
  DatePicker,
  InputNumber,
  Switch,
  Tabs,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  getProjectById,
  createProject,
  updateProject,
  getNextProjectCode,
  ProjectDetail,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '../../../api/projectApi';
import { getAllClients, ClientListItem } from '../../../api/clientApi';
import { getEmployees, EmployeeSummaryResponse } from '../../../api/employeeManagementApi';
import dayjs from 'dayjs';

const { Title } = Typography;

export const ProjectFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [codeGenerating, setCodeGenerating] = useState(false);
  const [manualCode, setManualCode] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const isEditMode = !!id;

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load clients and employees
      const [clientsData, employeesData] = await Promise.all([
        getAllClients(),
        getEmployees()
      ]);
      setClients(clientsData);
      setEmployees(employeesData);

      // If edit mode, load project
      if (isEditMode) {
        const projectData = await getProjectById(id!);
        setProject(projectData);
        setSelectedClientId(projectData.clientId);

        // Populate form with project data
        form.setFieldsValue({
          clientId: projectData.clientId,
          projectName: projectData.projectName,
          projectCode: projectData.projectCode,
          projectType: projectData.projectType,
          description: projectData.description,
          startDate: projectData.startDate ? dayjs(projectData.startDate) : undefined,
          endDate: projectData.endDate ? dayjs(projectData.endDate) : undefined,
          estimatedDurationMonths: projectData.estimatedDurationMonths,
          projectStatus: projectData.projectStatus,
          projectBudget: projectData.projectBudget,
          billingRateType: projectData.billingRateType,
          defaultBillingRate: projectData.defaultBillingRate,
          projectManagerId: projectData.projectManagerId,
          isBillable: projectData.isBillable,
          isActive: projectData.isActive,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateProjectCode = async (clientId: string) => {
    try {
      setCodeGenerating(true);
      const code = await getNextProjectCode(clientId);
      form.setFieldValue('projectCode', code);
    } catch (err: any) {
      message.error('Failed to generate project code');
    } finally {
      setCodeGenerating(false);
    }
  };

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);

    // Auto-generate project code if not in edit mode and not manual
    if (!isEditMode && !manualCode) {
      generateProjectCode(clientId);
    }
  };

  const handleGenerateCode = () => {
    if (!selectedClientId) {
      message.warning('Please select a client first');
      return;
    }
    generateProjectCode(selectedClientId);
  };

  const handleSubmit = async (values: any) => {
    try {
      setSaveLoading(true);
      setError('');

      const payload: CreateProjectRequest | UpdateProjectRequest = {
        clientId: values.clientId,
        projectName: values.projectName,
        projectCode: values.projectCode,
        projectType: values.projectType,
        description: values.description,
        startDate: values.startDate
          ? dayjs(values.startDate).format('YYYY-MM-DD')
          : undefined,
        endDate: values.endDate
          ? dayjs(values.endDate).format('YYYY-MM-DD')
          : undefined,
        estimatedDurationMonths: values.estimatedDurationMonths,
        projectBudget: values.projectBudget,
        billingRateType: values.billingRateType,
        defaultBillingRate: values.defaultBillingRate,
        projectManagerId: values.projectManagerId,
        isBillable: values.isBillable,
      };

      if (isEditMode) {
        const updatePayload: UpdateProjectRequest = {
          projectName: values.projectName,
          projectType: values.projectType,
          description: values.description,
          startDate: values.startDate
            ? dayjs(values.startDate).format('YYYY-MM-DD')
            : undefined,
          endDate: values.endDate
            ? dayjs(values.endDate).format('YYYY-MM-DD')
            : undefined,
          estimatedDurationMonths: values.estimatedDurationMonths,
          projectStatus: values.projectStatus,
          projectBudget: values.projectBudget,
          billingRateType: values.billingRateType,
          defaultBillingRate: values.defaultBillingRate,
          projectManagerId: values.projectManagerId,
          isBillable: values.isBillable,
          isActive: values.isActive,
        };
        await updateProject(id!, updatePayload);
        message.success('Project updated successfully');
      } else {
        await createProject(payload as CreateProjectRequest);
        message.success('Project created successfully');
      }

      navigate('/admin/projects');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error ||
        `Failed to ${isEditMode ? 'update' : 'create'} project`;
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={3} style={{ margin: 0 }}>
                {isEditMode ? 'Edit Project' : 'Create Project'}
              </Title>
              <p style={{ color: '#666', margin: '4px 0 0 0', fontSize: 14 }}>
                {isEditMode ? 'Update project information' : 'Add a new project to the system'}
              </p>
            </div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin/projects')}
              style={{ borderRadius: 6 }}
            >
              Back to Projects
            </Button>
          </div>

          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            initialValues={{
              isBillable: true,
              isActive: true,
              billingRateType: 'hourly',
              projectStatus: 'active',
              projectType: 'development',
            }}
          >
            <Tabs
              defaultActiveKey="1"
              items={[
                {
                  key: '1',
                  label: 'Basic Info',
                  children: (
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <Form.Item
                        label="Client"
                        name="clientId"
                        rules={[{ required: true, message: 'Please select a client' }]}
                      >
                        <Select
                          placeholder="Select client"
                          size="large"
                          style={{ borderRadius: 6 }}
                          showSearch
                          optionFilterProp="children"
                          onChange={handleClientChange}
                          disabled={isEditMode}
                        >
                          {clients.map(client => (
                            <Select.Option key={client.id} value={client.id}>
                              {client.name} ({client.clientCode})
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item
                          label="Project Name"
                          name="projectName"
                          rules={[{ required: true, message: 'Please enter project name' }]}
                        >
                          <Input placeholder="Enter project name" size="large" style={{ borderRadius: 6 }} />
                        </Form.Item>

                        <Form.Item
                          label="Project Code"
                          name="projectCode"
                          rules={[{ required: true, message: 'Please enter project code' }]}
                          extra={
                            !isEditMode && !manualCode && selectedClientId && (
                              <Space size="small" style={{ marginTop: 4 }}>
                                <Button
                                  type="link"
                                  size="small"
                                  icon={<ReloadOutlined />}
                                  onClick={handleGenerateCode}
                                  loading={codeGenerating}
                                  style={{ padding: 0, height: 'auto' }}
                                >
                                  Generate New Code
                                </Button>
                                <span>|</span>
                                <Button
                                  type="link"
                                  size="small"
                                  onClick={() => {
                                    setManualCode(true);
                                    form.setFieldValue('projectCode', '');
                                  }}
                                  style={{ padding: 0, height: 'auto' }}
                                >
                                  Enter Manually
                                </Button>
                              </Space>
                            )
                          }
                          help={!isEditMode && !selectedClientId ? 'Select a client first to generate code' : undefined}
                        >
                          <Input
                            placeholder="Project code"
                            size="large"
                            style={{ borderRadius: 6 }}
                            disabled={!isEditMode && !manualCode && !selectedClientId}
                          />
                        </Form.Item>
                      </div>

                      <Form.Item
                        label="Project Type"
                        name="projectType"
                        rules={[{ required: true, message: 'Please select project type' }]}
                      >
                        <Select placeholder="Select project type" size="large" style={{ borderRadius: 6 }}>
                          <Select.Option value="consulting">Consulting</Select.Option>
                          <Select.Option value="development">Development</Select.Option>
                          <Select.Option value="maintenance">Maintenance</Select.Option>
                          <Select.Option value="support">Support</Select.Option>
                        </Select>
                      </Form.Item>

                      <Form.Item label="Description" name="description">
                        <Input.TextArea
                          placeholder="Project description and objectives"
                          rows={4}
                          style={{ borderRadius: 6 }}
                        />
                      </Form.Item>

                      <Form.Item label="Billable Project" name="isBillable" valuePropName="checked">
                        <Switch checkedChildren="Yes" unCheckedChildren="No" />
                      </Form.Item>

                      {isEditMode && (
                        <Form.Item label="Active Status" name="isActive" valuePropName="checked">
                          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                        </Form.Item>
                      )}
                    </Space>
                  ),
                },
                {
                  key: '2',
                  label: 'Timeline & Financial',
                  children: (
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item label="Start Date" name="startDate">
                          <DatePicker
                            style={{ width: '100%', borderRadius: 6 }}
                            size="large"
                            placeholder="Select start date"
                          />
                        </Form.Item>

                        <Form.Item label="End Date" name="endDate">
                          <DatePicker
                            style={{ width: '100%', borderRadius: 6 }}
                            size="large"
                            placeholder="Select end date"
                          />
                        </Form.Item>
                      </div>

                      <Form.Item
                        label="Estimated Duration (Months)"
                        name="estimatedDurationMonths"
                      >
                        <InputNumber
                          placeholder="Duration in months"
                          min={0}
                          precision={1}
                          style={{ width: '100%', borderRadius: 6 }}
                          size="large"
                        />
                      </Form.Item>

                      {isEditMode && (
                        <Form.Item label="Project Status" name="projectStatus">
                          <Select placeholder="Select project status" size="large" style={{ borderRadius: 6 }}>
                            <Select.Option value="planning">Planning</Select.Option>
                            <Select.Option value="active">Active</Select.Option>
                            <Select.Option value="on-hold">On Hold</Select.Option>
                            <Select.Option value="completed">Completed</Select.Option>
                            <Select.Option value="cancelled">Cancelled</Select.Option>
                          </Select>
                        </Form.Item>
                      )}

                      <Form.Item
                        label="Project Budget"
                        name="projectBudget"
                      >
                        <InputNumber
                          placeholder="0.00"
                          min={0}
                          precision={2}
                          style={{ width: '100%', borderRadius: 6 }}
                          size="large"
                          prefix="$"
                        />
                      </Form.Item>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item label="Billing Rate Type" name="billingRateType">
                          <Select placeholder="Select billing rate type" size="large" style={{ borderRadius: 6 }}>
                            <Select.Option value="hourly">Hourly</Select.Option>
                            <Select.Option value="daily">Daily</Select.Option>
                            <Select.Option value="monthly">Monthly</Select.Option>
                            <Select.Option value="fixed">Fixed Price</Select.Option>
                          </Select>
                        </Form.Item>

                        <Form.Item label="Default Billing Rate" name="defaultBillingRate">
                          <InputNumber
                            placeholder="0.00"
                            min={0}
                            precision={2}
                            style={{ width: '100%', borderRadius: 6 }}
                            size="large"
                            prefix="$"
                          />
                        </Form.Item>
                      </div>
                    </Space>
                  ),
                },
                {
                  key: '3',
                  label: 'Management',
                  children: (
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <Form.Item label="Project Manager" name="projectManagerId">
                        <Select
                          placeholder="Select project manager"
                          size="large"
                          style={{ borderRadius: 6 }}
                          showSearch
                          optionFilterProp="children"
                          allowClear
                        >
                          {employees.map(emp => (
                            <Select.Option key={emp.employeeId} value={emp.employeeId}>
                              {emp.firstName && emp.lastName
                                ? `${emp.firstName} ${emp.lastName} (${emp.email})`
                                : emp.email}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Alert
                        message="Project Manager Responsibilities"
                        description="The project manager will be responsible for overseeing project delivery, managing resources, and ensuring client satisfaction."
                        type="info"
                        showIcon
                      />
                    </Space>
                  ),
                },
              ]}
            />

            <div
              style={{
                marginTop: 24,
                paddingTop: 24,
                borderTop: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
              }}
            >
              <Button onClick={() => navigate('/admin/projects')} size="large" style={{ borderRadius: 6 }}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saveLoading}
                size="large"
                style={{
                  background: '#0a0d54',
                  borderColor: '#0a0d54',
                  borderRadius: 6,
                }}
              >
                {isEditMode ? 'Update Project' : 'Create Project'}
              </Button>
            </div>
          </Form>
        </Space>
      </Card>
    </div>
  );
};
