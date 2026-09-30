import React, { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightAction?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightAction, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold tracking-wider uppercase text-slate-300 mb-1.5"
          >
            {label}
          </label>
        )}

        <div className="relative rounded-lg shadow-sm">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-lg text-sm transition-all duration-150 py-2.5 
              ${leftIcon ? 'pl-10' : 'pl-3.5'} 
              ${rightAction ? 'pr-11' : 'pr-3.5'}
              ${
                error
                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/10 text-rose-100 placeholder-rose-300'
                  : 'border border-slate-700 bg-slate-900/80 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              }
              ${className}
            `}
            {...props}
          />

          {rightAction && (
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center">
              {rightAction}
            </div>
          )}
        </div>

        {error && <p className="mt-1 text-xs text-rose-400 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
