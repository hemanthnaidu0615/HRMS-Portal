import React from 'react';
import { Form, FormItemProps, Input, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ValidatedFormItemProps extends FormItemProps {
  showValidationIcon?: boolean;
  showCharacterCount?: boolean;
  maxLength?: number;
  validationFeedback?: string;
}

export const ValidatedFormItem: React.FC<ValidatedFormItemProps> = ({
  children,
  showValidationIcon = false,
  showCharacterCount = false,
  maxLength,
  validationFeedback,
  ...props
}) => {
  return (
    <Form.Item
      {...props}
      help={
        <>
          {props.help}
          {validationFeedback && (
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
              {validationFeedback}
            </Text>
          )}
        </>
      }
    >
      {children}
    </Form.Item>
  );
};

interface ValidationMessageProps {
  isValid: boolean;
  message: string;
}

export const ValidationMessage: React.FC<ValidationMessageProps> = ({ isValid, message }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
        fontSize: 12,
      }}
    >
      {isValid ? (
        <CheckCircleOutlined style={{ color: '#52c41a' }} />
      ) : (
        <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
      )}
      <Text type={isValid ? 'success' : 'danger'} style={{ fontSize: 12 }}>
        {message}
      </Text>
    </div>
  );
};

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const getStrength = () => {
    if (!password) return { score: 0, label: '', color: '#d9d9d9' };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const percentage = (score / 5) * 100;

    if (percentage < 40) return { score: percentage, label: 'Weak', color: '#ff4d4f' };
    if (percentage < 60) return { score: percentage, label: 'Fair', color: '#faad14' };
    if (percentage < 80) return { score: percentage, label: 'Good', color: '#52c41a' };
    return { score: percentage, label: 'Strong', color: '#389e0d' };
  };

  const strength = getStrength();

  if (!password) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <div
        style={{
          height: 4,
          background: '#f0f0f0',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${strength.score}%`,
            background: strength.color,
            transition: 'all 0.3s',
          }}
        />
      </div>
      {strength.label && (
        <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
          Password strength: <span style={{ color: strength.color, fontWeight: 500 }}>{strength.label}</span>
        </Text>
      )}
    </div>
  );
};
