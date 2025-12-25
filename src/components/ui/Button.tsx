import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'danger-secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  loading = false,
}) => {
  const baseClasses = 'font-bold transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'themed-button-primary',
    secondary: 'themed-button-secondary',
    danger: 'themed-button-danger',
    'danger-secondary': 'themed-button-danger-secondary',
  };

  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg',
  };

  const disabledClasses = (disabled || loading)
    ? 'opacity-50 cursor-not-allowed'
    : 'hover-lift hover:shadow-lg';

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="animate-spin">⟳</span>
          {children}
        </span>
      ) : children}
    </button>
  );
};

export default Button;