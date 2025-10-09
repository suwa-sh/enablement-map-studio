import React from 'react';

export interface PropertyPanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  title,
  children,
  className = '',
  onClose,
}) => {
  return (
    <div
      className={`w-full h-full bg-white border-l border-secondary-200 overflow-y-auto scrollbar-thin ${className}`}
    >
      {title && (
        <div className="sticky top-0 z-10 bg-white border-b border-secondary-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-secondary-400 hover:text-secondary-600 transition-colors"
              aria-label="Close panel"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      )}
      <div className="p-6 space-y-6">{children}</div>
    </div>
  );
};

export interface PropertySectionProps {
  title?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export const PropertySection: React.FC<PropertySectionProps> = ({
  title,
  children,
  collapsible = false,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  const toggleExpanded = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="space-y-3">
      {title && (
        <div
          className={`flex items-center justify-between ${collapsible ? 'cursor-pointer' : ''}`}
          onClick={toggleExpanded}
        >
          <h4 className="text-sm font-semibold text-secondary-700 uppercase tracking-wide">
            {title}
          </h4>
          {collapsible && (
            <svg
              className={`w-4 h-4 text-secondary-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </div>
      )}
      {isExpanded && <div className="space-y-4">{children}</div>}
    </div>
  );
};

export interface PropertyFieldProps {
  label: string;
  value: React.ReactNode;
  labelWidth?: 'sm' | 'md' | 'lg';
}

export const PropertyField: React.FC<PropertyFieldProps> = ({
  label,
  value,
  labelWidth = 'md',
}) => {
  const widthClasses = {
    sm: 'w-20',
    md: 'w-32',
    lg: 'w-40',
  };

  return (
    <div className="flex items-start gap-4">
      <span
        className={`${widthClasses[labelWidth]} flex-shrink-0 text-sm font-medium text-secondary-600`}
      >
        {label}
      </span>
      <div className="flex-1 text-sm text-secondary-900">{value}</div>
    </div>
  );
};
