import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Button, Row, Col, Space } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { createPosition } from '../../../api/structureApi';

export const CreatePositionPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      await createPosition(values.name, values.seniorityLevel);
      message.success('Position created successfully');
      setTimeout(() => navigate('/admin/structure/positions'), 1000);
    } catch (err: any) {
      message.error('Failed to create position');
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
                Create Position
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
                label="Position Name"
                name="name"
                rules={[{ required: true, message: 'Please input position name!' }]}
              >
                <Input
                  placeholder="Enter position name"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Seniority Level"
                name="seniorityLevel"
                rules={[
                  { required: true, message: 'Please input seniority level!' },
                  { type: 'number', min: 1, message: 'Seniority level must be at least 1!' },
                ]}
                initialValue={1}
              >
                <InputNumber
                  placeholder="Enter seniority level"
                  size="large"
                  min={1}
                  style={{ width: '100%' }}
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
                    onClick={() => navigate('/admin/structure/positions')}
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
