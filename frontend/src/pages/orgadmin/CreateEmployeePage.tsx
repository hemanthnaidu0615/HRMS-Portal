import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Input, Button, Alert, Typography, Space, Tabs, Form, Select, DatePicker, Divider,
  Tag, Row, Col, message, InputNumber, Checkbox, Upload, Avatar, Result, Progress,
} from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  MailOutlined, LockOutlined, UserOutlined, BankOutlined, SafetyCertificateOutlined,
  CheckCircleOutlined, PhoneOutlined, HomeOutlined, ContactsOutlined, IdcardOutlined,
  PlusOutlined, CameraOutlined, LoadingOutlined, DollarOutlined, FileTextOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { orgadminApi } from '../../api/orgadminApi';
import { getAllVendors } from '../../api/vendorApi';
import { getAllClients } from '../../api/clientApi';
import { getAllProjects } from '../../api/projectApi';
import { CreateDepartmentModal } from '../../components/CreateDepartmentModal';
import { CreatePositionModal } from '../../components/CreatePositionModal';
import { PasswordStrengthMeter } from '../../components/ValidatedFormItem';
import {
  emailRule, phoneRule, passwordStrengthRule, salaryRule,
  taxIdRule, noFutureDateRule, positiveNumberRule
} from '../../utils/validationRules';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

interface Department {
  id: string;
  name: string;
  departmentCode?: string;
}

interface Position {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  user: { email: string };
  firstName?: string | null;
  lastName?: string | null;
  department?: { name: string };
  position?: { name: string };
}

interface PermissionGroup {
  id: string;
  name: string;
  description: string;
}

interface Vendor {
  id: string;
  name: string;
  vendorCode: string;
}

interface Client {
  id: string;
  name: string;
  clientCode: string;
}

interface Project {
  id: string;
  projectName: string;
  projectCode: string;
  clientName: string;
}

