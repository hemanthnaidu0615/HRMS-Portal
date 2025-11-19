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
  Upload,
  Avatar,
  Result,
  Progress,
} from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
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
  CameraOutlined,
  LoadingOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import { orgadminApi } from '../../api/orgadminApi';
import { getAllVendors } from '../../api/vendorApi';
import { getAllClients } from '../../api/clientApi';
import { getAllProjects } from '../../api/projectApi';
import { CreateDepartmentModal } from '../../components/CreateDepartmentModal';
import { CreatePositionModal } from '../../components/CreatePositionModal';
import { PasswordStrengthMeter } from '../../components/ValidatedFormItem';
import {
  emailRule,
  phoneRule,
  passwordStrengthRule,
  employeeCodeRule,
  salaryRule,
  taxIdRule,
  noFutureDateRule,
  positiveNumberRule
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
      // Scroll to top when moving to next step
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.log('Validation failed:', err);
      // Get the first error field
      const errorFields = err.errorFields;
      if (errorFields && errorFields.length > 0) {
        const firstErrorField = errorFields[0].name[0];
        // Scroll to the first error field
        form.scrollToField(firstErrorField, {
          behavior: 'smooth',
          block: 'center',
        });
        // Show error message
        message.error(`Please fill in all required fields: ${errorFields.map((f: any) => f.errors[0]).join(', ')}`);
      } else {
        message.error('Please fill in all required fields before proceeding');
      }
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

      const values = form.getFieldsValue(true);

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

  const handlePhotoUpload = (file: UploadFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file as any);
    setPhotoFile(file);
    return false; // Prevent auto upload
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
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={handlePhotoUpload}
                maxCount={1}
              >
                <div
                  style={{
                    position: 'relative',
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: photoPreview
                      ? `url(${photoPreview}) center/cover`
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: '4px solid #f0f0f0',
                    transition: 'all 0.3s',
                  }}
                >
                  {!photoPreview && (
                    <CameraOutlined style={{ fontSize: 36, color: '#fff' }} />
                  )}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      background: '#0a0d54',
                      borderRadius: '50%',
                      width: 36,
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 16,
                    }}
                  >
                    <CameraOutlined />
                  </div>
                </div>
              </Upload>
              <Typography.Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 8 }}>
                Click to upload employee photo (optional)
              </Typography.Text>
            </div>

            <Form.Item
              name="email"
              label={<span>Work Email Address <span style={{ color: '#ff4d4f' }}>*</span></span>}
              rules={[
                { required: true, message: 'Email is required' },
                emailRule,
              ]}
              extra="This will be the employee's login email"
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
              label={<span>Temporary Password <span style={{ color: '#ff4d4f' }}>*</span></span>}
              rules={[
                { required: true, message: 'Temporary password is required' },
                passwordStrengthRule,
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Min 8 characters, mix of upper/lower/number/special" size="large" />
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.temporaryPassword !== curr.temporaryPassword}>
              {({ getFieldValue }) => (
                <PasswordStrengthMeter password={getFieldValue('temporaryPassword') || ''} />
              )}
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
                <Form.Item name="dateOfBirth" label="Date of Birth" rules={[noFutureDateRule]}>
                  <DatePicker
                    style={{ width: '100%' }}
                    size="large"
                    placeholder="Select date"
                    disabledDate={(current) => current && (current > dayjs().endOf('day') || current < dayjs().subtract(100, 'year'))}
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
              rules={[emailRule]}
            >
              <Input prefix={<MailOutlined />} placeholder="personal@email.com" size="large" />
            </Form.Item>

            <Form.Item
              name="phoneNumber"
              label="Primary Phone Number"
              rules={[phoneRule]}
              extra="Format: +1 (555) 123-4567 or +91-1234567890"
            >
              <Input prefix={<PhoneOutlined />} placeholder="+1 (555) 123-4567" size="large" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="workPhone" label="Work Phone" rules={[phoneRule]}>
                  <Input prefix={<PhoneOutlined />} placeholder="Extension / Direct line" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="alternatePhone" label="Alternate Phone" rules={[phoneRule]}>
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
                  <Form.Item name="emergencyContactPhone" label="Phone Number" rules={[phoneRule]}>
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
                  <Form.Item name="alternateEmergencyContactPhone" label="Phone Number" rules={[phoneRule]}>
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
            <Alert
              message="Department Selection"
              description="Select a department first to auto-generate the employee code based on department standards."
              type="info"
              showIcon
            />

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

            <Form.Item
              name="joiningDate"
              label={<span>Joining Date <span style={{ color: '#ff4d4f' }}>*</span></span>}
              rules={[{ required: true, message: 'Joining date is required' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                size="large"
                placeholder="Select joining date"
                disabledDate={(current) => current && current < dayjs().subtract(5, 'year')}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={16}>
                <Form.Item
                  name="employeeCode"
                  label={<span>Employee Code <span style={{ color: '#ff4d4f' }}>*</span></span>}
                  rules={[
                    { required: true, message: 'Employee code is required' },
                  ]}
                  extra={employeeCode ? `Auto-generated: ${employeeCode}` : 'Will be auto-generated when you select a department'}
                >
                  <Input
                    placeholder="Auto-generated based on department"
                    size="large"
                    disabled={true}
                    value={employeeCode}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label=" ">
                  <Button
                    onClick={() => generateEmployeeCode(form.getFieldValue('departmentId'))}
                    loading={codeGenerating}
                    disabled={!form.getFieldValue('departmentId')}
                    block
                    size="large"
                  >
                    Regenerate Code
                  </Button>
                </Form.Item>
              </Col>
            </Row>

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

            <Divider>Employment Type & Status</Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="employmentType"
                  label="Employment Type"
                  initialValue="internal"
                  tooltip="Select the type of employment relationship"
                >
                  <Select size="large">
                    <Option value="internal">
                      <div>
                        <div style={{ fontWeight: 500 }}>Internal</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>Regular employee on payroll</div>
                      </div>
                    </Option>
                    <Option value="contract">
                      <div>
                        <div style={{ fontWeight: 500 }}>Contract</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>Contractor with fixed-term contract</div>
                      </div>
                    </Option>
                    <Option value="client">
                      <div>
                        <div style={{ fontWeight: 500 }}>Client</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>Client-side employee working with us</div>
                      </div>
                    </Option>
                    <Option value="consultant">
                      <div>
                        <div style={{ fontWeight: 500 }}>Consultant</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>External consultant</div>
                      </div>
                    </Option>
                    <Option value="intern">
                      <div>
                        <div style={{ fontWeight: 500 }}>Intern</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>Internship/Training program</div>
                      </div>
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="employmentStatus"
                  label="Employment Status"
                  initialValue="active"
                  tooltip="Current status of the employee"
                >
                  <Select size="large">
                    <Option value="active">
                      <Tag color="green">Active</Tag> - Currently working
                    </Option>
                    <Option value="on_notice">
                      <Tag color="orange">On Notice</Tag> - Serving notice period
                    </Option>
                    <Option value="on_leave">
                      <Tag color="blue">On Leave</Tag> - Temporarily away
                    </Option>
                    <Option value="suspended">
                      <Tag color="red">Suspended</Tag> - Temporarily suspended
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider>Vendor/Client/Project Assignment (Optional)</Divider>

            <Alert
              message="Assignment Options"
              description="Assign employees to vendors, clients, or projects if they are working on specific contracts or client projects. Leave blank for internal employees with no specific assignment."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.employmentType !== curr.employmentType}>
              {({ getFieldValue }) => {
                const empType = getFieldValue('employmentType');
                return (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {(empType === 'contract' || empType === 'consultant') && (
                      <Form.Item name="vendorId" label="Vendor">
                        <Select placeholder="Select vendor (if working through a vendor)" size="large" allowClear showSearch optionFilterProp="children">
                          {vendors.map((vendor) => (
                            <Option key={vendor.id} value={vendor.id}>
                              {vendor.name} ({vendor.vendorCode})
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    )}

                    {(empType === 'client' || empType === 'contract' || empType === 'consultant') && (
                      <>
                        <Form.Item name="clientId" label="Client">
                          <Select placeholder="Select client (if working for specific client)" size="large" allowClear showSearch optionFilterProp="children">
                            {clients.map((client) => (
                              <Option key={client.id} value={client.id}>
                                {client.name} ({client.clientCode})
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <Form.Item name="projectId" label="Project">
                          <Select placeholder="Select project (if assigned to specific project)" size="large" allowClear showSearch optionFilterProp="children">
                            {projects.map((project) => (
                              <Option key={project.id} value={project.id}>
                                {project.projectName} ({project.projectCode}) - {project.clientName}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </>
                    )}

                    {empType === 'internal' && (
                      <Alert
                        message="Internal Employee"
                        description="Internal employees typically don't require vendor/client/project assignments unless they are working on client projects."
                        type="info"
                        showIcon
                      />
                    )}
                  </Space>
                );
              }}
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
                <Form.Item
                  name="basicSalary"
                  label="Basic Salary"
                  rules={[positiveNumberRule, salaryRule(0, 10000000)]}
                  extra="Annual salary in selected currency"
                >
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

            <Form.Item name="taxIdentificationNumber" label="Tax ID Number" rules={[taxIdRule]}>
              <Input placeholder="Tax identification number" size="large" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="panNumber" label="PAN Number (India)" rules={[taxIdRule]}>
                  <Input placeholder="Permanent Account Number" size="large" maxLength={10} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="aadharNumber" label="Aadhar Number (India)" rules={[taxIdRule]}>
                  <Input placeholder="12-digit Aadhar number" size="large" maxLength={12} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="uanNumber" label="UAN Number (India)" rules={[taxIdRule]}>
              <Input placeholder="Universal Account Number" size="large" maxLength={12} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="ssnNumber" label="SSN (USA)" rules={[taxIdRule]}>
                  <Input placeholder="Social Security Number" size="large" maxLength={11} />
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
        const reviewData = form.getFieldsValue(true);
        const hasPersonalData = reviewData.dateOfBirth || reviewData.gender || reviewData.nationality || reviewData.maritalStatus || reviewData.bloodGroup;
        const hasContactData = reviewData.personalEmail || reviewData.phoneNumber || reviewData.workPhone || reviewData.alternatePhone;
        const hasAddressData = reviewData.currentAddressLine1 || reviewData.currentCity || reviewData.currentState || reviewData.currentCountry;
        const hasEmergencyContact = reviewData.emergencyContactName || reviewData.emergencyContactPhone;
        const hasBankData = reviewData.bankAccountNumber || reviewData.bankName || reviewData.ifscCode;
        const hasCompensation = reviewData.basicSalary;

        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              message="Review Your Information"
              description="Please review all the information below. You can go back to previous steps to make changes."
              type="info"
              showIcon
            />

            <Card title="Account Information" size="small" style={{ background: '#fafafa' }}>
              <Row gutter={[16, 8]}>
                <Col span={12}><strong>Name:</strong></Col>
                <Col span={12}>{reviewData.firstName} {reviewData.middleName || ''} {reviewData.lastName}</Col>
                <Col span={12}><strong>Work Email:</strong></Col>
                <Col span={12}>{reviewData.email}</Col>
              </Row>
            </Card>

            <Card title="Employment Details" size="small" style={{ background: '#fafafa' }}>
              <Row gutter={[16, 8]}>
                <Col span={12}><strong>Employee Code:</strong></Col>
                <Col span={12}><Tag color="blue">{reviewData.employeeCode || employeeCode || 'To be generated'}</Tag></Col>
                <Col span={12}><strong>Joining Date:</strong></Col>
                <Col span={12}>{reviewData.joiningDate ? dayjs(reviewData.joiningDate).format('MMMM DD, YYYY') : 'Not set'}</Col>
                <Col span={12}><strong>Department:</strong></Col>
                <Col span={12}>{departments.find((d) => d.id === reviewData.departmentId)?.name || 'Not assigned'}</Col>
                <Col span={12}><strong>Position:</strong></Col>
                <Col span={12}>{positions.find((p) => p.id === reviewData.positionId)?.name || 'Not assigned'}</Col>
                {reviewData.reportsToId && (
                  <>
                    <Col span={12}><strong>Reports To:</strong></Col>
                    <Col span={12}>
                      {(() => {
                        const manager = employees.find((e) => e.id === reviewData.reportsToId);
                        return manager ? `${manager.firstName || ''} ${manager.lastName || ''}`.trim() || manager.user.email : 'Not assigned';
                      })()}
                    </Col>
                  </>
                )}
                <Col span={12}><strong>Employment Type:</strong></Col>
                <Col span={12}><Tag>{reviewData.employmentType || 'internal'}</Tag></Col>
                <Col span={12}><strong>Status:</strong></Col>
                <Col span={12}><Tag color="green">{reviewData.employmentStatus || 'active'}</Tag></Col>
              </Row>
            </Card>

            {hasPersonalData && (
              <Card title="Personal Details" size="small" style={{ background: '#fafafa' }}>
                <Row gutter={[16, 8]}>
                  {reviewData.dateOfBirth && (
                    <>
                      <Col span={12}><strong>Date of Birth:</strong></Col>
                      <Col span={12}>{dayjs(reviewData.dateOfBirth).format('MMMM DD, YYYY')}</Col>
                    </>
                  )}
                  {reviewData.gender && (
                    <>
                      <Col span={12}><strong>Gender:</strong></Col>
                      <Col span={12}>{reviewData.gender}</Col>
                    </>
                  )}
                  {reviewData.nationality && (
                    <>
                      <Col span={12}><strong>Nationality:</strong></Col>
                      <Col span={12}>{reviewData.nationality}</Col>
                    </>
                  )}
                  {reviewData.maritalStatus && (
                    <>
                      <Col span={12}><strong>Marital Status:</strong></Col>
                      <Col span={12}>{reviewData.maritalStatus}</Col>
                    </>
                  )}
                  {reviewData.bloodGroup && (
                    <>
                      <Col span={12}><strong>Blood Group:</strong></Col>
                      <Col span={12}><Tag color="red">{reviewData.bloodGroup}</Tag></Col>
                    </>
                  )}
                </Row>
              </Card>
            )}

            {hasContactData && (
              <Card title="Contact Information" size="small" style={{ background: '#fafafa' }}>
                <Row gutter={[16, 8]}>
                  {reviewData.personalEmail && (
                    <>
                      <Col span={12}><strong>Personal Email:</strong></Col>
                      <Col span={12}>{reviewData.personalEmail}</Col>
                    </>
                  )}
                  {reviewData.phoneNumber && (
                    <>
                      <Col span={12}><strong>Phone:</strong></Col>
                      <Col span={12}>{reviewData.phoneNumber}</Col>
                    </>
                  )}
                  {reviewData.workPhone && (
                    <>
                      <Col span={12}><strong>Work Phone:</strong></Col>
                      <Col span={12}>{reviewData.workPhone}</Col>
                    </>
                  )}
                  {reviewData.alternatePhone && (
                    <>
                      <Col span={12}><strong>Alternate Phone:</strong></Col>
                      <Col span={12}>{reviewData.alternatePhone}</Col>
                    </>
                  )}
                </Row>
              </Card>
            )}

            {hasAddressData && (
              <Card title="Address" size="small" style={{ background: '#fafafa' }}>
                <Row gutter={[16, 8]}>
                  {reviewData.currentAddressLine1 && (
                    <>
                      <Col span={24}><strong>Current Address:</strong></Col>
                      <Col span={24}>
                        {reviewData.currentAddressLine1}
                        {reviewData.currentAddressLine2 && `, ${reviewData.currentAddressLine2}`}
                        {reviewData.currentCity && `, ${reviewData.currentCity}`}
                        {reviewData.currentState && `, ${reviewData.currentState}`}
                        {reviewData.currentCountry && `, ${reviewData.currentCountry}`}
                        {reviewData.currentPostalCode && ` - ${reviewData.currentPostalCode}`}
                      </Col>
                    </>
                  )}
                  {!reviewData.sameAsCurrentAddress && reviewData.permanentAddressLine1 && (
                    <>
                      <Col span={24} style={{ marginTop: 8 }}><strong>Permanent Address:</strong></Col>
                      <Col span={24}>
                        {reviewData.permanentAddressLine1}
                        {reviewData.permanentAddressLine2 && `, ${reviewData.permanentAddressLine2}`}
                        {reviewData.permanentCity && `, ${reviewData.permanentCity}`}
                        {reviewData.permanentState && `, ${reviewData.permanentState}`}
                        {reviewData.permanentCountry && `, ${reviewData.permanentCountry}`}
                        {reviewData.permanentPostalCode && ` - ${reviewData.permanentPostalCode}`}
                      </Col>
                    </>
                  )}
                  {reviewData.sameAsCurrentAddress && (
                    <>
                      <Col span={24} style={{ marginTop: 8 }}><strong>Permanent Address:</strong></Col>
                      <Col span={24}><Text type="secondary">Same as current address</Text></Col>
                    </>
                  )}
                </Row>
              </Card>
            )}

            {hasEmergencyContact && (
              <Card title="Emergency Contacts" size="small" style={{ background: '#fafafa' }}>
                <Row gutter={[16, 8]}>
                  {reviewData.emergencyContactName && (
                    <>
                      <Col span={12}><strong>Primary Contact:</strong></Col>
                      <Col span={12}>
                        {reviewData.emergencyContactName}
                        {reviewData.emergencyContactRelationship && ` (${reviewData.emergencyContactRelationship})`}
                        {reviewData.emergencyContactPhone && ` - ${reviewData.emergencyContactPhone}`}
                      </Col>
                    </>
                  )}
                  {reviewData.alternateEmergencyContactName && (
                    <>
                      <Col span={12}><strong>Alternate Contact:</strong></Col>
                      <Col span={12}>
                        {reviewData.alternateEmergencyContactName}
                        {reviewData.alternateEmergencyContactRelationship && ` (${reviewData.alternateEmergencyContactRelationship})`}
                        {reviewData.alternateEmergencyContactPhone && ` - ${reviewData.alternateEmergencyContactPhone}`}
                      </Col>
                    </>
                  )}
                </Row>
              </Card>
            )}

            {(reviewData.vendorId || reviewData.clientId || reviewData.projectId) && (
              <Card title="Vendor/Client/Project Assignment" size="small" style={{ background: '#fafafa' }}>
                <Row gutter={[16, 8]}>
                  {reviewData.vendorId && (
                    <>
                      <Col span={12}><strong>Vendor:</strong></Col>
                      <Col span={12}>{vendors.find((v) => v.id === reviewData.vendorId)?.name || 'N/A'}</Col>
                    </>
                  )}
                  {reviewData.clientId && (
                    <>
                      <Col span={12}><strong>Client:</strong></Col>
                      <Col span={12}>{clients.find((c) => c.id === reviewData.clientId)?.name || 'N/A'}</Col>
                    </>
                  )}
                  {reviewData.projectId && (
                    <>
                      <Col span={12}><strong>Project:</strong></Col>
                      <Col span={12}>{projects.find((p) => p.id === reviewData.projectId)?.projectName || 'N/A'}</Col>
                    </>
                  )}
                </Row>
              </Card>
            )}

            {hasCompensation && (
              <Card title="Compensation" size="small" style={{ background: '#fafafa' }}>
                <Row gutter={[16, 8]}>
                  <Col span={12}><strong>Basic Salary:</strong></Col>
                  <Col span={12}>
                    {reviewData.currency || 'USD'} {reviewData.basicSalary?.toLocaleString() || '0'}
                    {reviewData.payFrequency && ` (${reviewData.payFrequency})`}
                  </Col>
                </Row>
              </Card>
            )}

            {hasBankData && (
              <Card title="Bank Details" size="small" style={{ background: '#fafafa' }}>
                <Row gutter={[16, 8]}>
                  {reviewData.bankName && (
                    <>
                      <Col span={12}><strong>Bank Name:</strong></Col>
                      <Col span={12}>{reviewData.bankName}</Col>
                    </>
                  )}
                  {reviewData.bankAccountNumber && (
                    <>
                      <Col span={12}><strong>Account Number:</strong></Col>
                      <Col span={12}>****{reviewData.bankAccountNumber.slice(-4)}</Col>
                    </>
                  )}
                  {reviewData.ifscCode && (
                    <>
                      <Col span={12}><strong>IFSC/Routing Code:</strong></Col>
                      <Col span={12}>{reviewData.ifscCode}</Col>
                    </>
                  )}
                </Row>
              </Card>
            )}

            {reviewData.isProbation && (
              <Card title="Probation Details" size="small" style={{ background: '#fff3cd' }}>
                <Row gutter={[16, 8]}>
                  <Col span={12}><strong>Probation Period:</strong></Col>
                  <Col span={12}>
                    {reviewData.probationStartDate ? dayjs(reviewData.probationStartDate).format('MMM DD, YYYY') : 'N/A'}
                    {' to '}
                    {reviewData.probationEndDate ? dayjs(reviewData.probationEndDate).format('MMM DD, YYYY') : 'N/A'}
                  </Col>
                </Row>
              </Card>
            )}

            <Card title="Permissions" size="small" style={{ background: '#fafafa' }}>
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
      <div style={{ padding: 24, minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 600, width: '100%' }}>
          <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', textAlign: 'center' }}>
            <Result
              status="success"
              icon={
                <div
                  style={{
                    animation: 'scaleIn 0.5s ease-out',
                  }}
                >
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 72 }} />
                </div>
              }
              title={
                <span style={{ fontSize: 24, fontWeight: 600, color: '#0a0d54' }}>
                  Employee Created Successfully!
                </span>
              }
              subTitle={
                <Space direction="vertical" size="middle" style={{ marginTop: 16 }}>
                  <Typography.Text style={{ fontSize: 16 }}>
                    The employee account has been created with all provided information.
                  </Typography.Text>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <LoadingOutlined style={{ fontSize: 16, color: '#0a0d54' }} />
                    <Typography.Text type="secondary">
                      Redirecting to employee list...
                    </Typography.Text>
                  </div>
                </Space>
              }
              extra={
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate('/admin/employees')}
                  style={{
                    background: '#0a0d54',
                    borderColor: '#0a0d54',
                    borderRadius: 8,
                    marginTop: 16,
                  }}
                >
                  Go to Employee List Now
                </Button>
              }
            />
          </Card>
          <style>{`
            @keyframes scaleIn {
              from {
                transform: scale(0);
                opacity: 0;
              }
              to {
                transform: scale(1);
                opacity: 1;
              }
            }
          `}</style>
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
