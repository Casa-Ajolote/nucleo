'use client'

import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, ...props }, ref) => {
    const [visible, setVisible] = useState(false)

    return (
      <div className="relative">
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn(
            'w-full rounded px-3 py-2 pr-10 text-sm border outline-none transition-all duration-150',
            'placeholder:text-[var(--color-placeholder)]',
            error
              ? 'border-[var(--color-error)] focus:shadow-[0_0_0_2px_rgba(235,87,87,0.15)]'
              : 'border-[var(--color-border)] focus:border-[var(--color-accent)] focus:shadow-[0_0_0_2px_rgba(35,131,226,0.15)]',
            className
          )}
          style={{ color: 'var(--color-ink)', background: 'var(--color-canvas)' }}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex items-center justify-center w-10 transition-colors"
          style={{ color: 'var(--color-muted)' }}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          tabIndex={-1}
        >
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }
