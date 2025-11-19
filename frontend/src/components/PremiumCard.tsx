import React from 'react';
import { Card, CardProps } from 'antd';
import './PremiumCard.css';

interface PremiumCardProps extends CardProps {
  gradient?: string;
  hoverable?: boolean;
  borderless?: boolean;
  glass?: boolean;
  children?: React.ReactNode;
}

/**
 * Premium Card Component
 * Enhanced card with modern design, glass morphism, and hover effects
 */
export const PremiumCard: React.FC<PremiumCardProps> = ({
  gradient,
  hoverable = false,
  borderless = false,
  glass = false,
  children,
  className = '',
  ...props
}) => {
  const cardClassName = `
    premium-card
    ${hoverable ? 'premium-card-hoverable' : ''}
    ${borderless ? 'premium-card-borderless' : ''}
    ${glass ? 'premium-card-glass' : ''}
    ${className}
  `.trim();

  const cardStyle: React.CSSProperties = {
    ...props.style,
    ...(gradient ? { background: gradient } : {}),
  };

  return (
    <Card
      {...props}
      className={cardClassName}
      style={cardStyle}
      bordered={!borderless}
    >
      {children}
    </Card>
  );
};

export default PremiumCard;
