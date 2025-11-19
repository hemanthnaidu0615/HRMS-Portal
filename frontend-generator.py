#!/usr/bin/env python3
"""
HRMS Frontend Code Generator
Generates React TypeScript pages for all HRMS modules
"""

import os
from pathlib import Path

FRONTEND_BASE = "/home/user/HRMS-Portal/frontend/src"

# Define modules with their main entities and features
MODULES_CONFIG = {
    "attendance": {
        "icon": "ClockCircleOutlined",
        "color": "#1890ff",
        "entities": [
            {"name": "Shifts", "path": "shifts", "fields": ["shiftName", "startTime", "endTime", "totalHours"]},
            {"name": "Attendance Records", "path": "records", "fields": ["date", "checkInTime", "checkOutTime", "status"]},
            {"name": "Regularization", "path": "regularization", "fields": ["date", "reason", "status"]},
        ]
    },
    "leave": {
        "icon": "CalendarOutlined",
        "color": "#52c41a",
        "entities": [
            {"name": "Leave Types", "path": "types", "fields": ["leaveTypeName", "annualQuota", "accrualType"]},
            {"name": "Leave Applications", "path": "applications", "fields": ["leaveType", "startDate", "endDate", "status"]},
            {"name": "Leave Balance", "path": "balance", "fields": ["leaveType", "totalAvailable", "consumed", "remaining"]},
            {"name": "Holidays", "path": "holidays", "fields": ["holidayName", "holidayDate", "holidayType"]},
        ]
    },
    "timesheet": {
        "icon": "FieldTimeOutlined",
        "color": "#722ed1",
        "entities": [
            {"name": "Timesheets", "path": "timesheets", "fields": ["project", "task", "hoursWorked", "status"]},
            {"name": "Project Tasks", "path": "tasks", "fields": ["project", "taskName", "isBillable"]},
        ]
    },
    "payroll": {
        "icon": "DollarOutlined",
        "color": "#fa8c16",
        "entities": [
            {"name": "Salary Components", "path": "components", "fields": ["componentName", "componentType", "calculationType"]},
            {"name": "Payroll Runs", "path": "runs", "fields": ["payrollMonth", "payrollYear", "status", "totalEmployees"]},
            {"name": "Payslips", "path": "payslips", "fields": ["employee", "month", "year", "netSalary"]},
        ]
    },
    "performance": {
        "icon": "TrophyOutlined",
        "color": "#eb2f96",
        "entities": [
            {"name": "Performance Cycles", "path": "cycles", "fields": ["cycleName", "cycleType", "startDate", "status"]},
            {"name": "Goals", "path": "goals", "fields": ["goalTitle", "employee", "weightage", "status"]},
            {"name": "Reviews", "path": "reviews", "fields": ["employee", "reviewType", "selfRating", "managerRating"]},
        ]
    },
    "recruitment": {
        "icon": "TeamOutlined",
        "color": "#13c2c2",
        "entities": [
            {"name": "Job Postings", "path": "jobs", "fields": ["jobTitle", "department", "numberOfOpenings", "status"]},
            {"name": "Applications", "path": "applications", "fields": ["candidate", "jobTitle", "status", "appliedDate"]},
            {"name": "Interviews", "path": "interviews", "fields": ["candidate", "interviewRound", "interviewDate", "status"]},
        ]
    },
    "assets": {
        "icon": "LaptopOutlined",
        "color": "#faad14",
        "entities": [
            {"name": "Assets", "path": "assets", "fields": ["assetName", "assetCode", "category", "status"]},
            {"name": "Assignments", "path": "assignments", "fields": ["asset", "employee", "assignedDate", "status"]},
        ]
    },
    "expenses": {
        "icon": "WalletOutlined",
        "color": "#f5222d",
        "entities": [
            {"name": "Expense Claims", "path": "claims", "fields": ["claimNumber", "employee", "totalAmount", "status"]},
            {"name": "Expense Categories", "path": "categories", "fields": ["categoryName", "dailyLimit", "monthlyLimit"]},
        ]
    },
}

