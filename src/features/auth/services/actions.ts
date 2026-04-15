'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, signupSchema } from './schemas'

export async function loginAction(formData: FormData) {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: 'Email o contraseña incorrectos' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    if (error.status === 400) {
      return { error: 'Email o contraseña incorrectos' }
    }
    return { error: 'Servicio temporalmente no disponible. Intenta en unos minutos.' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: ws } = await supabase
      .from('workspaces')
      .select('id')
      .eq('user_id', user.id)
      .order('position')
      .limit(1)
      .single()

    if (ws) redirect(`/w/${ws.id}`)
  }

  redirect('/dashboard')
}

export async function signupAction(formData: FormData) {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = signupSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp(parsed.data)

  if (error) {
    if (error.message?.includes('already registered')) {
      return { error: 'already_exists' }
    }
    return { error: 'No pudimos crear tu cuenta. Intenta nuevamente.' }
  }

  if (data.session && data.user) {
    await supabase.from('workspaces').insert([
      { user_id: data.user.id, name: 'Personal', slug: 'personal', icon: '📁', position: 0 },
      { user_id: data.user.id, name: 'Trabajo', slug: 'trabajo', icon: '💼', position: 1 },
    ])

    const { data: ws } = await supabase
      .from('workspaces')
      .select('id')
      .eq('user_id', data.user.id)
      .order('position')
      .limit(1)
      .single()

    redirect(ws ? `/w/${ws.id}` : '/dashboard')
  }

  redirect('/login?message=check-email')
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getWorkspacesAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('workspaces')
    .select('id, name, slug, icon, position')
    .eq('user_id', user.id)
    .order('position')

  return data ?? []
}
