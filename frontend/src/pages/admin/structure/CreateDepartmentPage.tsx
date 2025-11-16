import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Row, Col, Space } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { createDepartment } from '../../../api/structureApi';

export const CreateDepartmentPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      await createDepartment(values.name);
      message.success('Department created successfully');
      setTimeout(() => navigate('/admin/structure/departments'), 1000);
    } catch (err: any) {
      message.error('Failed to create department');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6" style={{ background: '#dde4eb', minHeight: '100vh' }}>
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12} xl={10}>
          <Card
            className="shadow-md"
            style={{
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
            }}
            title={
              <h2 className="text-xl font-bold" style={{ color: '#0a0d54', margin: 0 }}>
                Create Department
              </h2>
            }
          >
            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
              autoComplete="off"
            >
              <Form.Item
                label="Department Name"
                name="name"
                rules={[{ required: true, message: 'Please input department name!' }]}
              >
                <Input
                  placeholder="Enter department name"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<CheckOutlined />}
                    loading={loading}
                    size="large"
                    style={{ background: '#0a0d54', borderColor: '#0a0d54' }}
                  >
                    Save
                  </Button>
                  <Button
                    icon={<CloseOutlined />}
                    onClick={() => navigate('/admin/structure/departments')}
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
