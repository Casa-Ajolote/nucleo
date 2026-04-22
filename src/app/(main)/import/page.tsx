import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CSVImporter } from '@/features/import/components/CSVImporter'
import { BookmarkImporter } from '@/features/import/components/BookmarkImporter'

export default async function ImportPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Load the user's first workspace to guarantee activeWorkspaceId is available
  // when /import is accessed directly (without going through a workspace page first)
  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('id')
    .eq('user_id', user.id)
    .order('position')
    .limit(1)

  const defaultWorkspaceId = workspaces?.[0]?.id ?? ''

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-ink)' }}>
          Importar contenido
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
          Importa tus recursos existentes a Nucleo en lotes.
        </p>
      </div>

      <section>
        <h2 className="text-base font-medium mb-3" style={{ color: 'var(--color-ink)' }}>
          Importar desde CSV
        </h2>
        <CSVImporter defaultWorkspaceId={defaultWorkspaceId} />
      </section>

      <div className="h-px" style={{ background: 'var(--color-border)' }} />

      <section>
        <h2 className="text-base font-medium mb-3" style={{ color: 'var(--color-ink)' }}>
          Importar bookmarks del navegador
        </h2>
        <BookmarkImporter defaultWorkspaceId={defaultWorkspaceId} />
      </section>
    </div>
  )
}