export const CreateEmployeePage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Modal states
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);

  // Dropdown data
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Employee code generation
  const [employeeCode, setEmployeeCode] = useState('');

  // Photo upload
  const [photoFile, setPhotoFile] = useState<UploadFile | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

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
        const employeesList = empsData.content || empsData;
        setEmployees(Array.isArray(employeesList) ? employeesList : []);
      }
      if (permsRes.ok) setPermissionGroups(await permsRes.json());

      // Load vendors, clients, projects
      const [vendorsData, clientsData, projectsData] = await Promise.all([
        getAllVendors(true),
        getAllClients(true),
        getAllProjects(),
      ]);
      setVendors(vendorsData);
      setClients(clientsData);
      setProjects(projectsData);
    } catch (err) {
      console.error('Failed to load dropdown data:', err);
    }
  };

  const generateEmployeeCode = async (departmentId?: string) => {
    try {
      const url = departmentId
        ? `/api/orgadmin/employees/codes/next?departmentId=${departmentId}`
        : '/api/orgadmin/employees/codes/next';

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.ok) {
        const data = await response.json();
        setEmployeeCode(data.code);
        form.setFieldValue('employeeCode', data.code);
      }
    } catch (err) {
      message.error('Failed to generate employee code');
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      await form.validateFields(['email', 'temporaryPassword', 'firstName', 'lastName', 'employeeCode', 'joiningDate']);

      setLoading(true);
      setError('');

      const values = form.getFieldsValue(true);

      const payload = {
        // Account
        email: values.email,
        temporaryPassword: values.temporaryPassword,
        employeeCode: values.employeeCode,

        // Personal Details
        firstName: values.firstName || null,
        middleName: values.middleName || null,
        lastName: values.lastName || null,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
        gender: values.gender || null,
        nationality: values.nationality || null,
        maritalStatus: values.maritalStatus || null,
        bloodGroup: values.bloodGroup || null,

        // Contact Information
        personalEmail: values.personalEmail || null,
        phoneNumber: values.phoneNumber || null,
        workPhone: values.workPhone || null,
        alternatePhone: values.alternatePhone || null,

        // Current Address
        currentAddressLine1: values.currentAddressLine1 || null,
        currentAddressLine2: values.currentAddressLine2 || null,
        currentCity: values.currentCity || null,
        currentState: values.currentState || null,
        currentCountry: values.currentCountry || null,
        currentPostalCode: values.currentPostalCode || null,

        // Permanent Address
        sameAsCurrentAddress: values.sameAsCurrentAddress || false,
        permanentAddressLine1: values.sameAsCurrentAddress ? values.currentAddressLine1 : (values.permanentAddressLine1 || null),
        permanentAddressLine2: values.sameAsCurrentAddress ? values.currentAddressLine2 : (values.permanentAddressLine2 || null),
        permanentCity: values.sameAsCurrentAddress ? values.currentCity : (values.permanentCity || null),
        permanentState: values.sameAsCurrentAddress ? values.currentState : (values.permanentState || null),
        permanentCountry: values.sameAsCurrentAddress ? values.currentCountry : (values.permanentCountry || null),
        permanentPostalCode: values.sameAsCurrentAddress ? values.currentPostalCode : (values.permanentPostalCode || null),

        // Emergency Contact
        emergencyContactName: values.emergencyContactName || null,
        emergencyContactRelationship: values.emergencyContactRelationship || null,
        emergencyContactPhone: values.emergencyContactPhone || null,
        alternateEmergencyContactName: values.alternateEmergencyContactName || null,
        alternateEmergencyContactRelationship: values.alternateEmergencyContactRelationship || null,
        alternateEmergencyContactPhone: values.alternateEmergencyContactPhone || null,

        // Employment Details
        joiningDate: values.joiningDate ? values.joiningDate.format('YYYY-MM-DD') : null,
        departmentId: values.departmentId || null,
        positionId: values.positionId || null,
        reportsToId: values.reportsToId || null,
        employmentType: values.employmentType || 'internal',
        employmentStatus: values.employmentStatus || 'active',

        // Vendor/Client/Project Assignment
        vendorId: values.vendorId || null,
        clientId: values.clientId || null,
        projectId: values.projectId || null,

        // Probation
        isProbation: values.isProbation || false,
        probationStartDate: values.isProbation && values.probationStartDate ? values.probationStartDate.format('YYYY-MM-DD') : null,
        probationEndDate: values.isProbation && values.probationEndDate ? values.probationEndDate.format('YYYY-MM-DD') : null,
        probationStatus: values.isProbation ? (values.probationStatus || 'active') : null,

        // Contract
        contractStartDate: values.contractStartDate ? values.contractStartDate.format('YYYY-MM-DD') : null,
        contractEndDate: values.contractEndDate ? values.contractEndDate.format('YYYY-MM-DD') : null,

        // Compensation
        basicSalary: values.basicSalary || null,
        currency: values.currency || 'USD',
        payFrequency: values.payFrequency || 'monthly',

        // Bank Details
        bankAccountNumber: values.bankAccountNumber || null,
        bankName: values.bankName || null,
        bankBranch: values.bankBranch || null,
        ifscCode: values.ifscCode || null,

        // Tax & Legal
        taxIdentificationNumber: values.taxIdentificationNumber || null,
        panNumber: values.panNumber || null,
        aadharNumber: values.aadharNumber || null,
        uanNumber: values.uanNumber || null,
        ssnNumber: values.ssnNumber || null,
        driversLicenseNumber: values.driversLicenseNumber || null,
        passportNumber: values.passportNumber || null,

        // Permission Groups
        permissionGroupIds: values.permissionGroupIds || [],
      };

      await orgadminApi.createEmployee(payload);
      setSuccess(true);
      message.success('Employee created successfully!');
      setTimeout(() => {
        navigate('/admin/employees');
      }, 2000);
    } catch (err: any) {
      let errorMsg = 'Failed to create employee';

      if (err.response) {
        const backendError = err.response.data?.message || err.response.data?.error;
        if (backendError) {
          errorMsg = backendError;
        } else if (err.response.status === 409) {
          errorMsg = 'Email already exists. Please use a different email address.';
        } else if (err.response.status === 400) {
          errorMsg = 'Invalid input. Please check all fields and try again.';
        } else if (err.response.status === 500) {
          errorMsg = 'Server error. Please try again later.';
        }
      }

      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentChange = (departmentId: string) => {
    form.setFieldValue('departmentId', departmentId);
    generateEmployeeCode(departmentId);
  };

  const handleDepartmentCreated = (id: string, name: string) => {
    loadDropdownData();
    form.setFieldValue('departmentId', id);
    generateEmployeeCode(id);
    setShowDepartmentModal(false);
  };

  const handlePositionCreated = (id: string, name: string) => {
    loadDropdownData();
    form.setFieldValue('positionId', id);
    setShowPositionModal(false);
  };

  const handlePhotoUpload = (file: UploadFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file as any);
    setPhotoFile(file);
    return false;
  };

  if (success) {
    return (
      <div style={{ padding: 24, minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card style={{ maxWidth: 600, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', textAlign: 'center' }}>
          <Result
            status="success"
            icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: 72 }} />}
            title={<span style={{ fontSize: 24, fontWeight: 600, color: '#0a0d54' }}>Employee Created Successfully!</span>}
            subTitle={
              <Space direction="vertical" size="middle" style={{ marginTop: 16 }}>
                <Text style={{ fontSize: 16 }}>The employee account has been created with all provided information.</Text>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <LoadingOutlined style={{ fontSize: 16, color: '#0a0d54' }} />
                  <Text type="secondary">Redirecting to employee list...</Text>
                </div>
              </Space>
            }
            extra={
              <Button type="primary" size="large" onClick={() => navigate('/admin/employees')} style={{ background: '#0a0d54', borderRadius: 8, marginTop: 16 }}>
                Go to Employee List Now
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const tabItems = [
    {
      key: 'account',
      label: (
        <span>
          <MailOutlined /> Account
        </span>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <Upload accept="image/*" showUploadList={false} beforeUpload={handlePhotoUpload} maxCount={1}>
              <div style={{
                position: 'relative', width: 120, height: 120, borderRadius: '50%',
                background: photoPreview ? `url(${photoPreview}) center/cover` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                border: '4px solid #f0f0f0', transition: 'all 0.3s',
              }}>
                {!photoPreview && <CameraOutlined style={{ fontSize: 36, color: '#fff' }} />}
                <div style={{
                  position: 'absolute', bottom: 0, right: 0, background: '#0a0d54', borderRadius: '50%',
                  width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 16,
                }}>
                  <CameraOutlined />
                </div>
              </div>
            </Upload>
            <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 8 }}>
              Click to upload employee photo (optional)
            </Text>
          </div>

          <Form.Item name="email" label={<span>Work Email Address <span style={{ color: '#ff4d4f' }}>*</span></span>}
            rules={[{ required: true, message: 'Email is required' }, emailRule]} extra="This will be the employee's login email">
            <Input prefix={<MailOutlined />} placeholder="employee@company.com" size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="firstName" label="First Name" rules={[{ required: true, message: 'First name is required' }]}>
                <Input prefix={<UserOutlined />} placeholder="John" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="middleName" label="Middle Name">
                <Input placeholder="(Optional)" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="lastName" label="Last Name" rules={[{ required: true, message: 'Last name is required' }]}>
            <Input prefix={<UserOutlined />} placeholder="Doe" size="large" />
          </Form.Item>

          <Form.Item name="temporaryPassword" label={<span>Temporary Password <span style={{ color: '#ff4d4f' }}>*</span></span>}
            rules={[{ required: true, message: 'Temporary password is required' }, passwordStrengthRule]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Min 8 characters" size="large" />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.temporaryPassword !== curr.temporaryPassword}>
            {({ getFieldValue }) => <PasswordStrengthMeter password={getFieldValue('temporaryPassword') || ''} />}
          </Form.Item>

          <Alert message="First Login Security" description="The employee will be required to change this password on their first login." type="info" showIcon />
        </Space>
      ),
    },
    {
      key: 'employment',
      label: (
        <span>
          <BankOutlined /> Employment
        </span>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Form.Item name="departmentId" label="Department">
            <Select placeholder="Select department" size="large" allowClear onChange={handleDepartmentChange}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <Button type="link" icon={<PlusOutlined />} onClick={() => setShowDepartmentModal(true)} block>
                    Create New Department
                  </Button>
                </>
              )}>
              {departments.map((dept) => (
                <Option key={dept.id} value={dept.id}>{dept.name} {dept.departmentCode && `(${dept.departmentCode})`}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="joiningDate" label={<span>Joining Date <span style={{ color: '#ff4d4f' }}>*</span></span>}
            rules={[{ required: true, message: 'Joining date is required' }]}>
            <DatePicker style={{ width: '100%' }} size="large" placeholder="Select joining date" />
          </Form.Item>

          <Form.Item name="employeeCode" label={<span>Employee Code <span style={{ color: '#ff4d4f' }}>*</span></span>}
            rules={[{ required: true, message: 'Employee code is required' }]} extra="Unique employee code">
            <Input placeholder="e.g., EMP001" size="large" />
          </Form.Item>

          <Form.Item name="positionId" label="Position">
            <Select placeholder="Select position" size="large" allowClear
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <Button type="link" icon={<PlusOutlined />} onClick={() => setShowPositionModal(true)} block>
                    Create New Position
                  </Button>
                </>
              )}>
              {positions.map((pos) => (
                <Option key={pos.id} value={pos.id}>{pos.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="reportsToId" label="Reports To (Manager)">
            <Select placeholder="Select manager" size="large" allowClear showSearch
              filterOption={(input, option) => (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())}>
              {employees.map((emp) => {
                const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
                const displayName = fullName || emp.user.email;
                return (
                  <Option key={emp.id} value={emp.id}>{displayName}{emp.position && ` - ${emp.position.name}`}</Option>
                );
              })}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="employmentType" label="Employment Type" initialValue="internal">
                <Select size="large">
                  <Option value="internal">Internal</Option>
                  <Option value="contract">Contract</Option>
                  <Option value="client">Client</Option>
                  <Option value="consultant">Consultant</Option>
                  <Option value="intern">Intern</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="employmentStatus" label="Employment Status" initialValue="active">
                <Select size="large">
                  <Option value="active"><Tag color="green">Active</Tag></Option>
                  <Option value="on_notice"><Tag color="orange">On Notice</Tag></Option>
                  <Option value="on_leave"><Tag color="blue">On Leave</Tag></Option>
                  <Option value="suspended"><Tag color="red">Suspended</Tag></Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="permissionGroupIds" label="Permission Groups">
            <Select mode="multiple" placeholder="Select permission groups" size="large" allowClear>
              {permissionGroups.map((group) => (
                <Option key={group.id} value={group.id}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{group.name}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>{group.description}</div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Space>
      ),
    },
    {
      key: 'personal',
      label: (
        <span>
          <UserOutlined /> Personal
        </span>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="dateOfBirth" label="Date of Birth" rules={[noFutureDateRule]}>
                <DatePicker style={{ width: '100%' }} size="large" placeholder="Select date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gender" label="Gender">
                <Select placeholder="Select gender" size="large" allowClear>
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                  <Option value="other">Other</Option>
                  <Option value="prefer_not_to_say">Prefer not to say</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="nationality" label="Nationality">
                <Input placeholder="e.g., American" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="maritalStatus" label="Marital Status">
                <Select placeholder="Select status" size="large" allowClear>
                  <Option value="single">Single</Option>
                  <Option value="married">Married</Option>
                  <Option value="divorced">Divorced</Option>
                  <Option value="widowed">Widowed</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="bloodGroup" label="Blood Group">
            <Select placeholder="Select blood group" size="large" allowClear>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                <Option key={bg} value={bg}>{bg}</Option>
              ))}
            </Select>
          </Form.Item>
        </Space>
      ),
    },
    {
      key: 'contact',
      label: (
        <span>
          <PhoneOutlined /> Contact
        </span>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Form.Item name="personalEmail" label="Personal Email" rules={[emailRule]}>
            <Input prefix={<MailOutlined />} placeholder="personal@email.com" size="large" />
          </Form.Item>

          <Form.Item name="phoneNumber" label="Primary Phone" rules={[phoneRule]}>
            <Input prefix={<PhoneOutlined />} placeholder="+1 (555) 123-4567" size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="workPhone" label="Work Phone" rules={[phoneRule]}>
                <Input prefix={<PhoneOutlined />} placeholder="Extension" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="alternatePhone" label="Alternate Phone" rules={[phoneRule]}>
                <Input prefix={<PhoneOutlined />} placeholder="Alternative" size="large" />
              </Form.Item>
            </Col>
          </Row>
        </Space>
      ),
    },
    {
      key: 'address',
      label: (
        <span>
          <HomeOutlined /> Address
        </span>
      ),
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={5}>Current Address</Title>
            <Form.Item name="currentAddressLine1" label="Address Line 1">
              <Input placeholder="Street address" size="large" />
            </Form.Item>
            <Form.Item name="currentAddressLine2" label="Address Line 2">
              <Input placeholder="Apt, suite (optional)" size="large" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="currentCity" label="City">
                  <Input placeholder="City" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="currentState" label="State">
                  <Input placeholder="State" size="large" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="currentCountry" label="Country">
                  <Input placeholder="Country" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="currentPostalCode" label="Postal Code">
                  <Input placeholder="ZIP/Postal" size="large" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Divider />

          <Form.Item name="sameAsCurrentAddress" valuePropName="checked">
            <Checkbox>Permanent address is same as current address</Checkbox>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.sameAsCurrentAddress !== curr.sameAsCurrentAddress}>
            {({ getFieldValue }) =>
              !getFieldValue('sameAsCurrentAddress') && (
                <>
                  <Title level={5}>Permanent Address</Title>
                  <Form.Item name="permanentAddressLine1" label="Address Line 1">
                    <Input placeholder="Street address" size="large" />
                  </Form.Item>
                  <Form.Item name="permanentAddressLine2" label="Address Line 2">
                    <Input placeholder="Apt, suite (optional)" size="large" />
                  </Form.Item>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="permanentCity" label="City">
                        <Input placeholder="City" size="large" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="permanentState" label="State">
                        <Input placeholder="State" size="large" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="permanentCountry" label="Country">
                        <Input placeholder="Country" size="large" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="permanentPostalCode" label="Postal Code">
                        <Input placeholder="ZIP/Postal" size="large" />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )
            }
          </Form.Item>
        </Space>
      ),
    },
    {
      key: 'emergency',
      label: (
        <span>
          <ContactsOutlined /> Emergency
        </span>
      ),
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={5}>Primary Emergency Contact</Title>
            <Form.Item name="emergencyContactName" label="Full Name">
              <Input placeholder="Emergency contact name" size="large" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="emergencyContactRelationship" label="Relationship">
                  <Input placeholder="e.g., Spouse, Parent" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="emergencyContactPhone" label="Phone" rules={[phoneRule]}>
                  <Input prefix={<PhoneOutlined />} placeholder="+1 (555) 123-4567" size="large" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Divider />

          <div>
            <Title level={5}>Alternate Contact (Optional)</Title>
            <Form.Item name="alternateEmergencyContactName" label="Full Name">
              <Input placeholder="Alternate contact" size="large" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="alternateEmergencyContactRelationship" label="Relationship">
                  <Input placeholder="e.g., Friend" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="alternateEmergencyContactPhone" label="Phone" rules={[phoneRule]}>
                  <Input prefix={<PhoneOutlined />} placeholder="+1 (555) 123-4567" size="large" />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Space>
      ),
    },
    {
      key: 'compensation',
      label: (
        <span>
          <DollarOutlined /> Compensation
        </span>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="basicSalary" label="Basic Salary" rules={[positiveNumberRule, salaryRule(0, 10000000)]}>
                <InputNumber placeholder="0.00" min={0} precision={2} style={{ width: '100%' }} size="large" prefix="$" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="currency" label="Currency" initialValue="USD">
                <Select size="large">
                  <Option value="USD">USD</Option>
                  <Option value="INR">INR</Option>
                  <Option value="EUR">EUR</Option>
                  <Option value="GBP">GBP</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="payFrequency" label="Pay Frequency" initialValue="monthly">
                <Select size="large">
                  <Option value="hourly">Hourly</Option>
                  <Option value="weekly">Weekly</Option>
                  <Option value="monthly">Monthly</Option>
                  <Option value="annual">Annual</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider>Bank Details</Divider>

          <Form.Item name="bankAccountNumber" label="Account Number">
            <Input placeholder="Bank account number" size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="bankName" label="Bank Name">
                <Input placeholder="Name of bank" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="bankBranch" label="Branch">
                <Input placeholder="Branch" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="ifscCode" label="IFSC/Routing Code">
            <Input placeholder="IFSC or Routing number" size="large" />
          </Form.Item>
        </Space>
      ),
    },
    {
      key: 'documents',
      label: (
        <span>
          <IdcardOutlined /> Documents
        </span>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert message="Optional Tax & Legal Documents" description="All fields are optional and can be filled later" type="info" showIcon />

          <Form.Item name="taxIdentificationNumber" label="Tax ID" rules={[taxIdRule]}>
            <Input placeholder="Tax identification number" size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="panNumber" label="PAN (India)" rules={[taxIdRule]}>
                <Input placeholder="PAN number" size="large" maxLength={10} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="aadharNumber" label="Aadhar (India)" rules={[taxIdRule]}>
                <Input placeholder="Aadhar number" size="large" maxLength={12} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="uanNumber" label="UAN (India)" rules={[taxIdRule]}>
            <Input placeholder="UAN number" size="large" maxLength={12} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="ssnNumber" label="SSN (USA)" rules={[taxIdRule]}>
                <Input placeholder="Social Security Number" size="large" maxLength={11} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="driversLicenseNumber" label="Driver's License">
                <Input placeholder="License number" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="passportNumber" label="Passport Number">
            <Input placeholder="Passport number" size="large" />
          </Form.Item>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Title level={2}>
                <TeamOutlined style={{ marginRight: 12, color: '#0a0d54' }} />
                Create New Employee
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Complete employee profile with all necessary information
              </Text>
            </div>

            {error && (
              <Alert message="Error Creating Employee" description={error} type="error" showIcon closable onClose={() => setError('')} />
            )}

            <Form form={form} layout="vertical" initialValues={{ employmentType: 'internal', employmentStatus: 'active', currency: 'USD', payFrequency: 'monthly' }}>
              <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} type="card" />
            </Form>

            <div style={{ display: 'flex', gap: 8, marginTop: 24, paddingTop: 24, borderTop: '1px solid #f0f0f0' }}>
              <Button type="primary" onClick={handleSubmit} loading={loading} disabled={loading} size="large"
                style={{ background: '#52c41a', borderColor: '#52c41a', borderRadius: 8 }} icon={<CheckCircleOutlined />}>
                Create Employee
              </Button>
              <Button onClick={() => navigate('/admin/employees')} size="large" style={{ borderRadius: 8 }}>
                Cancel
              </Button>
            </div>
          </Space>
        </Card>
      </div>

      {/* Modals */}
      <CreateDepartmentModal open={showDepartmentModal} onCancel={() => setShowDepartmentModal(false)} onSuccess={handleDepartmentCreated} />
      <CreatePositionModal open={showPositionModal} onCancel={() => setShowPositionModal(false)} onSuccess={handlePositionCreated} />
    </div>
  );
};