def generate_list_page(module, entity):
    """Generate a list page for an entity"""
    entity_name = entity["name"]
    entity_path = entity["path"]
    fields = entity["fields"]

    content = f"""import React, {{ useState, useEffect }} from 'react';
import {{ Table, Button, Space, Tag, message, Modal }} from 'antd';
import {{ PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined }} from '@ant-design/icons';
import {{ useNavigate }} from 'react-router-dom';
import axios from 'axios';
import {{ API_BASE_URL }} from '../../../config/api';

const {entity_path.title().replace('-', '')}ListPage: React.FC = () => {{
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {{
    fetchData();
  }}, []);

  const fetchData = async () => {{
    setLoading(true);
    try {{
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${{API_BASE_URL}}/{module}/{entity_path}`,
        {{ headers: {{ Authorization: `Bearer ${{token}}` }} }}
      );
      setData(response.data);
    }} catch (error: any) {{
      message.error(error.response?.data?.message || 'Failed to fetch {entity_name.lower()}');
    }} finally {{
      setLoading(false);
    }}
  }};

  const handleDelete = async (id: string) => {{
    Modal.confirm({{
      title: 'Delete {entity_name}',
      content: 'Are you sure you want to delete this {entity_name.lower()}?',
      onOk: async () => {{
        try {{
          const token = localStorage.getItem('token');
          await axios.delete(
            `${{API_BASE_URL}}/{module}/{entity_path}/${{id}}`,
            {{ headers: {{ Authorization: `Bearer ${{token}}` }} }}
          );
          message.success('{entity_name} deleted successfully');
          fetchData();
        }} catch (error: any) {{
          message.error(error.response?.data?.message || 'Failed to delete {entity_name.lower()}');
        }}
      }},
    }});
  }};

  const columns = [
    {', '.join([f'''{{
      title: '{field.replace("_", " ").title()}',
      dataIndex: '{field}',
      key: '{field}',
    }}''' for field in fields])},
    {{
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={{<EyeOutlined />}}
            onClick={{() => navigate(`/admin/{module}/{entity_path}/${{record.id}}`)}}
          >
            View
          </Button>
          <Button
            type="link"
            icon={{<EditOutlined />}}
            onClick={{() => navigate(`/admin/{module}/{entity_path}/${{record.id}}/edit`)}}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={{<DeleteOutlined />}}
            onClick={{() => handleDelete(record.id)}}
          >
            Delete
          </Button>
        </Space>
      ),
    }},
  ];

  return (
    <div>
      <div style={{{{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}}}>
        <h2>{entity_name}</h2>
        <Button
          type="primary"
          icon={{<PlusOutlined />}}
          onClick={{() => navigate(`/admin/{module}/{entity_path}/create`)}}
        >
          Create {entity_name}
        </Button>
      </div>
      <Table
        columns={{columns}}
        dataSource={{data}}
        loading={{loading}}
        rowKey="id"
        pagination={{{{ pageSize: 10 }}}}
      />
    </div>
  );
}};

export default {entity_path.title().replace('-', '')}ListPage;
"""
    return content

def generate_form_page(module, entity):
    """Generate a form page for creating/editing an entity"""
    entity_name = entity["name"]
    entity_path = entity["path"]
    fields = entity["fields"]

    content = f"""import React, {{ useState, useEffect }} from 'react';
import {{ Form, Input, Button, message, Card, DatePicker, InputNumber, Select }} from 'antd';
import {{ useNavigate, useParams }} from 'react-router-dom';
import axios from 'axios';
import {{ API_BASE_URL }} from '../../../config/api';

const {{ Option }} = Select;

const {entity_path.title().replace('-', '')}FormPage: React.FC = () => {{
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {{ id }} = useParams();
  const isEdit = !!id;

  useEffect(() => {{
    if (isEdit) {{
      fetchData();
    }}
  }}, [id]);

  const fetchData = async () => {{
    setLoading(true);
    try {{
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${{API_BASE_URL}}/{module}/{entity_path}/${{id}}`,
        {{ headers: {{ Authorization: `Bearer ${{token}}` }} }}
      );
      form.setFieldsValue(response.data);
    }} catch (error: any) {{
      message.error(error.response?.data?.message || 'Failed to fetch {entity_name.lower()}');
    }} finally {{
      setLoading(false);
    }}
  }};

  const onFinish = async (values: any) => {{
    setLoading(true);
    try {{
      const token = localStorage.getItem('token');
      if (isEdit) {{
        await axios.put(
          `${{API_BASE_URL}}/{module}/{entity_path}/${{id}}`,
          values,
          {{ headers: {{ Authorization: `Bearer ${{token}}` }} }}
        );
        message.success('{entity_name} updated successfully');
      }} else {{
        await axios.post(
          `${{API_BASE_URL}}/{module}/{entity_path}`,
          values,
          {{ headers: {{ Authorization: `Bearer ${{token}}` }} }}
        );
        message.success('{entity_name} created successfully');
      }}
      navigate(`/admin/{module}/{entity_path}`);
    }} catch (error: any) {{
      message.error(error.response?.data?.message || `Failed to ${{isEdit ? 'update' : 'create'}} {entity_name.lower()}`);
    }} finally {{
      setLoading(false);
    }}
  }};

  return (
    <div>
      <Card title={{isEdit ? `Edit {entity_name}` : `Create {entity_name}`}}>
        <Form
          form={{form}}
          layout="vertical"
          onFinish={{onFinish}}
        >
          {chr(10).join([f'''<Form.Item
            name="{field}"
            label="{field.replace("_", " ").title()}"
            rules={{[{{ required: true, message: 'Please enter {field.replace("_", " ").lower()}' }}]}}
          >
            <Input placeholder="Enter {field.replace("_", " ").lower()}" />
          </Form.Item>''' for field in fields[:4]])}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={{loading}}>
                {{isEdit ? 'Update' : 'Create'}}
              </Button>
              <Button onClick={{() => navigate(`/admin/{module}/{entity_path}`)}}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}};

export default {entity_path.title().replace('-', '')}FormPage;
"""
    return content

