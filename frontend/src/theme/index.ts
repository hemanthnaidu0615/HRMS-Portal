import type { ThemeConfig } from 'antd';

/**
 * Premium HRMS Design System
 * Modern, enterprise-grade theme configuration for Ant Design v5
 *
 * Design Principles:
 * - Clean, minimal, precise
 * - Balanced whitespace and typography
 * - Subtle shadows, no gradients
 * - Smooth micro-animations
 * - Professional SaaS aesthetic
 */

export const theme: ThemeConfig = {
  token: {
    // Brand Colors
    colorPrimary: '#0a0d54',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',

    // Background Colors
    colorBgBase: '#f5f7fa',           // Page background (NOT #dde4eb)
    colorBgContainer: '#ffffff',      // Card/Surface background
    colorBgElevated: '#ffffff',       // Modal/Dropdown background
    colorBgLayout: '#f5f7fa',         // Layout background
    colorBgSpotlight: '#fafafa',      // Hover states

    // Border Colors
    colorBorder: '#d8dfe6',           // Default borders
    colorBorderSecondary: '#e8edf2',  // Secondary borders

    // Text Colors
    colorText: '#111111',             // Primary text
    colorTextSecondary: '#64748b',    // Secondary text
    colorTextTertiary: '#94a3b8',     // Tertiary text
    colorTextQuaternary: '#cbd5e1',   // Disabled text

    // Spacing & Sizing
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    borderRadiusXS: 4,

    // Typography
    fontSize: 14,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 16,
    fontSizeHeading5: 14,
    fontSizeSM: 12,
    fontSizeLG: 16,
    fontSizeXL: 20,

    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    fontWeightStrong: 600,

    lineHeight: 1.5715,
    lineHeightHeading1: 1.25,
    lineHeightHeading2: 1.35,
    lineHeightHeading3: 1.4,

    // Shadows (subtle, not heavy)
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    boxShadowSecondary: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    boxShadowTertiary: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',

    // Motion
    motionDurationSlow: '0.3s',
    motionDurationMid: '0.2s',
    motionDurationFast: '0.1s',
    motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    motionEaseOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    motionEaseIn: 'cubic-bezier(0.4, 0, 1, 1)',

    // Layout
    controlHeight: 36,
    controlHeightLG: 44,
    controlHeightSM: 28,

    // Padding
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    paddingXXS: 4,

    // Margin
    margin: 16,
    marginLG: 24,
    marginSM: 12,
    marginXS: 8,
    marginXXS: 4,
  },

  components: {
    Layout: {
      headerBg: '#ffffff',
      headerHeight: 64,
      headerPadding: '0 24px',
      headerColor: '#111111',
      bodyBg: '#f5f7fa',
      footerBg: '#ffffff',
      footerPadding: '24px 50px',
      siderBg: '#ffffff',
      triggerBg: '#ffffff',
      triggerColor: '#111111',
      zeroTriggerWidth: 48,
      zeroTriggerHeight: 48,
    },

    Menu: {
      itemBg: 'transparent',
      itemColor: '#64748b',
      itemHoverBg: '#f8fafc',
      itemHoverColor: '#0a0d54',
      itemSelectedBg: '#f0f4ff',
      itemSelectedColor: '#0a0d54',
      itemActiveBg: '#f0f4ff',
      itemBorderRadius: 6,
      itemMarginInline: 4,
      iconSize: 16,
      iconMarginInlineEnd: 12,
      collapsedIconSize: 16,
      groupTitleColor: '#94a3b8',
      groupTitleFontSize: 12,
      groupTitleLineHeight: '20px',
      horizontalItemBorderRadius: 6,
      horizontalItemHoverBg: '#f8fafc',
    },

    Button: {
      borderRadius: 8,
      controlHeight: 36,
      controlHeightLG: 44,
      controlHeightSM: 28,
      paddingContentHorizontal: 16,
      fontWeight: 500,
      primaryShadow: '0 2px 4px 0 rgba(10, 13, 84, 0.1)',
      defaultShadow: 'none',
      dangerShadow: '0 2px 4px 0 rgba(255, 77, 79, 0.1)',
    },

    Card: {
      borderRadiusLG: 12,
      boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)',
      paddingLG: 24,
      headerBg: 'transparent',
      headerFontSize: 16,
      headerFontSizeSM: 14,
      headerHeight: 48,
      headerHeightSM: 40,
      actionsBg: '#fafafa',
    },

    Table: {
      headerBg: '#fafafa',
      headerColor: '#111111',
      headerSortActiveBg: '#f0f0f0',
      headerSortHoverBg: '#f5f5f5',
      bodySortBg: '#fafafa',
      rowHoverBg: '#f8fafc',
      rowSelectedBg: '#f0f4ff',
      rowSelectedHoverBg: '#e6edff',
      borderColor: '#e8edf2',
      headerBorderRadius: 8,
      cellPaddingBlock: 12,
      cellPaddingInline: 16,
      cellFontSize: 14,
      headerSplitColor: 'transparent',
      fixedHeaderSortActiveBg: '#f0f0f0',
    },

    Form: {
      labelColor: '#111111',
      labelFontSize: 14,
      labelHeight: 32,
      labelColonMarginInlineStart: 2,
      labelColonMarginInlineEnd: 8,
      itemMarginBottom: 24,
      verticalLabelPadding: '0 0 8px',
    },

    Input: {
      borderRadius: 8,
      controlHeight: 36,
      controlHeightLG: 44,
      controlHeightSM: 28,
      paddingBlock: 8,
      paddingInline: 12,
      hoverBorderColor: '#0a0d54',
      activeBorderColor: '#0a0d54',
      activeShadow: '0 0 0 2px rgba(10, 13, 84, 0.1)',
    },

    Select: {
      borderRadius: 8,
      controlHeight: 36,
      controlHeightLG: 44,
      controlHeightSM: 28,
      optionSelectedBg: '#f0f4ff',
      optionActiveBg: '#f8fafc',
      optionPadding: '8px 12px',
    },

    DatePicker: {
      borderRadius: 8,
      controlHeight: 36,
      controlHeightLG: 44,
      controlHeightSM: 28,
    },

    Modal: {
      borderRadiusLG: 12,
      headerBg: '#ffffff',
      contentBg: '#ffffff',
      titleFontSize: 18,
      titleLineHeight: 1.4,
      titleColor: '#111111',
    },

    Drawer: {
      footerPaddingBlock: 16,
      footerPaddingInline: 24,
    },

    Tag: {
      borderRadiusSM: 6,
      defaultBg: '#f5f7fa',
      defaultColor: '#64748b',
    },

    Badge: {
      dotSize: 6,
      statusSize: 6,
    },

    Breadcrumb: {
      fontSize: 14,
      iconFontSize: 14,
      itemColor: '#64748b',
      lastItemColor: '#111111',
      linkColor: '#64748b',
      linkHoverColor: '#0a0d54',
      separatorColor: '#cbd5e1',
      separatorMargin: 8,
    },

    Divider: {
      colorSplit: '#e8edf2',
      orientationMargin: 0.05,
      verticalMarginInline: 8,
    },

    Dropdown: {
      borderRadiusLG: 8,
      boxShadowSecondary: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      paddingBlock: 4,
    },

    Tooltip: {
      borderRadius: 6,
      colorBgSpotlight: 'rgba(0, 0, 0, 0.85)',
    },

    Notification: {
      width: 384,
      borderRadiusLG: 12,
    },

    Message: {
      contentBg: '#ffffff',
      borderRadiusLG: 8,
    },

    Progress: {
      defaultColor: '#0a0d54',
      remainingColor: '#e8edf2',
      circleTextColor: '#111111',
      lineBorderRadius: 100,
    },

    Statistic: {
      titleFontSize: 14,
      contentFontSize: 24,
      fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    },

    Steps: {
      iconSize: 32,
      iconSizeSM: 24,
      dotSize: 8,
      titleLineHeight: 32,
      customIconSize: 32,
      customIconTop: 0,
      customIconFontSize: 24,
      iconTop: -1,
      iconFontSize: 14,
    },

    Tabs: {
      itemColor: '#64748b',
      itemHoverColor: '#0a0d54',
      itemSelectedColor: '#0a0d54',
      itemActiveColor: '#0a0d54',
      cardBg: '#fafafa',
      cardHeight: 40,
      titleFontSize: 14,
      titleFontSizeLG: 16,
      titleFontSizeSM: 14,
      inkBarColor: '#0a0d54',
      horizontalItemPadding: '12px 0',
      horizontalItemPaddingLG: '16px 0',
      horizontalItemPaddingSM: '8px 0',
      horizontalItemMargin: '0 32px 0 0',
      horizontalItemGutter: 32,
      cardPadding: '8px 16px',
      cardGutter: 2,
    },

    Spin: {
      colorPrimary: '#0a0d54',
      dotSize: 20,
      dotSizeSM: 14,
      dotSizeLG: 32,
    },

    Skeleton: {
      borderRadiusSM: 4,
      titleHeight: 16,
      blockRadius: 4,
    },

    Empty: {
      colorTextDisabled: '#94a3b8',
    },

    Avatar: {
      borderRadius: 6,
      containerSize: 32,
      containerSizeLG: 40,
      containerSizeSM: 24,
      textFontSize: 14,
      textFontSizeLG: 18,
      textFontSizeSM: 12,
      groupBorderColor: '#ffffff',
      groupOverlapping: -8,
      groupSpace: 4,
    },

    Pagination: {
      itemBg: '#ffffff',
      itemSize: 32,
      itemSizeSM: 24,
      itemActiveBg: '#0a0d54',
      itemLinkBg: '#ffffff',
      itemInputBg: '#ffffff',
      miniOptionsSizeChangerTop: 0,
      borderRadius: 6,
    },

    Upload: {
      actionsColor: '#64748b',
      borderRadius: 8,
    },
  },
};

/**
 * Spacing scale (consistent 8px grid)
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
} as const;

/**
 * Z-index scale
 */
export const zIndex = {
  base: 1,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
} as const;

/**
 * Breakpoints (mobile-first)
 */
export const breakpoints = {
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
} as const;

/**
 * Animation presets
 */
export const animations = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: '0.2s',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: '0.2s',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  slideUp: {
    from: { transform: 'translateY(8px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
    duration: '0.3s',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  slideDown: {
    from: { transform: 'translateY(-8px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
    duration: '0.3s',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  scaleIn: {
    from: { transform: 'scale(0.95)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
    duration: '0.2s',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

export default theme;
