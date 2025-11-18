import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Upload, Button, Typography, Space, Alert, Table, Progress, Steps, message } from 'antd';
import { UploadOutlined, DownloadOutlined, CheckCircleOutlined, CloseCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { orgadminApi } from '../../../api/orgadminApi';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

interface CSVEmployee {
  firstName: string;
  lastName: string;
  email: string;
  employmentType?: string;
  isProbation?: boolean;
  probationEndDate?: string;
  contractEndDate?: string;
  departmentName?: string;
  positionName?: string;
  managerEmail?: string;
}

interface ImportResult {
  email: string;
  firstName: string;
  lastName: string;
  status: 'success' | 'error';
  message: string;
}

export const BulkImportPage = () => {
  const navigate = useNavigate();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [parsedData, setParsedData] = useState<CSVEmployee[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [importProgress, setImportProgress] = useState(0);

  const handleDownloadTemplate = () => {
    const headers = [
      'firstName',
      'lastName',
      'email',
      'employmentType',
      'isProbation',
      'probationEndDate',
      'contractEndDate',
      'departmentName',
      'positionName',
      'managerEmail',
    ];

    const exampleRows = [
      [
        'John',
        'Doe',
        'john.doe@example.com',
        'internal',
        'true',
        '2025-12-31',
        '',
        'Engineering',
        'Software Engineer',
        'manager@example.com',
      ],
      [
        'Jane',
        'Smith',
        'jane.smith@example.com',
        'client',
        'false',
        '',
        '2026-06-30',
        'Sales',
        'Sales Manager',
        '',
      ],
    ];

    const csvContent = [
      headers.join(','),
      ...exampleRows.map(row =>
        row.map(cell => {
          if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'employee_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (text: string): CSVEmployee[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const employees: CSVEmployee[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const employee: any = {};

      headers.forEach((header, index) => {
        const value = values[index] || '';

        if (header === 'isProbation') {
          employee[header] = value.toLowerCase() === 'true';
        } else if (value) {
          employee[header] = value;
        }
      });

      if (employee.firstName && employee.lastName && employee.email) {
        employees.push(employee);
      }
    }

    return employees;
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCSV(text);

        if (parsed.length === 0) {
          message.error('No valid employees found in CSV. Please check the format.');
          return;
        }

        setParsedData(parsed);
        setCurrentStep(1);
        message.success(`Successfully parsed ${parsed.length} employees from CSV`);
      } catch (error) {
        message.error('Failed to parse CSV file. Please check the format.');
        console.error('CSV parse error:', error);
      }
    };
    reader.readAsText(file);
    return false; // Prevent auto upload
  };

  const generateTemporaryPassword = () => {
    // Generate a random 12-character password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleImport = async () => {
    setImporting(true);
    setCurrentStep(2);
    const results: ImportResult[] = [];

    for (let i = 0; i < parsedData.length; i++) {
      const employee = parsedData[i];
      setImportProgress(Math.round(((i + 1) / parsedData.length) * 100));

      try {
        await orgadminApi.createEmployee({
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          temporaryPassword: generateTemporaryPassword(),
          employmentType: employee.employmentType,
          isProbation: employee.isProbation,
          probationEndDate: employee.probationEndDate,
          contractEndDate: employee.contractEndDate,
        });

        results.push({
          email: employee.email,
          firstName: employee.firstName,
          lastName: employee.lastName,
          status: 'success',
          message: 'Created successfully',
        });
      } catch (error: any) {
        results.push({
          email: employee.email,
          firstName: employee.firstName,
          lastName: employee.lastName,
          status: 'error',
          message: error.response?.data?.message || error.response?.data?.error || 'Failed to create employee',
        });
      }
    }

    setImportResults(results);
    setImporting(false);
    setCurrentStep(3);

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    if (errorCount === 0) {
      message.success(`Successfully imported all ${successCount} employees!`);
    } else {
      message.warning(`Imported ${successCount} employees. ${errorCount} failed.`);
    }
  };

  const handleReset = () => {
    setFileList([]);
    setCurrentStep(0);
    setParsedData([]);
    setImportResults([]);
    setImportProgress(0);
  };

  const previewColumns = [
    {
      title: 'First Name',
      dataIndex: 'firstName',
      key: 'firstName',
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'lastName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Employment Type',
      dataIndex: 'employmentType',
      key: 'employmentType',
      render: (text: string) => text || '—',
    },
    {
      title: 'Probation',
      dataIndex: 'isProbation',
      key: 'isProbation',
      render: (value: boolean) => (value ? 'Yes' : 'No'),
    },
  ];

  const resultColumns = [
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) =>
        status === 'success' ? (
          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
        ) : (
          <CloseCircleOutlined style={{ color: '#f5222d', fontSize: 18 }} />
        ),
      width: 80,
    },
    {
      title: 'First Name',
      dataIndex: 'firstName',
      key: 'firstName',
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'lastName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Result',
      dataIndex: 'message',
      key: 'message',
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0 }}>Bulk Employee Import</Title>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin/employees')}
              style={{ borderRadius: 6 }}
            >
              Back to Employees
            </Button>
          </div>

          <Steps
            current={currentStep}
            items={[
              { title: 'Upload CSV' },
              { title: 'Review Data' },
              { title: 'Import' },
              { title: 'Results' },
            ]}
          />

          {/* Step 0: Upload CSV */}
          {currentStep === 0 && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Alert
                message="Import Instructions"
                description={
                  <Space direction="vertical">
                    <Text>1. Download the CSV template below</Text>
                    <Text>2. Fill in employee data following the template format</Text>
                    <Text>3. Required fields: firstName, lastName, email</Text>
                    <Text>4. Upload the completed CSV file</Text>
                  </Space>
                }
                type="info"
                showIcon
              />

              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownloadTemplate}
                size="large"
                style={{
                  background: '#0a0d54',
                  borderColor: '#0a0d54',
                  borderRadius: 6,
                }}
              >
                Download CSV Template
              </Button>

              <Dragger
                name="file"
                accept=".csv"
                fileList={fileList}
                beforeUpload={handleFileUpload}
                onRemove={() => setFileList([])}
                maxCount={1}
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined style={{ fontSize: 48, color: '#0a0d54' }} />
                </p>
                <p className="ant-upload-text">Click or drag CSV file to this area to upload</p>
                <p className="ant-upload-hint">
                  Support for a single CSV file upload. The file should follow the template format.
                </p>
              </Dragger>
            </Space>
          )}

          {/* Step 1: Review Data */}
          {currentStep === 1 && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Alert
                message={`Found ${parsedData.length} employees in the CSV file`}
                description="Please review the data below before importing. Click 'Start Import' to proceed."
                type="success"
                showIcon
              />

              <Table
                columns={previewColumns}
                dataSource={parsedData}
                rowKey="email"
                pagination={{ pageSize: 10 }}
                scroll={{ x: true }}
              />

              <Space>
                <Button onClick={handleReset} style={{ borderRadius: 6 }}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  onClick={handleImport}
                  size="large"
                  style={{
                    background: '#0a0d54',
                    borderColor: '#0a0d54',
                    borderRadius: 6,
                  }}
                >
                  Start Import ({parsedData.length} employees)
                </Button>
              </Space>
            </Space>
          )}

          {/* Step 2: Importing */}
          {currentStep === 2 && (
            <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
              <Title level={4}>Importing Employees...</Title>
              <Progress
                type="circle"
                percent={importProgress}
                size={200}
                strokeColor="#0a0d54"
              />
              <Text type="secondary">
                Please wait while we import the employees. Do not close this window.
              </Text>
            </Space>
          )}

          {/* Step 3: Results */}
          {currentStep === 3 && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Alert
                message="Import Complete"
                description={
                  <Space direction="vertical">
                    <Text>
                      Successfully imported: {importResults.filter(r => r.status === 'success').length}
                    </Text>
                    <Text>
                      Failed: {importResults.filter(r => r.status === 'error').length}
                    </Text>
                  </Space>
                }
                type={importResults.every(r => r.status === 'success') ? 'success' : 'warning'}
                showIcon
              />

              <Table
                columns={resultColumns}
                dataSource={importResults}
                rowKey="email"
                pagination={{ pageSize: 10 }}
                scroll={{ x: true }}
              />

              <Space>
                <Button onClick={handleReset} style={{ borderRadius: 6 }}>
                  Import More
                </Button>
                <Button
                  type="primary"
                  onClick={() => navigate('/admin/employees')}
                  style={{
                    background: '#0a0d54',
                    borderColor: '#0a0d54',
                    borderRadius: 6,
                  }}
                >
                  View All Employees
                </Button>
              </Space>
            </Space>
          )}
        </Space>
      </Card>
    </div>
  );
};