def generate_module_index(module, module_config):
    """Generate module index page with dashboard"""
    content = f"""import React from 'react';
import {{ Card, Row, Col, Statistic }} from 'antd';
import {{ {module_config['icon']} }} from '@ant-design/icons';
import {{ useNavigate }} from 'react-router-dom';

const {module.title()}DashboardPage: React.FC = () => {{
  const navigate = useNavigate();

  return (
    <div>
      <h2 style={{{{ marginBottom: 24 }}}}>
        <{module_config['icon']} style={{{{ color: '{module_config['color']}', marginRight: 8 }}}} />
        {module.title()} Management
      </h2>
      <Row gutter={{[16, 16]}}>
        {chr(10).join([f'''<Col xs={{24}} sm={{12}} md={{8}}>
          <Card
            hoverable
            onClick={{() => navigate(`/admin/{module}/{entity['path']}`)}}
            style={{{{ borderColor: '{module_config['color']}' }}}}
          >
            <Statistic
              title="{entity['name']}"
              value={{0}}
              prefix={{<{module_config['icon']} />}}
            />
          </Card>
        </Col>''' for entity in module_config['entities']])}
      </Row>
    </div>
  );
}};

export default {module.title()}DashboardPage;
"""
    return content

def main():
    print("🎨 Generating HRMS Frontend Pages...")
    print("=" * 60)

    total_pages = 0

    for module, config in MODULES_CONFIG.items():
        module_dir = f"{FRONTEND_BASE}/pages/admin/{module}"
        os.makedirs(module_dir, exist_ok=True)

        print(f"\n📦 Module: {module.upper()}")

        # Generate module dashboard
        dashboard_content = generate_module_index(module, config)
        dashboard_path = f"{module_dir}/index.tsx"
        Path(dashboard_path).write_text(dashboard_content)
        total_pages += 1
        print(f"   ✅ Dashboard page")

        # Generate pages for each entity
        for entity in config['entities']:
            entity_dir = f"{module_dir}/{entity['path']}"
            os.makedirs(entity_dir, exist_ok=True)

            # List page
            list_content = generate_list_page(module, entity)
            list_path = f"{entity_dir}/index.tsx"
            Path(list_path).write_text(list_content)

            # Form page
            form_content = generate_form_page(module, entity)
            form_path = f"{entity_dir}/FormPage.tsx"
            Path(form_path).write_text(form_content)

            total_pages += 2
            print(f"   ✅ {entity['name']}: List & Form pages")

    print(f"\n🎉 Frontend Generation Complete!")
    print(f"📊 Total pages generated: {total_pages}")
    print(f"   - {len(MODULES_CONFIG)} Module dashboards")
    print(f"   - {sum(len(config['entities']) for config in MODULES_CONFIG.values())} List pages")
    print(f"   - {sum(len(config['entities']) for config in MODULES_CONFIG.values())} Form pages")

if __name__ == "__main__":
    main()
