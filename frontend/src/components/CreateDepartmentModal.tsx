import { useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { createDepartment } from '../api/departmentApi';

interface CreateDepartmentModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: (departmentId: string, departmentName: string) => void;
}

export const CreateDepartmentModal = ({ open, onCancel, onSuccess }: CreateDepartmentModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const newDepartment = await createDepartment({
        name: values.name,
        description: values.description,
        departmentCode: values.departmentCode,
        isActive: true,
      });

      message.success('Department created successfully');
      form.resetFields();
      onSuccess(newDepartment.id, newDepartment.name);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create department');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Create New Department"
      open={open}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Create Department"
      cancelText="Cancel"
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          label="Department Name"
          name="name"
          rules={[
            { required: true, message: 'Please enter department name' },
            { min: 2, message: 'Name must be at least 2 characters' },
          ]}
        >
          <Input placeholder="e.g., Information Technology" size="large" />
        </Form.Item>

        <Form.Item
          label="Department Code"
          name="departmentCode"
          rules={[
            { required: true, message: 'Please enter department code' },
            { pattern: /^[A-Z]{2,6}$/, message: 'Code must be 2-6 uppercase letters (e.g., IT, HR, FIN)' },
          ]}
          tooltip="This code will be used for employee codes (e.g., IT001, HR002)"
        >
          <Input
            placeholder="e.g., IT"
            size="large"
            maxLength={6}
            style={{ textTransform: 'uppercase' }}
            onChange={(e) => form.setFieldValue('departmentCode', e.target.value.toUpperCase())}
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
        >
          <Input.TextArea
            placeholder="Brief description of the department"
            rows={3}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
