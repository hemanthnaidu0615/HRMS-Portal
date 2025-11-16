import React from 'react';
import { Space, Input, Button, Select, DatePicker, Flex } from 'antd';
import { SearchOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

interface ToolbarProps {
  onSearch?: (value: string) => void;
  onRefresh?: () => void;
  onFilter?: () => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showRefresh?: boolean;
  showFilter?: boolean;
  extra?: React.ReactNode;
  filters?: React.ReactNode;
}

/**
 * Premium Toolbar Component
 * Consistent toolbar with search, filters, and actions
 */
export const Toolbar: React.FC<ToolbarProps> = ({
  onSearch,
  onRefresh,
  onFilter,
  searchPlaceholder = 'Search...',
  showSearch = true,
  showRefresh = true,
  showFilter = false,
  extra,
  filters,
}) => {
  const [searchValue, setSearchValue] = React.useState('');

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  return (
    <div>
      {/* Main Toolbar */}
      <Flex
        justify="space-between"
        align="center"
        gap={16}
        wrap="wrap"
        style={{
          marginBottom: filters ? 16 : 0,
        }}
      >
        {/* Search */}
        {showSearch && onSearch && (
          <Input
            placeholder={searchPlaceholder}
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              width: 280,
            }}
            allowClear
          />
        )}

        {/* Actions */}
        <Space wrap>
          {showFilter && onFilter && (
            <Button icon={<FilterOutlined />} onClick={onFilter}>
              Filters
            </Button>
          )}

          {showRefresh && onRefresh && (
            <Button icon={<ReloadOutlined />} onClick={onRefresh}>
              Refresh
            </Button>
          )}

          {extra}
        </Space>
      </Flex>

      {/* Advanced Filters */}
      {filters && (
        <div
          style={{
            padding: 16,
            background: '#fafafa',
            borderRadius: 8,
            marginTop: 16,
          }}
        >
          {filters}
        </div>
      )}
    </div>
  );
};

export default Toolbar;
