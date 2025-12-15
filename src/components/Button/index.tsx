import { Button as MuiButton } from '@mui/material';
import type { ButtonProps as MuiButtonProps } from '@mui/material';

interface ButtonProps extends MuiButtonProps {
    variant?: 'text' | 'outlined' | 'contained';
}

export const Button = ({ children, variant = 'contained', ...props }: ButtonProps) => {
    // Map our old 'primary'/'secondary' usage to MUI variants if needed, 
    // or just pass through. Assuming refactor will just use this component.
    // For 'secondary' variant in original code, we map to 'outlined' or 'secondary' color.

    // Custom logic to bridge the gap if needed, or simply re-export with defaults.
    return (
        <MuiButton variant={variant} {...props}>
            {children}
        </MuiButton>
    );
};
