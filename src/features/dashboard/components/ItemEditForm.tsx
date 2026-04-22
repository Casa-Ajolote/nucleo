'use client'

import { useEffect, useId, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Dialog from '@radix-ui/react-dialog'
import * as Label from '@radix-ui/react-label'
import { X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TagChipInput } from './TagChipInput'
import { editItemSchema, type EditItemSchema } from '../services/editSchema'
import { updateItem } from '@/features/capture/services/itemActions'
import { useItemsStore } from '../store/itemsStore'
import { useOrganizeStore } from '@/features/organize/store/organizeStore'
import type { NucleoItem } from '../types'

// ---------------------------------------------------------------------------
// Shared input styles
// ---------------------------------------------------------------------------
const inputBase = cn(
  'w-full rounded px-3 py-2 text-sm text-ink border border-border bg-canvas',
  'outline-none placeholder:text-placeholder',
  'transition-all duration-150',
  'focus:border-accent focus:shadow-[0_0_0_2px_rgba(35,131,226,0.15)]'
)

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface ItemEditFormProps {
  item: NucleoItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (id: string, data: EditItemSchema) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function ItemEditForm({ item, open, onOpenChange, onSave }: ItemEditFormProps) {
  const titleId = useId()
  const titleErrorId = useId()
  const categoryId = useId()
  const tagsId = useId()
  const folderId = useId()
  const [serverError, setServerError] = useState<string | null>(null)

  const { folders: storeFolders, categories: storeCategories } = useOrganizeStore()

  const folderOptions = [
    { value: '', label: 'Sin carpeta' },
    ...storeFolders.map((f) => ({
      value: f.id,
      label: f.depth === 0 ? `📁 ${f.name}` : `  └ 📁 ${f.name}`,
    })),
  ]

  const categoryOptions = [
    { value: '', label: 'Sin categoría' },
    ...storeCategories.map((c) => ({ value: c.id, label: c.name })),
  ]

  const form = useForm<EditItemSchema>({
    resolver: zodResolver(editItemSchema),
    defaultValues: {
      title: item?.title ?? '',
      category: item?.category ?? null,
      tags: item?.tags ?? [],
      folder_id: item?.folder_id ?? null,
    },
  })

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = form

  useEffect(() => {
    if (item) {
      reset({
        title: item.title ?? '',
        category: item.category ?? null,
        tags: item.tags ?? [],
        folder_id: item.folder_id ?? null,
      })
    }
  }, [item, reset])

  function requestClose() {
    if (isDirty) {
      if (!window.confirm('¿Descartar los cambios?')) return
    }
    reset()
    onOpenChange(false)
  }

  async function onSubmit(data: EditItemSchema) {
    setServerError(null)

    const { error } = await updateItem(item!.id, {
      title: data.title,
      category_id: data.category || null,
      folder_id: data.folder_id || null,
      tags: data.tags,
    })

    if (error) {
      setServerError(error)
      return
    }

    useItemsStore.getState().updateItem(item!.id, {
      title: data.title,
      category: data.category ?? null,
      folder_id: data.folder_id ?? null,
      tags: data.tags,
    })

    onSave(item!.id, data)
    reset(data)
    onOpenChange(false)
  }

  const titleValue = watch('title')

  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!next) requestClose() }}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-40 bg-black/30',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'transition-opacity duration-200'
          )}
        />

        {/* Content */}
        <Dialog.Content
          onInteractOutside={(e) => {
            e.preventDefault()
            requestClose()
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault()
            requestClose()
          }}
          className={cn(
            'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'w-full max-w-md bg-canvas rounded-lg shadow-xl',
            'flex flex-col max-h-[90vh]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            'duration-200'
          )}
          aria-describedby={undefined}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <Dialog.Title className="text-sm font-semibold text-ink">
              Editar item
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                onClick={requestClose}
                aria-label="Cerrar"
                className={cn(
                  'p-1 rounded text-muted hover:text-ink hover:bg-hover',
                  'transition-colors duration-150'
                )}
              >
                <X size={15} aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          {/* Scrollable body */}
          <form
            id="item-edit-form"
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-y-auto"
            noValidate
          >
            <div className="px-4 py-4 space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label.Root
                    htmlFor={titleId}
                    className="text-xs font-medium text-ink"
                  >
                    Título <span aria-hidden="true" className="text-error">*</span>
                  </Label.Root>
                  <span
                    className={cn(
                      'text-xs tabular-nums',
                      (titleValue?.length ?? 0) > 110 ? 'text-error' : 'text-muted'
                    )}
                    aria-live="polite"
                  >
                    {titleValue?.length ?? 0}/120
                  </span>
                </div>

                <input
                  id={titleId}
                  type="text"
                  {...register('title')}
                  aria-required="true"
                  aria-invalid={!!errors.title}
                  aria-describedby={errors.title ? titleErrorId : undefined}
                  placeholder="Título del item"
                  className={cn(
                    inputBase,
                    errors.title && 'border-error focus:border-error focus:shadow-[0_0_0_2px_rgba(235,87,87,0.15)]'
                  )}
                />

                {errors.title && (
                  <p
                    id={titleErrorId}
                    role="alert"
                    className="text-xs text-error mt-1"
                  >
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-1">
                <Label.Root htmlFor={categoryId} className="text-xs font-medium text-ink">
                  Categoría
                </Label.Root>

                <div className="relative">
                  <select
                    id={categoryId}
                    {...register('category')}
                    className={cn(
                      inputBase,
                      'appearance-none pr-8 cursor-pointer'
                    )}
                  >
                    {categoryOptions.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    aria-hidden="true"
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1">
                <Label.Root htmlFor={tagsId} className="text-xs font-medium text-ink">
                  Tags
                </Label.Root>

                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <TagChipInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Escribe y presiona Enter…"
                    />
                  )}
                />
              </div>

              {/* Folder */}
              <div className="space-y-1">
                <Label.Root htmlFor={folderId} className="text-xs font-medium text-ink">
                  Carpeta
                </Label.Root>

                <div className="relative">
                  <select
                    id={folderId}
                    {...register('folder_id')}
                    className={cn(
                      inputBase,
                      'appearance-none pr-8 cursor-pointer'
                    )}
                  >
                    {folderOptions.map((folder) => (
                      <option key={folder.value} value={folder.value}>
                        {folder.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    aria-hidden="true"
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
                  />
                </div>
              </div>
            </div>

            {/* Footer — sticky */}
            <div className="sticky bottom-0 bg-canvas border-t border-border px-4 py-3 flex flex-col gap-2 shrink-0">
              {serverError && (
                <p className="text-xs text-error" role="alert">
                  {serverError}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={requestClose}
                  className={cn(
                    'px-3 py-1.5 rounded text-sm text-muted font-medium',
                    'hover:bg-hover hover:text-ink',
                    'transition-colors duration-150'
                  )}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  form="item-edit-form"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  className={cn(
                    'px-4 py-1.5 rounded text-sm font-medium text-white',
                    'bg-accent hover:bg-accent-hover',
                    'transition-colors duration-150',
                    'disabled:opacity-60 disabled:cursor-not-allowed'
                  )}
                >
                  {isSubmitting ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
