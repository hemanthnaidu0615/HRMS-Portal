import React from 'react';
import { Table, Card, Space, Input, Button, Flex } from 'antd';
import type { TableProps, TablePaginationConfig } from 'antd/es/table';
import { SearchOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';

interface DataTableProps<T> extends TableProps<T> {
  title?: string;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  onRefresh?: () => void;
  showSearch?: boolean;
  showRefresh?: boolean;
  extra?: React.ReactNode;
  filters?: React.ReactNode;
}

/**
 * Premium Data Table Component
 * Reusable table with search, filters, and pagination
 */
export function DataTable<T extends object>({
  title,
  searchPlaceholder = 'Search...',
  onSearch,
  onRefresh,
  showSearch = true,
  showRefresh = true,
  extra,
  filters,
  pagination = {
    pageSize: 10,
    showSizeChanger: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  },
  ...tableProps
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = React.useState('');

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  return (
    <Card
      bordered
      style={{
        borderRadius: 12,
      }}
    >
      {/* Toolbar */}
      {(title || showSearch || showRefresh || extra || filters) && (
        <Flex
          justify="space-between"
          align="flex-start"
          gap={16}
          wrap="wrap"
          style={{
            marginBottom: 16,
          }}
        >
          {/* Title */}
          {title && (
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#111111',
              }}
            >
              {title}
            </div>
          )}

          {/* Actions */}
          <Space wrap>
            {showSearch && onSearch && (
              <Input
                placeholder={searchPlaceholder}
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                style={{
                  width: 240,
                }}
                allowClear
              />
            )}

            {showRefresh && onRefresh && (
              <Button
                icon={<ReloadOutlined />}
                onClick={onRefresh}
              >
                Refresh
              </Button>
            )}

            {extra}
          </Space>
        </Flex>
      )}

      {/* Filters */}
      {filters && (
        <div
          style={{
            padding: 16,
            background: '#fafafa',
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          {filters}
        </div>
      )}

      {/* Table */}
      <Table
        {...tableProps}
        pagination={pagination}
        style={{
          ...tableProps.style,
        }}
        rowClassName={(record, index) =>
          index % 2 === 0 ? 'table-row-even' : 'table-row-odd'
        }
      />

      {/* Custom Styles */}
      <style>{`
        .ant-table-wrapper .ant-table {
          border-radius: 8px;
          overflow: hidden;
        }

        .ant-table-thead > tr > th {
          background: #fafafa;
          font-weight: 600;
          color: #111111;
          border-bottom: 1px solid #e8edf2;
        }

        .ant-table-tbody > tr:hover > td {
          background: #f8fafc !important;
        }

        .ant-table-row-selected > td {
          background: #f0f4ff !important;
        }

        .ant-table-row-selected:hover > td {
          background: #e6edff !important;
        }

        .table-row-even {
          background: #ffffff;
        }

        .table-row-odd {
          background: #fafafa;
        }
      `}</style>
    </Card>
  );
}

export default DataTable;
