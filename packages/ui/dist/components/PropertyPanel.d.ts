import React from 'react';
export interface PropertyPanelProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
    onClose?: () => void;
}
export declare const PropertyPanel: React.FC<PropertyPanelProps>;
export interface PropertySectionProps {
    title?: string;
    children: React.ReactNode;
    collapsible?: boolean;
    defaultExpanded?: boolean;
}
export declare const PropertySection: React.FC<PropertySectionProps>;
export interface PropertyFieldProps {
    label: string;
    value: React.ReactNode;
    labelWidth?: 'sm' | 'md' | 'lg';
}
export declare const PropertyField: React.FC<PropertyFieldProps>;
//# sourceMappingURL=PropertyPanel.d.ts.map