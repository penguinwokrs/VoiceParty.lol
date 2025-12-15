import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary';
}

export const Button = ({ children, variant = 'primary', style, ...props }: ButtonProps) => {
    const baseStyle: React.CSSProperties = {
        backgroundColor: variant === 'secondary' ? 'transparent' : undefined,
        border: variant === 'secondary' ? '1px solid currentColor' : undefined,
        ...style,
    };

    return (
        <button style={baseStyle} {...props}>
            {children}
        </button>
    );
};
