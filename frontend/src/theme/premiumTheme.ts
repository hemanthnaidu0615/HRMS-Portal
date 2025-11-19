/**
 * Premium Enterprise Theme Configuration
 * Modern, sophisticated design system for HRMS platform
 */

import { ThemeConfig } from 'antd';

export const premiumTheme: ThemeConfig = {
  token: {
    // Color System - Professional & Modern
    colorPrimary: '#1890ff', // Professional blue
    colorSuccess: '#52c41a', // Fresh green
    colorWarning: '#faad14', // Warm orange
    colorError: '#ff4d4f', // Attention red
    colorInfo: '#13c2c2', // Cool cyan

    // Typography
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,

    // Layout
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,

    // Spacing
    marginXS: 8,
    marginSM: 12,
    margin: 16,
    marginMD: 20,
    marginLG: 24,
    marginXL: 32,

    paddingXS: 8,
    paddingSM: 12,
    padding: 16,
    paddingMD: 20,
    paddingLG: 24,
    paddingXL: 32,

    // Shadow - Sophisticated depth
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    boxShadowSecondary: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',

    // Motion
    motionDurationFast: '0.1s',
    motionDurationMid: '0.2s',
    motionDurationSlow: '0.3s',

    // Control
    controlHeight: 36,
    controlHeightLG: 42,
    controlHeightSM: 28,
  },

  components: {
    // Button - Premium feel
    Button: {
      primaryShadow: '0 2px 0 rgba(5, 145, 255, 0.1)',
      controlHeight: 38,
      controlHeightLG: 46,
      fontWeight: 500,
      borderRadius: 6,
    },

    // Card - Modern elevated design
    Card: {
      borderRadiusLG: 12,
      boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)',
      paddingLG: 24,
    },

    // Table - Clean professional
    Table: {
      borderRadius: 8,
      headerBg: '#fafafa',
      headerColor: '#000000d9',
      headerSplitColor: 'transparent',
      rowHoverBg: '#f5f5f5',
    },

    // Input - Refined
    Input: {
      borderRadius: 6,
      controlHeight: 38,
      paddingBlock: 8,
      paddingInline: 12,
    },

    // Select - Modern
    Select: {
      borderRadius: 6,
      controlHeight: 38,
    },

    // Modal - Spacious
    Modal: {
      borderRadiusLG: 12,
      padding: 24,
      paddingLG: 24,
    },

    // Menu - Clean navigation
    Menu: {
      itemBorderRadius: 6,
      itemHeight: 42,
      iconSize: 18,
      itemPaddingInline: 16,
    },

    // Layout - Modern structure
    Layout: {
      headerBg: '#ffffff',
      headerHeight: 64,
      headerPadding: '0 24px',
      siderBg: '#001529',
      triggerBg: '#002140',
      triggerColor: '#fff',
    },

    // Breadcrumb - Clear hierarchy
    Breadcrumb: {
      fontSize: 14,
      iconFontSize: 14,
      itemColor: 'rgba(0, 0, 0, 0.45)',
      lastItemColor: 'rgba(0, 0, 0, 0.85)',
      linkColor: 'rgba(0, 0, 0, 0.45)',
      linkHoverColor: '#1890ff',
    },

    // Tag - Vibrant
    Tag: {
      borderRadiusSM: 4,
      fontSizeSM: 12,
    },

    // Badge - Attention-grabbing
    Badge: {
      indicatorHeight: 20,
      indicatorHeightSM: 16,
    },

    // Steps - Clear progress
    Steps: {
      iconSize: 32,
      iconSizeSM: 24,
    },

    // Notification - Elegant alerts
    Notification: {
      borderRadiusLG: 12,
      padding: 20,
      paddingContentHorizontal: 20,
    },

    // Message - Quick feedback
    Message: {
      borderRadiusLG: 8,
      contentPadding: '10px 16px',
    },
  },
};

// Custom colors for modules
export const moduleColors = {
  attendance: {
    primary: '#1890ff',
    light: '#e6f7ff',
    bg: '#f0f8ff',
  },
  leave: {
    primary: '#52c41a',
    light: '#f6ffed',
    bg: '#f6ffed',
  },
  timesheet: {
    primary: '#722ed1',
    light: '#f9f0ff',
    bg: '#f9f0ff',
  },
  payroll: {
    primary: '#fa8c16',
    light: '#fff7e6',
    bg: '#fff7e6',
  },
  performance: {
    primary: '#eb2f96',
    light: '#fff0f6',
    bg: '#fff0f6',
  },
  recruitment: {
    primary: '#13c2c2',
    light: '#e6fffb',
    bg: '#e6fffb',
  },
  assets: {
    primary: '#faad14',
    light: '#fffbe6',
    bg: '#fffbe6',
  },
  expenses: {
    primary: '#f5222d',
    light: '#fff1f0',
    bg: '#fff1f0',
  },
};

// Animation variants
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.2 },
  },
};

// Gradient backgrounds
export const gradients = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  success: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
  warning: 'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)',
  error: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
  info: 'linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)',
  purple: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
  blue: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
  pink: 'linear-gradient(135deg, #eb2f96 0%, #f759ab 100%)',
};

export default premiumTheme;
