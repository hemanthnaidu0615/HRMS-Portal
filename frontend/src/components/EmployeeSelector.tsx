import React, { useState, useEffect } from 'react';
import { Select, Avatar, Space } from 'antd';
import type { SelectProps } from 'antd';
import { UserOutlined } from '@ant-design/icons';

interface Employee {
  id: string;
  name: string;
  email: string;
  department?: string;
  position?: string;
}

interface EmployeeSelectorProps extends Omit<SelectProps, 'options'> {
  employees: Employee[];
  loading?: boolean;
  showAvatar?: boolean;
}

/**
 * Premium Employee Selector Component
 * Searchable dropdown with employee details
 */
export const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  employees,
  loading = false,
  showAvatar = true,
  ...selectProps
}) => {
  const [searchValue, setSearchValue] = useState('');

  // Safety check: ensure employees is always an array
  const safeEmployees = employees || [];

  const options = safeEmployees.map((employee) => ({
    value: employee.id,
    label: (
      <Space>
        {showAvatar && (
          <Avatar
            size={24}
            style={{
              background: 'linear-gradient(135deg, #0a0d54 0%, #15195c 100%)',
              fontSize: 12,
            }}
          >
            {employee.name?.[0]?.toUpperCase() || <UserOutlined />}
          </Avatar>
        )}
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#111111' }}>
            {employee.name}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            {employee.email}
            {employee.department && ` • ${employee.department}`}
          </div>
        </div>
      </Space>
    ),
    searchableText: `${employee.name} ${employee.email} ${employee.department || ''} ${employee.position || ''}`.toLowerCase(),
  }));

  const filteredOptions = searchValue
    ? options.filter((option) =>
        option.searchableText.includes(searchValue.toLowerCase())
      )
    : options;

  return (
    <Select
      showSearch
      filterOption={false}
      onSearch={setSearchValue}
      loading={loading}
      options={filteredOptions}
      placeholder="Select an employee"
      optionHeight={56}
      style={{
        width: '100%',
      }}
      {...selectProps}
    />
  );
};

export default EmployeeSelector;
