import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';

const HolidaysListPage: React.FC = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/leave/holidays`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch holidays');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete Holidays',
      content: 'Are you sure you want to delete this holidays?',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(
            `${API_BASE_URL}/leave/holidays/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          message.success('Holidays deleted successfully');
          fetchData();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to delete holidays');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Holidayname',
      dataIndex: 'holidayName',
      key: 'holidayName',
    }, {
      title: 'Holidaydate',
      dataIndex: 'holidayDate',
      key: 'holidayDate',
    }, {
      title: 'Holidaytype',
      dataIndex: 'holidayType',
      key: 'holidayType',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/leave/holidays/${record.id}`)}
          >
            View
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/leave/holidays/${record.id}/edit`)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>Holidays</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(`/admin/leave/holidays/create`)}
        >
          Create Holidays
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default HolidaysListPage;
