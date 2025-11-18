import { useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, message } from 'antd';
import { createPosition } from '../api/positionApi';

interface CreatePositionModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: (positionId: string, positionName: string) => void;
}

export const CreatePositionModal = ({ open, onCancel, onSuccess }: CreatePositionModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const newPosition = await createPosition({
        name: values.name,
        description: values.description,
        level: values.level,
      });

      message.success('Position created successfully');
      form.resetFields();
      onSuccess(newPosition.id, newPosition.name);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create position');
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
      title="Create New Position"
      open={open}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Create Position"
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
          label="Position Name"
          name="name"
          rules={[
            { required: true, message: 'Please enter position name' },
            { min: 2, message: 'Name must be at least 2 characters' },
          ]}
        >
          <Input placeholder="e.g., Senior Software Engineer" size="large" />
        </Form.Item>

        <Form.Item
          label="Level"
          name="level"
          rules={[{ required: true, message: 'Please select position level' }]}
          tooltip="Organizational hierarchy level (higher numbers = senior positions)"
        >
          <Select placeholder="Select level" size="large">
            <Select.Option value={1}>Level 1 - Entry</Select.Option>
            <Select.Option value={2}>Level 2 - Junior</Select.Option>
            <Select.Option value={3}>Level 3 - Mid</Select.Option>
            <Select.Option value={4}>Level 4 - Senior</Select.Option>
            <Select.Option value={5}>Level 5 - Lead</Select.Option>
            <Select.Option value={6}>Level 6 - Manager</Select.Option>
            <Select.Option value={7}>Level 7 - Director</Select.Option>
            <Select.Option value={8}>Level 8 - VP</Select.Option>
            <Select.Option value={9}>Level 9 - C-Level</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
        >
          <Input.TextArea
            placeholder="Brief description of the position responsibilities"
            rows={3}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
