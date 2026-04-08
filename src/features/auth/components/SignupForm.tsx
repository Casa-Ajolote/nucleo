'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { signupSchema, type SignupSchema } from '../services/schemas'
import { signupAction } from '../services/actions'
import { PasswordInput } from './PasswordInput'
import { cn } from '@/lib/utils'

export function SignupForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
  })

  function onSubmit(data: SignupSchema) {
    setServerError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.append('email', data.email)
      fd.append('password', data.password)
      const result = await signupAction(fd)
      if (result?.error) {
        setServerError(result.error)
      }
    })
  }

  const isEmailExists = serverError === 'already_exists'

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="mb-8 text-center">
        <span
          className="text-2xl font-semibold tracking-tight"
          style={{ color: 'var(--color-ink)' }}
        >
          Nucleo
        </span>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
          Crea tu segundo cerebro
        </p>
      </div>

      {/* Server error */}
      {serverError && (
        <div
          className="mb-4 rounded px-3 py-2.5 text-sm border"
          style={{
            background: 'rgba(235,87,87,0.06)',
            borderColor: 'rgba(235,87,87,0.25)',
            color: 'var(--color-error)',
          }}
        >
          {isEmailExists ? (
            <>
              Ya existe una cuenta con este email.{' '}
              <Link
                href="/login"
                className="font-medium underline underline-offset-2"
                style={{ color: 'var(--color-error)' }}
              >
                Iniciar sesión
              </Link>
            </>
          ) : (
            serverError
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium mb-1"
            style={{ color: 'var(--color-muted)' }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="tu@email.com"
            {...register('email')}
            disabled={isPending}
            className={cn(
              'w-full rounded px-3 py-2 text-sm border outline-none transition-all duration-150',
              'placeholder:text-[var(--color-placeholder)]',
              errors.email
                ? 'border-[var(--color-error)] focus:shadow-[0_0_0_2px_rgba(235,87,87,0.15)]'
                : 'border-[var(--color-border)] focus:border-[var(--color-accent)] focus:shadow-[0_0_0_2px_rgba(35,131,226,0.15)]',
              isPending && 'opacity-60'
            )}
            style={{ color: 'var(--color-ink)', background: 'var(--color-canvas)' }}
          />
          {errors.email && (
            <p className="mt-1 text-xs" style={{ color: 'var(--color-error)' }}>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium mb-1"
            style={{ color: 'var(--color-muted)' }}
          >
            Contraseña
          </label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            {...register('password')}
            disabled={isPending}
            error={!!errors.password}
            className={isPending ? 'opacity-60' : ''}
          />
          {errors.password && (
            <p className="mt-1 text-xs" style={{ color: 'var(--color-error)' }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Helper */}
        <p className="text-xs" style={{ color: 'var(--color-placeholder)' }}>
          Usa un email y contraseña seguros. Los datos son solo tuyos.
        </p>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 rounded px-4 py-2 text-sm font-medium text-white transition-colors duration-150 mt-1"
          style={{
            background: isPending ? 'var(--color-accent-hover)' : 'var(--color-accent)',
            opacity: isPending ? 0.8 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isPending) e.currentTarget.style.background = 'var(--color-accent-hover)'
          }}
          onMouseLeave={(e) => {
            if (!isPending) e.currentTarget.style.background = 'var(--color-accent)'
          }}
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          {isPending ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-sm" style={{ color: 'var(--color-muted)' }}>
        ¿Ya tienes cuenta?{' '}
        <Link
          href="/login"
          className="font-medium transition-colors duration-150"
          style={{ color: 'var(--color-accent)' }}
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
