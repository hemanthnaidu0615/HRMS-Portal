import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, Select, Row, Col, InputNumber, Tabs, Space, Skeleton, Alert, Checkbox } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { SaveOutlined, ArrowLeftOutlined, TeamOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';

const { Option } = Select;
const { TextArea } = Input;

const JobsFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [skills, setSkills] = useState<string[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);

  useEffect(() => {
    if (isEdit) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/recruitment/jobs/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = response.data;
      form.setFieldsValue(data);
      if (data.skills) setSkills(data.skills);
      if (data.benefits) setBenefits(data.benefits);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch job posting');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setSaveLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...values,
        skills,
        benefits,
      };

      if (isEdit) {
        await axios.put(
          `${API_BASE_URL}/recruitment/jobs/${id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Job posting updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/recruitment/jobs`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Job posting created successfully');
      }
      navigate('/admin/recruitment/jobs');
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} job posting`);
    } finally {
      setSaveLoading(false);
    }
  };

  const defaultBenefits = [
    'Health Insurance',
    'Dental Insurance',
    'Vision Insurance',
    '401(k) Matching',
    'Paid Time Off',
    'Remote Work',
    'Flexible Hours',
    'Professional Development',
    'Gym Membership',
    'Life Insurance',
  ];

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      </div>
    );
  }

  const tabItems = [
    {
      key: '1',
      label: 'Basic Information',
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Form.Item
                name="title"
                label={<span style={{ fontWeight: 500, fontSize: 14 }}>Job Title</span>}
                rules={[{ required: true, message: 'Please enter job title' }]}
              >
                <Input
                  placeholder="e.g. Senior Software Engineer"
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="openings"
                label={<span style={{ fontWeight: 500, fontSize: 14 }}>Number of Openings</span>}
                rules={[{ required: true, message: 'Please enter number of openings' }]}
                initialValue={1}
              >
                <InputNumber
                  placeholder="0"
                  min={1}
                  size="large"
                  style={{ width: '100%', borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="department"
                label={<span style={{ fontWeight: 500, fontSize: 14 }}>Department</span>}
                rules={[{ required: true, message: 'Please select department' }]}
              >
                <Select
                  placeholder="Select department"
                  size="large"
                  style={{ borderRadius: 8 }}
                  showSearch
                >
                  <Option value="Engineering">Engineering</Option>
                  <Option value="Product">Product</Option>
                  <Option value="Design">Design</Option>
                  <Option value="Marketing">Marketing</Option>
                  <Option value="Sales">Sales</Option>
                  <Option value="Human Resources">Human Resources</Option>
                  <Option value="Finance">Finance</Option>
                  <Option value="Operations">Operations</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="location"
                label={<span style={{ fontWeight: 500, fontSize: 14 }}>Location</span>}
                rules={[{ required: true, message: 'Please enter location' }]}
              >
                <Input
                  placeholder="e.g. San Francisco, CA or Remote"
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="employmentType"
                label={<span style={{ fontWeight: 500, fontSize: 14 }}>Employment Type</span>}
                rules={[{ required: true, message: 'Please select employment type' }]}
              >
                <Select placeholder="Select employment type" size="large" style={{ borderRadius: 8 }}>
                  <Option value="Full-time">Full-time</Option>
                  <Option value="Part-time">Part-time</Option>
                  <Option value="Contract">Contract</Option>
                  <Option value="Internship">Internship</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="experience"
                label={<span style={{ fontWeight: 500, fontSize: 14 }}>Experience Level</span>}
                rules={[{ required: true, message: 'Please select experience level' }]}
              >
                <Select placeholder="Select experience level" size="large" style={{ borderRadius: 8 }}>
                  <Option value="Entry Level (0-2 years)">Entry Level (0-2 years)</Option>
                  <Option value="Mid Level (2-5 years)">Mid Level (2-5 years)</Option>
                  <Option value="Senior Level (5-10 years)">Senior Level (5-10 years)</Option>
                  <Option value="Lead/Principal (10+ years)">Lead/Principal (10+ years)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="status"
            label={<span style={{ fontWeight: 500, fontSize: 14 }}>Status</span>}
            rules={[{ required: true, message: 'Please select status' }]}
            initialValue="Open"
          >
            <Select placeholder="Select status" size="large" style={{ borderRadius: 8 }}>
              <Option value="Draft">Draft</Option>
              <Option value="Open">Open</Option>
              <Option value="On Hold">On Hold</Option>
              <Option value="Closed">Closed</Option>
            </Select>
          </Form.Item>
        </Space>
      ),
    },
    {
      key: '2',
      label: 'Job Details',
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Form.Item
            name="description"
            label={<span style={{ fontWeight: 500, fontSize: 14 }}>Job Description</span>}
            rules={[{ required: true, message: 'Please enter job description' }]}
          >
            <TextArea
              placeholder="Provide a detailed description of the role, responsibilities, and what a typical day looks like..."
              rows={8}
              style={{ borderRadius: 8, fontSize: 14, lineHeight: '1.6' }}
              showCount
              maxLength={5000}
            />
          </Form.Item>

          <Form.Item
            name="requirements"
            label={<span style={{ fontWeight: 500, fontSize: 14 }}>Requirements & Qualifications</span>}
            rules={[{ required: true, message: 'Please enter requirements' }]}
          >
            <TextArea
              placeholder="List the required qualifications, education, certifications, and experience..."
              rows={8}
              style={{ borderRadius: 8, fontSize: 14, lineHeight: '1.6' }}
              showCount
              maxLength={5000}
            />
          </Form.Item>

          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 14 }}>
              Required Skills
            </label>
            <Select
              mode="tags"
              placeholder="Type and press Enter to add skills (e.g., React, Node.js, Python)"
              size="large"
              style={{ width: '100%', borderRadius: 8 }}
              value={skills}
              onChange={setSkills}
              tokenSeparators={[',']}
            >
              <Option value="React">React</Option>
              <Option value="Node.js">Node.js</Option>
              <Option value="Python">Python</Option>
              <Option value="Java">Java</Option>
              <Option value="JavaScript">JavaScript</Option>
              <Option value="TypeScript">TypeScript</Option>
              <Option value="AWS">AWS</Option>
              <Option value="Docker">Docker</Option>
              <Option value="Kubernetes">Kubernetes</Option>
            </Select>
            <div style={{ marginTop: 6, color: '#8c8c8c', fontSize: 13 }}>
              Add relevant technical and soft skills required for this position
            </div>
          </div>
        </Space>
      ),
    },
    {
      key: '3',
      label: 'Compensation & Benefits',
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Alert
            message="Salary Information"
            description="Providing salary range helps attract qualified candidates and sets clear expectations."
            type="info"
            showIcon
            style={{ borderRadius: 8 }}
          />

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="salaryMin"
                label={<span style={{ fontWeight: 500, fontSize: 14 }}>Minimum Salary (Annual)</span>}
              >
                <InputNumber
                  placeholder="0"
                  min={0}
                  prefix="$"
                  size="large"
                  style={{ width: '100%', borderRadius: 8 }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="salaryMax"
                label={<span style={{ fontWeight: 500, fontSize: 14 }}>Maximum Salary (Annual)</span>}
              >
                <InputNumber
                  placeholder="0"
                  min={0}
                  prefix="$"
                  size="large"
                  style={{ width: '100%', borderRadius: 8 }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <div>
            <label style={{ display: 'block', marginBottom: 12, fontWeight: 500, fontSize: 14 }}>
              Benefits & Perks
            </label>
            <Checkbox.Group
              value={benefits}
              onChange={(checkedValues) => setBenefits(checkedValues as string[])}
              style={{ width: '100%' }}
            >
              <Row gutter={[16, 16]}>
                {defaultBenefits.map(benefit => (
                  <Col xs={24} sm={12} md={8} key={benefit}>
                    <Checkbox
                      value={benefit}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #d9d9d9',
                        borderRadius: 8,
                        display: 'block',
                        transition: 'all 0.3s',
                      }}
                    >
                      {benefit}
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </div>

          <Form.Item
            name="additionalBenefits"
            label={<span style={{ fontWeight: 500, fontSize: 14 }}>Additional Benefits Details</span>}
          >
            <TextArea
              placeholder="Describe any additional benefits, perks, or unique offerings..."
              rows={4}
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
        </Space>
      ),
    },
    {
      key: '4',
      label: 'Preview',
      children: (
        <div
          style={{
            background: '#fafafa',
            padding: 24,
            borderRadius: 12,
            border: '1px solid #f0f0f0',
          }}
        >
          <Alert
            message="Job Posting Preview"
            description="This is how your job posting will appear to candidates."
            type="success"
            showIcon
            style={{ marginBottom: 24, borderRadius: 8 }}
          />

          <div style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ borderBottom: '2px solid #13c2c2', paddingBottom: 16, marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 28, fontWeight: 600, color: '#13c2c2' }}>
                {form.getFieldValue('title') || 'Job Title'}
              </h2>
              <Space size="large" style={{ marginTop: 12 }}>
                <span style={{ color: '#8c8c8c' }}>
                  <TeamOutlined style={{ marginRight: 4 }} />
                  {form.getFieldValue('department') || 'Department'}
                </span>
                <span style={{ color: '#8c8c8c' }}>
                  {form.getFieldValue('location') || 'Location'}
                </span>
                <span style={{ color: '#8c8c8c' }}>
                  {form.getFieldValue('employmentType') || 'Employment Type'}
                </span>
              </Space>
            </div>

            {form.getFieldValue('description') && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>About the Role</h3>
                <p style={{ color: '#595959', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                  {form.getFieldValue('description')}
                </p>
              </div>
            )}

            {form.getFieldValue('requirements') && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Requirements</h3>
                <p style={{ color: '#595959', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                  {form.getFieldValue('requirements')}
                </p>
              </div>
            )}

            {skills.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Required Skills</h3>
                <Space wrap>
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '6px 16px',
                        background: '#e6fffb',
                        border: '1px solid #13c2c2',
                        color: '#13c2c2',
                        borderRadius: 16,
                        fontSize: 14,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </Space>
              </div>
            )}

            {(form.getFieldValue('salaryMin') || form.getFieldValue('salaryMax')) && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Compensation</h3>
                <p style={{ fontSize: 20, color: '#52c41a', fontWeight: 600 }}>
                  ${form.getFieldValue('salaryMin')?.toLocaleString() || '0'} - $
                  {form.getFieldValue('salaryMax')?.toLocaleString() || '0'} / year
                </p>
              </div>
            )}

            {benefits.length > 0 && (
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Benefits & Perks</h3>
                <ul style={{ paddingLeft: 20, color: '#595959', lineHeight: '2' }}>
                  {benefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#13c2c2' }}>
                <TeamOutlined style={{ marginRight: 8 }} />
                {isEdit ? 'Edit Job Posting' : 'Create Job Posting'}
              </h2>
              <p style={{ margin: '4px 0 0 0', color: '#8c8c8c' }}>
                {isEdit ? 'Update job posting information' : 'Fill in the details to create a new job posting'}
              </p>
            </div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin/recruitment/jobs')}
              style={{ borderRadius: 8 }}
              size="large"
            >
              Back to Jobs
            </Button>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Tabs
              defaultActiveKey="1"
              items={tabItems}
              size="large"
              style={{
                marginTop: 16,
              }}
              tabBarStyle={{
                borderBottom: '2px solid #f0f0f0',
              }}
            />

            <div
              style={{
                marginTop: 32,
                paddingTop: 24,
                borderTop: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
              }}
            >
              <Button
                onClick={() => navigate('/admin/recruitment/jobs')}
                size="large"
                style={{ borderRadius: 8, minWidth: 120 }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saveLoading}
                size="large"
                style={{
                  background: '#13c2c2',
                  borderColor: '#13c2c2',
                  borderRadius: 8,
                  minWidth: 140,
                  fontWeight: 600,
                }}
              >
                {isEdit ? 'Update Job' : 'Create Job'}
              </Button>
            </div>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default JobsFormPage;
