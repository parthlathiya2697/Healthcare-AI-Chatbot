import * as React from "react";
import TextField from '@mui/material/TextField';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <TextField
        type={type}
        className={className}
        inputRef={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };