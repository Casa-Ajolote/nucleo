import { SupabaseClient } from '@supabase/supabase-js'
import { openrouter } from './client'
import { itemAnalysisSchema } from './schemas'
import { ANALYSIS_SYSTEM_PROMPT } from './prompts'
import { fetchOgTags } from './og-extractor'

export async function processItemPipeline(
  supabase: SupabaseClient,
  itemId: string,
  originalContent: string,
  contentType: string,
  originalUrl: string | null
): Promise<void> {
  // Mark as processing
  await supabase
    .from('items')
    .update({ processing_status: 'processing' })
    .eq('id', itemId)

  try {
    let ogData: { title: string | null; description: string | null; image: string | null } | null = null
    let contentForAI = originalContent

    // Fetch OG tags for links
    if (contentType === 'link' && originalUrl) {
      ogData = await fetchOgTags(originalUrl)
      if (ogData?.title || ogData?.description) {
        contentForAI = [
          `URL: ${originalUrl}`,
          ogData.title ? `Título de la página: ${ogData.title}` : '',
          ogData.description ? `Descripción: ${ogData.description}` : '',
        ]
          .filter(Boolean)
          .join('\n')
      }
    }

    // Call OpenRouter
    const completion = await openrouter.chat.completions.create({
      model: 'anthropic/claude-haiku-4-5',
      messages: [
        { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
        { role: 'user', content: contentForAI },
      ],
      max_tokens: 512,
      temperature: 0.3,
    })

    const raw = completion.choices[0]?.message?.content ?? ''

    // Parse JSON response
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in AI response')

    const parsed = itemAnalysisSchema.safeParse(JSON.parse(jsonMatch[0]))
    if (!parsed.success) throw new Error(`Invalid AI response: ${parsed.error.message}`)

    const { title, summary, category, tags } = parsed.data

    // Upsert category
    const { data: workspace } = await supabase
      .from('items')
      .select('workspace_id')
      .eq('id', itemId)
      .single()

    let categoryId: string | null = null
    if (workspace) {
      const slug = category.toLowerCase().replace(/\s+/g, '-')
      const { data: cat } = await supabase
        .from('categories')
        .upsert(
          { workspace_id: workspace.workspace_id, name: category, slug },
          { onConflict: 'workspace_id,slug' }
        )
        .select('id')
        .single()
      categoryId = cat?.id ?? null
    }

    // Upsert tags
    if (workspace && tags.length > 0) {
      const tagIds = await Promise.all(
        tags.map(async (name) => {
          const slug = name.toLowerCase().replace(/\s+/g, '-')
          const { data: tag } = await supabase
            .from('tags')
            .upsert(
              { workspace_id: workspace.workspace_id, name, slug },
              { onConflict: 'workspace_id,slug' }
            )
            .select('id')
            .single()
          return tag?.id
        })
      )

      const validTagIds = tagIds.filter(Boolean) as string[]
      await supabase.from('item_tags').delete().eq('item_id', itemId)
      if (validTagIds.length > 0) {
        await supabase
          .from('item_tags')
          .insert(validTagIds.map((tag_id) => ({ item_id: itemId, tag_id })))
      }
    }

    // Update item to ready
    await supabase
      .from('items')
      .update({
        title,
        summary,
        category_id: categoryId,
        processing_status: 'ready',
        processing_error: null,
        og_title: ogData?.title ?? null,
        og_description: ogData?.description ?? null,
        og_image_url: ogData?.image ?? null,
        thumbnail_url: ogData?.image ?? null,
      })
      .eq('id', itemId)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    await supabase
      .from('items')
      .update({ processing_status: 'failed', processing_error: message })
      .eq('id', itemId)
  }
}
