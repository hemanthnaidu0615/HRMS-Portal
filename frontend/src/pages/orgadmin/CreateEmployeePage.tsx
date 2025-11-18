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
  InputNumber,
  Checkbox,
} from 'antd';
import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
  BankOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  HomeOutlined,
  ContactsOutlined,
  IdcardOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { orgadminApi } from '../../api/orgadminApi';
import { getAllVendors } from '../../api/vendorApi';
import { getAllClients } from '../../api/clientApi';
import { getAllProjects } from '../../api/projectApi';
import { CreateDepartmentModal } from '../../components/CreateDepartmentModal';
import { CreatePositionModal } from '../../components/CreatePositionModal';
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
  const [currentStep, setCurrentStep] = useState(0);
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
  const [codeGenerating, setCodeGenerating] = useState(false);

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
      setCodeGenerating(true);
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
    } finally {
      setCodeGenerating(false);
    }
  };

  const handleNext = async () => {
    try {
      // Validate current step fields
      const fieldsToValidate = getStepFields(currentStep);
      await form.validateFields(fieldsToValidate);
      setCurrentStep(currentStep + 1);
    } catch (err) {
      console.log('Validation failed:', err);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const getStepFields = (step: number): string[] => {
    switch (step) {
      case 0: return ['email', 'temporaryPassword', 'firstName', 'lastName'];
      case 1: return []; // Personal details - all optional except mandatory ones
      case 2: return []; // Contact info - optional
      case 3: return []; // Address - optional
      case 4: return []; // Emergency contacts - optional
      case 5: return ['employeeCode', 'joiningDate']; // Employment details - code and joining date required
      case 6: return []; // Additional info - all optional
      default: return [];
    }
  };

  const handleSubmit = async () => {
    try {
      // Final validation
      await form.validateFields(['email', 'temporaryPassword', 'firstName', 'lastName', 'employeeCode', 'joiningDate']);

      setLoading(true);
      setError('');

      const values = form.getFieldsValue();

      // Build comprehensive payload with all 60+ fields
      const payload = {
        // Account
        email: values.email,
        temporaryPassword: values.temporaryPassword,

        // Employee Code (department-based)
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

        // Contract (for contract employees)
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

        // India-Specific
        panNumber: values.panNumber || null,
        aadharNumber: values.aadharNumber || null,
        uanNumber: values.uanNumber || null,

        // USA-Specific
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
      } else if (err.message) {
        errorMsg = err.message;
      }

      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentChange = (departmentId: string) => {
    form.setFieldValue('departmentId', departmentId);
    // Auto-generate employee code when department selected
    generateEmployeeCode(departmentId);
  };

  const handleDepartmentCreated = (id: string, name: string) => {
    // Reload departments
    loadDropdownData();
    // Set the newly created department
    form.setFieldValue('departmentId', id);
    generateEmployeeCode(id);
    setShowDepartmentModal(false);
  };

  const handlePositionCreated = (id: string, name: string) => {
    // Reload positions
    loadDropdownData();
    // Set the newly created position
    form.setFieldValue('positionId', id);
    setShowPositionModal(false);
  };

  const steps = [
    { title: 'Account', icon: <MailOutlined /> },
    { title: 'Personal', icon: <UserOutlined /> },
    { title: 'Contact', icon: <PhoneOutlined /> },
    { title: 'Address', icon: <HomeOutlined /> },
    { title: 'Emergency', icon: <ContactsOutlined /> },
    { title: 'Employment', icon: <BankOutlined /> },
    { title: 'Additional', icon: <IdcardOutlined /> },
    { title: 'Review', icon: <CheckCircleOutlined /> },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        // Account Setup
        return (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Form.Item
              name="email"
              label="Work Email Address"
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Invalid email format' },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="employee@company.com" size="large" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="firstName"
                  label="First Name"
                  rules={[{ required: true, message: 'First name is required' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="John" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="middleName" label="Middle Name">
                  <Input placeholder="(Optional)" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: 'Last name is required' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Doe" size="large" />
            </Form.Item>

            <Form.Item
              name="temporaryPassword"
              label="Temporary Password"
              rules={[
                { required: true, message: 'Temporary password is required' },
                { min: 8, message: 'Password must be at least 8 characters' },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Min 8 characters" size="large" />
            </Form.Item>

            <Alert
              message="First Login Security"
              description="The employee will be required to change this password on their first login."
              type="info"
              showIcon
            />
          </Space>
        );

      case 1:
        // Personal Details
        return (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="dateOfBirth" label="Date of Birth">
                  <DatePicker
                    style={{ width: '100%' }}
                    size="large"
                    placeholder="Select date"
                    disabledDate={(current) => current && current > dayjs().endOf('day')}
                  />
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
                  <Input placeholder="e.g., Indian, American" size="large" />
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
                <Option value="A+">A+</Option>
                <Option value="A-">A-</Option>
                <Option value="B+">B+</Option>
                <Option value="B-">B-</Option>
                <Option value="AB+">AB+</Option>
                <Option value="AB-">AB-</Option>
                <Option value="O+">O+</Option>
                <Option value="O-">O-</Option>
              </Select>
            </Form.Item>

            <Alert
              message="Optional Information"
              description="All personal details are optional and can be updated later. These help with HR records and emergency situations."
              type="info"
              showIcon
            />
          </Space>
        );

      case 2:
        // Contact Information
        return (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Form.Item
              name="personalEmail"
              label="Personal Email"
              rules={[{ type: 'email', message: 'Invalid email format' }]}
            >
              <Input prefix={<MailOutlined />} placeholder="personal@email.com" size="large" />
            </Form.Item>

            <Form.Item
              name="phoneNumber"
              label="Primary Phone Number"
            >
              <Input prefix={<PhoneOutlined />} placeholder="+1 (555) 123-4567" size="large" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="workPhone" label="Work Phone">
                  <Input prefix={<PhoneOutlined />} placeholder="Extension / Direct line" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="alternatePhone" label="Alternate Phone">
                  <Input prefix={<PhoneOutlined />} placeholder="Alternative contact" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Alert
              message="Contact Preferences"
              description="Provide at least one phone number for important communications and emergencies."
              type="info"
              showIcon
            />
          </Space>
        );

      case 3:
        // Address
        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={5}>Current Address</Title>
              <Form.Item name="currentAddressLine1" label="Address Line 1">
                <Input placeholder="Street address" size="large" />
              </Form.Item>

              <Form.Item name="currentAddressLine2" label="Address Line 2">
                <Input placeholder="Apt, suite, etc. (optional)" size="large" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="currentCity" label="City">
                    <Input placeholder="City" size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="currentState" label="State/Province">
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
                    <Input placeholder="ZIP/Postal code" size="large" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Divider />

            <div>
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
                        <Input placeholder="Apt, suite, etc. (optional)" size="large" />
                      </Form.Item>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="permanentCity" label="City">
                            <Input placeholder="City" size="large" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="permanentState" label="State/Province">
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
                            <Input placeholder="ZIP/Postal code" size="large" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </>
                  )
                }
              </Form.Item>
            </div>
          </Space>
        );

      case 4:
        // Emergency Contacts
        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={5}>Primary Emergency Contact</Title>
              <Form.Item name="emergencyContactName" label="Full Name">
                <Input placeholder="Emergency contact name" size="large" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="emergencyContactRelationship" label="Relationship">
                    <Input placeholder="e.g., Spouse, Parent, Sibling" size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="emergencyContactPhone" label="Phone Number">
                    <Input prefix={<PhoneOutlined />} placeholder="+1 (555) 123-4567" size="large" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Divider />

            <div>
              <Title level={5}>Alternate Emergency Contact (Optional)</Title>
              <Form.Item name="alternateEmergencyContactName" label="Full Name">
                <Input placeholder="Alternate emergency contact name" size="large" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="alternateEmergencyContactRelationship" label="Relationship">
                    <Input placeholder="e.g., Spouse, Parent, Sibling" size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="alternateEmergencyContactPhone" label="Phone Number">
                    <Input prefix={<PhoneOutlined />} placeholder="+1 (555) 123-4567" size="large" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Alert
              message="Emergency Contacts"
              description="These contacts will be notified in case of an emergency. Please ensure the information is accurate and up-to-date."
              type="warning"
              showIcon
            />
          </Space>
        );

      case 5:
        // Employment Details
        return (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Row gutter={16}>
              <Col span={16}>
                <Form.Item
                  name="employeeCode"
                  label="Employee Code"
                  rules={[{ required: true, message: 'Employee code is required' }]}
                  extra={employeeCode ? `Auto-generated based on department` : 'Select department to auto-generate code'}
                >
                  <Input
                    placeholder="Will be auto-generated"
                    size="large"
                    disabled={codeGenerating}
                    value={employeeCode}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label=" ">
                  <Button
                    onClick={() => generateEmployeeCode(form.getFieldValue('departmentId'))}
                    loading={codeGenerating}
                    block
                    size="large"
                  >
                    Regenerate Code
                  </Button>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="joiningDate"
              label="Joining Date"
              rules={[{ required: true, message: 'Joining date is required' }]}
            >
              <DatePicker style={{ width: '100%' }} size="large" placeholder="Select joining date" />
            </Form.Item>

            <Form.Item name="departmentId" label="Department">
              <Select
                placeholder="Select department"
                size="large"
                allowClear
                onChange={handleDepartmentChange}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: '8px 0' }} />
                    <Button
                      type="link"
                      icon={<PlusOutlined />}
                      onClick={() => setShowDepartmentModal(true)}
                      block
                    >
                      Create New Department
                    </Button>
                  </>
                )}
              >
                {departments.map((dept) => (
                  <Option key={dept.id} value={dept.id}>
                    {dept.name} {dept.departmentCode && `(${dept.departmentCode})`}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="positionId" label="Position">
              <Select
                placeholder="Select position"
                size="large"
                allowClear
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: '8px 0' }} />
                    <Button
                      type="link"
                      icon={<PlusOutlined />}
                      onClick={() => setShowPositionModal(true)}
                      block
                    >
                      Create New Position
                    </Button>
                  </>
                )}
              >
                {positions.map((pos) => (
                  <Option key={pos.id} value={pos.id}>
                    {pos.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="reportsToId" label="Reports To (Manager)">
              <Select
                placeholder="Select manager"
                size="large"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                }
              >
                {employees.map((emp) => {
                  const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
                  const displayName = fullName || emp.user.email;
                  return (
                    <Option key={emp.id} value={emp.id}>
                      {displayName}
                      {emp.position && ` - ${emp.position.name}`}
                    </Option>
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
                    <Option value="active">Active</Option>
                    <Option value="on_notice">On Notice</Option>
                    <Option value="on_leave">On Leave</Option>
                    <Option value="suspended">Suspended</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider>Vendor/Client/Project Assignment (Optional)</Divider>

            <Form.Item name="vendorId" label="Vendor">
              <Select placeholder="Select vendor" size="large" allowClear showSearch optionFilterProp="children">
                {vendors.map((vendor) => (
                  <Option key={vendor.id} value={vendor.id}>
                    {vendor.name} ({vendor.vendorCode})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="clientId" label="Client">
              <Select placeholder="Select client" size="large" allowClear showSearch optionFilterProp="children">
                {clients.map((client) => (
                  <Option key={client.id} value={client.id}>
                    {client.name} ({client.clientCode})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="projectId" label="Project">
              <Select placeholder="Select project" size="large" allowClear showSearch optionFilterProp="children">
                {projects.map((project) => (
                  <Option key={project.id} value={project.id}>
                    {project.projectName} ({project.projectCode}) - {project.clientName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Divider>Probation & Contract Details (Optional)</Divider>

            <Form.Item name="isProbation" valuePropName="checked">
              <Checkbox>Employee is on probation</Checkbox>
            </Form.Item>

            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.isProbation !== curr.isProbation}>
              {({ getFieldValue }) =>
                getFieldValue('isProbation') && (
                  <>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="probationStartDate"
                          label="Probation Start Date"
                          rules={[{ required: true, message: 'Start date is required' }]}
                        >
                          <DatePicker size="large" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="probationEndDate"
                          label="Probation End Date"
                          rules={[
                            { required: true, message: 'End date is required' },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                const startDate = getFieldValue('probationStartDate');
                                if (!value || !startDate || value.isAfter(startDate)) {
                                  return Promise.resolve();
                                }
                                return Promise.reject(new Error('End date must be after start date'));
                              },
                            }),
                          ]}
                        >
                          <DatePicker size="large" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                )
              }
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="contractStartDate" label="Contract Start Date">
                  <DatePicker size="large" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="contractEndDate" label="Contract End Date">
                  <DatePicker size="large" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="permissionGroupIds" label="Permission Groups">
              <Select
                mode="multiple"
                placeholder="Select permission groups (optional)"
                size="large"
                allowClear
              >
                {permissionGroups.map((group) => (
                  <Option key={group.id} value={group.id}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{group.name}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>{group.description}</div>
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

      case 6:
        // Additional Information (KYC - all optional)
        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              message="Optional Information"
              description="All fields in this section are optional and can be filled later. These help with payroll, compliance, and legal requirements."
              type="info"
              showIcon
            />

            <Divider>Compensation</Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="basicSalary" label="Basic Salary">
                  <InputNumber
                    placeholder="0.00"
                    min={0}
                    precision={2}
                    style={{ width: '100%' }}
                    size="large"
                    prefix="$"
                  />
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

            <Form.Item name="bankAccountNumber" label="Bank Account Number">
              <Input placeholder="Account number" size="large" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="bankName" label="Bank Name">
                  <Input placeholder="Name of the bank" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="bankBranch" label="Branch">
                  <Input placeholder="Branch name" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="ifscCode" label="IFSC/Routing Code">
              <Input placeholder="IFSC code (India) or Routing number (USA)" size="large" />
            </Form.Item>

            <Divider>Tax & Legal</Divider>

            <Form.Item name="taxIdentificationNumber" label="Tax ID Number">
              <Input placeholder="Tax identification number" size="large" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="panNumber" label="PAN Number (India)">
                  <Input placeholder="Permanent Account Number" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="aadharNumber" label="Aadhar Number (India)">
                  <Input placeholder="12-digit Aadhar number" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="uanNumber" label="UAN Number (India)">
              <Input placeholder="Universal Account Number" size="large" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="ssnNumber" label="SSN (USA)">
                  <Input placeholder="Social Security Number" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="driversLicenseNumber" label="Driver's License (USA)">
                  <Input placeholder="Driver's license number" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="passportNumber" label="Passport Number">
              <Input placeholder="Passport number" size="large" />
            </Form.Item>
          </Space>
        );

      case 7:
        // Review
        const reviewData = form.getFieldsValue();
        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title="Account & Personal" size="small">
              <p><strong>Name:</strong> {reviewData.firstName} {reviewData.middleName} {reviewData.lastName}</p>
              <p><strong>Work Email:</strong> {reviewData.email}</p>
              {reviewData.dateOfBirth && (
                <p><strong>Date of Birth:</strong> {dayjs(reviewData.dateOfBirth).format('YYYY-MM-DD')}</p>
              )}
              {reviewData.gender && <p><strong>Gender:</strong> {reviewData.gender}</p>}
              {reviewData.nationality && <p><strong>Nationality:</strong> {reviewData.nationality}</p>}
            </Card>

            <Card title="Employment Details" size="small">
              <p><strong>Employee Code:</strong> <Tag color="blue">{reviewData.employeeCode || 'To be generated'}</Tag></p>
              <p><strong>Joining Date:</strong> {reviewData.joiningDate ? dayjs(reviewData.joiningDate).format('YYYY-MM-DD') : 'Not set'}</p>
              <p>
                <strong>Department:</strong>{' '}
                {departments.find((d) => d.id === reviewData.departmentId)?.name || 'Not assigned'}
              </p>
              <p>
                <strong>Position:</strong>{' '}
                {positions.find((p) => p.id === reviewData.positionId)?.name || 'Not assigned'}
              </p>
              <p><strong>Employment Type:</strong> <Tag>{reviewData.employmentType || 'internal'}</Tag></p>
              <p><strong>Status:</strong> <Tag color="green">{reviewData.employmentStatus || 'active'}</Tag></p>
            </Card>

            {(reviewData.currentAddressLine1 || reviewData.phoneNumber || reviewData.personalEmail) && (
              <Card title="Contact & Address" size="small">
                {reviewData.personalEmail && <p><strong>Personal Email:</strong> {reviewData.personalEmail}</p>}
                {reviewData.phoneNumber && <p><strong>Phone:</strong> {reviewData.phoneNumber}</p>}
                {reviewData.currentAddressLine1 && (
                  <p>
                    <strong>Address:</strong> {reviewData.currentAddressLine1}, {reviewData.currentCity},{' '}
                    {reviewData.currentState} {reviewData.currentPostalCode}
                  </p>
                )}
              </Card>
            )}

            {(reviewData.vendorId || reviewData.clientId || reviewData.projectId) && (
              <Card title="Vendor/Client/Project Assignment" size="small">
                {reviewData.vendorId && (
                  <p>
                    <strong>Vendor:</strong>{' '}
                    {vendors.find((v) => v.id === reviewData.vendorId)?.name || 'N/A'}
                  </p>
                )}
                {reviewData.clientId && (
                  <p>
                    <strong>Client:</strong>{' '}
                    {clients.find((c) => c.id === reviewData.clientId)?.name || 'N/A'}
                  </p>
                )}
                {reviewData.projectId && (
                  <p>
                    <strong>Project:</strong>{' '}
                    {projects.find((p) => p.id === reviewData.projectId)?.projectName || 'N/A'}
                  </p>
                )}
              </Card>
            )}

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

            <Alert
              message="Ready to Create Employee"
              description="Review all information above. Click 'Create Employee' to proceed."
              type="success"
              showIcon
            />
          </Space>
        );

      default:
        return null;
    }
  };

  if (success) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Card>
            <Alert
              message="Employee Created Successfully!"
              description="The employee has been created with all provided information. Redirecting to employee list..."
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
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Title level={3}>Create New Employee</Title>

            <Steps current={currentStep} style={{ marginBottom: 24 }} size="small">
              {steps.map((step, index) => (
                <Steps.Step key={index} title={step.title} icon={step.icon} />
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

            <Form form={form} layout="vertical" initialValues={{ employmentType: 'internal', employmentStatus: 'active', currency: 'USD', payFrequency: 'monthly' }}>
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
              <Button onClick={() => navigate('/admin/employees')} style={{ borderRadius: 8 }}>
                Cancel
              </Button>
            </div>
          </Space>
        </Card>
      </div>

      {/* Modals */}
      <CreateDepartmentModal
        open={showDepartmentModal}
        onCancel={() => setShowDepartmentModal(false)}
        onSuccess={handleDepartmentCreated}
      />

      <CreatePositionModal
        open={showPositionModal}
        onCancel={() => setShowPositionModal(false)}
        onSuccess={handlePositionCreated}
      />
    </div>
  );
};
