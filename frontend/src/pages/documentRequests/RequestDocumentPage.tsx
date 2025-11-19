import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Typography,
  Space,
  Select,
  Alert,
  Spin,
} from 'antd';
import {
  SendOutlined,
  UserOutlined,
  MessageOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { createDocumentRequest } from '../../api/documentRequestsApi';
import { EmployeeSelector } from '../../components/EmployeeSelector';
import { orgadminApi } from '../../api/orgadminApi';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Employee {
  id: string;
  name: string;
  email: string;
  department?: string;
  position?: string;
}

/**
 * Request Document Page
 * Allows users to request documents from other employees
 */
export const RequestDocumentPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setEmployeesLoading(true);
      const data = await orgadminApi.getEmployees();
      const formattedEmployees = (Array.isArray(data) ? data : data.content || []).map((emp: any) => ({
        id: emp.employeeId || emp.id,
        name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email || emp.user?.email,
        email: emp.email || emp.user?.email || '',
        department: emp.department?.name || '',
        position: emp.position?.name || '',
      }));
      setEmployees(formattedEmployees);
    } catch (err) {
      console.error('Failed to load employees:', err);
      message.error('Failed to load employees');
    } finally {
      setEmployeesLoading(false);
    }
  };

  const handleSubmit = async (values: { targetEmployeeId: string; message: string }) => {
    try {
      setLoading(true);
      await createDocumentRequest(values.targetEmployeeId, values.message);
      message.success('Document request sent successfully!');
      form.resetFields();
      setSelectedEmployee(null);
      // Navigate to outgoing requests after 1 second
      setTimeout(() => {
        navigate('/document-requests/outgoing');
      }, 1000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to create document request';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 0 }}>
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          marginBottom: 24,
        }}
      >
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ color: 'white', padding: 0 }}
          >
            Back
          </Button>
          <Title level={2} style={{ margin: 0, color: 'white' }}>
            <SendOutlined /> Request Document
          </Title>
          <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 15 }}>
            Request a document from a colleague or team member
          </Text>
        </Space>
      </Card>

      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
      >
        <Alert
          message="About Document Requests"
          description="The selected employee will receive an email notification and can upload the requested document from their incoming requests page. You'll be notified when they fulfill or reject the request."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ message: '' }}
          requiredMark="optional"
        >
          <Form.Item
            name="targetEmployeeId"
            label={
              <span style={{ fontSize: 15, fontWeight: 600 }}>
                <UserOutlined /> Select Employee
              </span>
            }
            rules={[{ required: true, message: 'Please select an employee' }]}
            extra="Choose the person from whom you want to request a document"
          >
            <EmployeeSelector
              employees={employees}
              loading={employeesLoading}
              placeholder="Search and select an employee..."
              onChange={(value) => setSelectedEmployee(value)}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="message"
            label={
              <span style={{ fontSize: 15, fontWeight: 600 }}>
                <MessageOutlined /> Request Message
              </span>
            }
            rules={[
              { required: true, message: 'Please provide a message' },
              { min: 10, message: 'Message must be at least 10 characters' },
              { max: 500, message: 'Message must be less than 500 characters' },
            ]}
            extra="Specify what document you need and any additional details"
          >
            <TextArea
              rows={5}
              placeholder="Example: Please upload your Aadhaar card for identity verification. This is required for the onboarding process."
              showCount
              maxLength={500}
              style={{ fontSize: 14 }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
            <Space size={12}>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                loading={loading}
                size="large"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  fontWeight: 600,
                  paddingLeft: 32,
                  paddingRight: 32,
                }}
              >
                Send Request
              </Button>
              <Button
                size="large"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* Tips Card */}
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          marginTop: 24,
          background: '#f8f9fa',
        }}
      >
        <Title level={5} style={{ marginTop: 0 }}>
          💡 Tips for Document Requests
        </Title>
        <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}>
            <Text type="secondary">Be specific about which document you need</Text>
          </li>
          <li style={{ marginBottom: 8 }}>
            <Text type="secondary">Explain why you need the document</Text>
          </li>
          <li style={{ marginBottom: 8 }}>
            <Text type="secondary">Mention any deadline if applicable</Text>
          </li>
          <li style={{ marginBottom: 0 }}>
            <Text type="secondary">
              You can track the status in "Requests I Sent" menu
            </Text>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default RequestDocumentPage;
