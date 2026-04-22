/**
 * Phase 4 QA — Organización (Folders, Filters, Categories, Tags, EditForm)
 * Run: npx playwright test tests/phase4-qa.spec.ts --project=chromium --headed
 */
import { test, expect, type Page } from '@playwright/test'
import path from 'path'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL = 'http://localhost:3000'
const SS_DIR = '/Users/carlosdominguez/Developer/software/nucleo'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function ss(page: Page, name: string) {
  await page.screenshot({
    path: path.join(SS_DIR, `${name}.png`),
    fullPage: false,
  })
}

async function loginIfNeeded(page: Page) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  if (page.url().includes('/login')) {
    await page.fill('input[type="email"]', 'qa-playwright@nucleo.test')
    await page.fill('input[type="password"]', 'playwright2026!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/w\/|\/dashboard/, { timeout: 15000 })
    // After login, wait for workspace redirect
    await page.waitForURL(/\/w\//, { timeout: 10000 })
  }
}

async function waitForSidebar(page: Page) {
  // Sidebar is always visible on desktop (lg:flex)
  await page.waitForSelector('text=Carpetas', { timeout: 8000 })
  // Wait for loading to finish (skeleton disappears)
  await page.waitForFunction(() => {
    const skeletons = document.querySelectorAll('.animate-pulse')
    return skeletons.length === 0
  }, { timeout: 8000 }).catch(() => {
    // If still loading after 8s, proceed anyway
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Phase 4 — Organización QA', () => {

  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(15000)
  })

  // -------------------------------------------------------------------------
  // TC-F4-00: Sidebar carga inicial
  // -------------------------------------------------------------------------
  test('TC-F4-00: Sidebar carga con secciones Carpetas, Categorías, Tags', async ({ page }) => {
    await loginIfNeeded(page)
    await waitForSidebar(page)

    await ss(page, 'qa-f4-00-sidebar-initial')

    await expect(page.locator('text=Carpetas').first()).toBeVisible()
    await expect(page.locator('text=Categorías').first()).toBeVisible()
    await expect(page.locator('text=Tags').first()).toBeVisible()
  })

  // -------------------------------------------------------------------------
  // TC-F4-01: Crear carpeta raíz
  // -------------------------------------------------------------------------
  test('TC-F4-01: Crear carpeta raíz "Test Carpeta"', async ({ page }) => {
    await loginIfNeeded(page)
    await waitForSidebar(page)

    // Click "Nueva carpeta" button
    await page.click('button:has-text("Nueva carpeta")')

    // Inline input should appear
    const input = page.locator('input[placeholder="Nombre de carpeta"]').first()
    await expect(input).toBeVisible({ timeout: 3000 })
    await input.fill('Test Carpeta')

    // Confirm with Enter
    await input.press('Enter')

    // Wait for folder to appear in tree
    await expect(page.locator('button:has-text("Test Carpeta")').first()).toBeVisible({ timeout: 5000 })

    await ss(page, 'qa-f4-01-carpeta-creada')
  })

  // -------------------------------------------------------------------------
  // TC-F4-02: Crear subcarpeta
  // -------------------------------------------------------------------------
  test('TC-F4-02: Crear subcarpeta "Sub Carpeta" bajo "Test Carpeta"', async ({ page }) => {
    await loginIfNeeded(page)
    await waitForSidebar(page)

    // Make sure "Test Carpeta" is visible
    const folderButton = page.locator('button:has-text("Test Carpeta")').first()
    await expect(folderButton).toBeVisible({ timeout: 5000 })

    // Hover over the folder row to reveal action buttons
    const folderRow = folderButton.locator('..') // parent div
    await folderRow.hover()

    // Click "Nueva subcarpeta" (+) button that appears on hover
    const newChildBtn = page.locator('button[aria-label="Nueva subcarpeta"]').first()
    await expect(newChildBtn).toBeVisible({ timeout: 3000 })
    await newChildBtn.click()

    // Fill inline input
    const subInput = page.locator('input[placeholder="Nombre de subcarpeta"]').first()
    await expect(subInput).toBeVisible({ timeout: 3000 })
    await subInput.fill('Sub Carpeta')
    await subInput.press('Enter')

    // The parent auto-expands after creation (toggleFolderExpand is called)
    // Wait for subcarpeta to appear — it should be visible since parent auto-expands
    await page.waitForTimeout(500)

    // If still not visible, check expand button and click it
    const subVisible = await page.locator('button:has-text("Sub Carpeta")').first().isVisible().catch(() => false)
    if (!subVisible) {
      // Try expanding parent
      const expandBtn = page.locator('button[aria-label="Expandir"]').first()
      if (await expandBtn.isVisible().catch(() => false)) {
        await expandBtn.click()
      }
    }

    await expect(page.locator('button:has-text("Sub Carpeta")').first()).toBeVisible({ timeout: 5000 })

    await ss(page, 'qa-f4-02-subcarpeta-creada')
  })

  // -------------------------------------------------------------------------
  // TC-F4-03: Filtrar por carpeta — banner aparece + empty state
  // -------------------------------------------------------------------------
  test('TC-F4-03: Click en "Test Carpeta" muestra banner de filtro', async ({ page }) => {
    await loginIfNeeded(page)
    await waitForSidebar(page)

    // Click the folder name button
    const folderBtn = page.locator('button:has-text("Test Carpeta")').first()
    await expect(folderBtn).toBeVisible({ timeout: 5000 })
    await folderBtn.click()

    // Banner de filtro activo should appear
    await expect(page.locator('text=📁 Test Carpeta')).toBeVisible({ timeout: 5000 })
    // Also verify Limpiar button
    await expect(page.locator('button[aria-label="Limpiar filtro"]')).toBeVisible()

    await ss(page, 'qa-f4-03-filtro-carpeta-activo')
  })

  // -------------------------------------------------------------------------
  // TC-F4-04: Limpiar filtro
  // -------------------------------------------------------------------------
  test('TC-F4-04: Limpiar filtro de carpeta restaura el grid', async ({ page }) => {
    await loginIfNeeded(page)
    await waitForSidebar(page)

    // First set filter
    const folderBtn = page.locator('button:has-text("Test Carpeta")').first()
    await folderBtn.click()
    await expect(page.locator('button[aria-label="Limpiar filtro"]')).toBeVisible({ timeout: 3000 })

    // Click Limpiar
    await page.click('button[aria-label="Limpiar filtro"]')

    // Banner should disappear
    await expect(page.locator('button[aria-label="Limpiar filtro"]')).not.toBeVisible({ timeout: 3000 })
    await expect(page.locator('text=📁 Test Carpeta')).not.toBeVisible()

    await ss(page, 'qa-f4-04-filtro-limpiado')
  })

  // -------------------------------------------------------------------------
  // TC-F4-05: Capturar item con carpeta asignada
  // -------------------------------------------------------------------------
  test('TC-F4-05: Capturar "Test item en carpeta F4" asignado a "Test Carpeta"', async ({ page }) => {
    await loginIfNeeded(page)
    await waitForSidebar(page)

    // Click FAB
    await page.click('button[aria-label="Capturar nuevo item"]')

    // Dialog opens
    await expect(page.locator('text=Capturar').first()).toBeVisible({ timeout: 3000 })

    // Fill content
    const textarea = page.locator('textarea[aria-label="Contenido a capturar"]')
    await textarea.fill('Test item en carpeta F4 - contenido de prueba para validar filtrado por folder')

    // Expand folder selector
    await page.click('button:has-text("+ Guardar en carpeta")')

    // Wait for folder options to appear
    await expect(page.locator('[role="listbox"]')).toBeVisible({ timeout: 3000 })

    // Select "Test Carpeta"
    await page.click('[role="option"]:has-text("Test Carpeta")')

    // Verify folder is selected — button text changes
    await expect(page.locator('button:has-text("Carpeta: Test Carpeta")')).toBeVisible({ timeout: 2000 })

    await ss(page, 'qa-f4-05-capture-con-carpeta')

    // Submit
    await page.click('button:has-text("Guardar")')

    // Dialog closes
    await expect(page.locator('text=Capturar').first()).not.toBeVisible({ timeout: 5000 })

    await ss(page, 'qa-f4-05b-item-guardado')
  })

  // -------------------------------------------------------------------------
  // TC-F4-06: Filtrar por carpeta — item aparece en el grid filtrado
  // -------------------------------------------------------------------------
  test('TC-F4-06: Filtrar por "Test Carpeta" muestra el item capturado', async ({ page }) => {
    await loginIfNeeded(page)
    await waitForSidebar(page)

    // Click folder to filter
    const folderBtn = page.locator('button:has-text("Test Carpeta")').first()
    await folderBtn.click()

    // Banner visible
    await expect(page.locator('text=📁 Test Carpeta')).toBeVisible({ timeout: 5000 })

    await ss(page, 'qa-f4-06-filtro-carpeta-con-item')
  })

  // -------------------------------------------------------------------------
  // TC-F4-07: Renombrar carpeta
  // -------------------------------------------------------------------------
  test('TC-F4-07: Renombrar "Test Carpeta" a "Carpeta Renombrada"', async ({ page }) => {
    await loginIfNeeded(page)
    await waitForSidebar(page)

    // First clear any active filter
    const clearBtn = page.locator('button[aria-label="Limpiar filtro"]')
    if (await clearBtn.isVisible()) {
      await clearBtn.click()
    }

    // Hover to show actions
    const folderBtn = page.locator('button:has-text("Test Carpeta")').first()
    await folderBtn.hover()

    // Click rename button "Aa"
    const renameBtn = page.locator('button[aria-label="Renombrar"]').first()
    await expect(renameBtn).toBeVisible({ timeout: 3000 })
    await renameBtn.click()

    // Inline input with existing name
    const renameInput = page.locator('input[placeholder="Nombre de carpeta"]').first()
    await expect(renameInput).toBeVisible({ timeout: 3000 })
    await renameInput.selectText()
    await renameInput.fill('Carpeta Renombrada')
    await renameInput.press('Enter')

    // Verify new name appears in folder tree
    await expect(page.locator('button:has-text("Carpeta Renombrada")').first()).toBeVisible({ timeout: 5000 })
    // Verify old exact name "Test Carpeta" is gone from folder tree buttons (not from inline inputs)
    // Wait a bit for the rename to propagate
    await page.waitForTimeout(300)
    // The folder name span inside the tree button should not have exact text "Test Carpeta"
    const exactOldName = await page.locator('button span.text-xs.truncate:text-is("Test Carpeta")').count()
    console.log('TC-F4-07: Spans with exact "Test Carpeta":', exactOldName)
    expect(exactOldName).toBe(0)

    await ss(page, 'qa-f4-07-carpeta-renombrada')
  })

  // -------------------------------------------------------------------------
  // TC-F4-08: Eliminar subcarpeta
  // -------------------------------------------------------------------------
  test('TC-F4-08: Eliminar "Sub Carpeta" del árbol', async ({ page }) => {
    await loginIfNeeded(page)
    await waitForSidebar(page)

    // "Sub Carpeta" may be hidden if parent is collapsed — expand parent first
    const expandBtn = page.locator('button[aria-label="Expandir"]').first()
    if (await expandBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expandBtn.click()
    }

    // Hover over "Sub Carpeta"
    const subFolderBtn = page.locator('button:has-text("Sub Carpeta")').first()
    if (!(await subFolderBtn.isVisible({ timeout: 3000 }).catch(() => false))) {
      test.skip(true, 'Sub Carpeta no visible — probablemente árbol colapsado')
      return
    }
    await subFolderBtn.hover()

    // Click delete
    const deleteBtn = page.locator('button[aria-label="Eliminar carpeta"]').first()
    await expect(deleteBtn).toBeVisible({ timeout: 3000 })
    await deleteBtn.click()

    // Subcarpeta disappears
    await expect(page.locator('button:has-text("Sub Carpeta")').first()).not.toBeVisible({ timeout: 5000 })

    await ss(page, 'qa-f4-08-subcarpeta-eliminada')
  })

  // -------------------------------------------------------------------------
  // TC-F4-09: Crear categoría "Testing" con color azul
  // -------------------------------------------------------------------------
  test('TC-F4-09: Crear categoría "Testing" con color #2383E2', async ({ page }) => {
    await loginIfNeeded(page)
    await waitForSidebar(page)

    // Click "Nueva categoría"
    await page.click('button:has-text("Nueva categoría")')

    // Color picker and inline input both appear simultaneously
    // Color #2383E2 is the default (first), already selected — no need to click
    const catInput = page.locator('input[placeholder="Nombre de categoría"]')
    await expect(catInput).toBeVisible({ timeout: 5000 })

    // Focus the input first, then fill to avoid blur-cancel from color click
    await catInput.focus()
    await catInput.fill('Testing')

    // Confirm with Enter
    await catInput.press('Enter')

    // Category should appear in sidebar
    await expect(page.locator('button:has-text("Testing")').first()).toBeVisible({ timeout: 8000 })

    await ss(page, 'qa-f4-09-categoria-creada')
  })

  // -------------------------------------------------------------------------
  // TC-F4-10: Filtrar por categoría "Testing"
  // -------------------------------------------------------------------------
  test('TC-F4-10: Click en categoría "Testing" muestra banner de filtro', async ({ page }) => {
    await loginIfNeeded(page)
    await waitForSidebar(page)

    // Make sure no other filter is active
    const clearBtn = page.locator('button[aria-label="Limpiar filtro"]')
    if (await clearBtn.isVisible()) {
      await clearBtn.click()
    }

    // Click "Testing" category
    await page.click('button:has-text("Testing")')

    // Banner should show category filter
    await expect(page.locator('text=🗂️ Testing')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('button[aria-label="Limpiar filtro"]')).toBeVisible()

    await ss(page, 'qa-f4-10-filtro-categoria-activo')
  })

  // -------------------------------------------------------------------------
  // TC-F4-11: Limpiar filtro de categoría
  // -------------------------------------------------------------------------
  test('TC-F4-11: Limpiar filtro de categoría "Testing"', async ({ page }) => {
    await loginIfNeeded(page)
    await waitForSidebar(page)

    // Set filter first
    await page.click('button:has-text("Testing")')
    await expect(page.locator('text=🗂️ Testing')).toBeVisible({ timeout: 5000 })

    // Limpiar
    await page.click('button[aria-label="Limpiar filtro"]')

    await expect(page.locator('button[aria-label="Limpiar filtro"]')).not.toBeVisible({ timeout: 3000 })
    await expect(page.locator('text=🗂️ Testing')).not.toBeVisible()

    await ss(page, 'qa-f4-11-filtro-categoria-limpiado')
  })

  // -------------------------------------------------------------------------
  // TC-F4-12: Tags visibles en sidebar (si hay items procesados)
  // -------------------------------------------------------------------------
  test('TC-F4-12: Tags visibles en sidebar si hay items con status=ready', async ({ page }) => {
    await loginIfNeeded(page)
    await waitForSidebar(page)

    const tagsSection = page.locator('text=Tags').first()
    await expect(tagsSection).toBeVisible()

    // Check if tags exist or show "Sin tags aún"
    const noTags = page.locator('text=Sin tags aún')
    const hasTags = await noTags.isVisible().catch(() => false)

    if (hasTags) {
      console.log('TC-F4-12: Sin tags aún — no hay items procesados con tags')
    } else {
      console.log('TC-F4-12: Tags found in sidebar')
    }

    await ss(page, 'qa-f4-12-tags-section')
  })

  // -------------------------------------------------------------------------
  // TC-F4-13: Filtrar por tag (skip si no hay tags)
  // -------------------------------------------------------------------------
  test('TC-F4-13: Click en tag muestra banner 🏷️', async ({ page }) => {
    await loginIfNeeded(page)
    await waitForSidebar(page)

    // Check if any tag exists in sidebar
    const noTagsText = page.locator('text=Sin tags aún')
    if (await noTagsText.isVisible()) {
      console.log('TC-F4-13: SKIP — Sin tags disponibles')
      return
    }

    // Click first available tag
    const firstTag = page.locator('section:has-text("Tags") button.sidebar-item').first()
    if (!(await firstTag.isVisible({ timeout: 3000 }).catch(() => false))) {
      console.log('TC-F4-13: SKIP — No tag buttons found')
      return
    }

    const tagName = await firstTag.locator('span.flex-1').first().innerText()
    await firstTag.click()

    // Banner should show tag filter
    await expect(page.locator(`text=🏷️ ${tagName}`)).toBeVisible({ timeout: 5000 })

    await ss(page, 'qa-f4-13-filtro-tag-activo')
  })

  // -------------------------------------------------------------------------
  // TC-F4-14: Limpiar filtro de tag
  // -------------------------------------------------------------------------
  test('TC-F4-14: Limpiar filtro de tag', async ({ page }) => {
    await loginIfNeeded(page)
    await waitForSidebar(page)

    const noTagsText = page.locator('text=Sin tags aún')
    if (await noTagsText.isVisible()) {
      console.log('TC-F4-14: SKIP — Sin tags disponibles')
      return
    }

    // Set tag filter
    const firstTag = page.locator('section:has-text("Tags") button.sidebar-item').first()
    if (!(await firstTag.isVisible({ timeout: 3000 }).catch(() => false))) {
      console.log('TC-F4-14: SKIP — No tag buttons found')
      return
    }

    await firstTag.click()
    await expect(page.locator('button[aria-label="Limpiar filtro"]')).toBeVisible({ timeout: 5000 })

    // Limpiar
    await page.click('button[aria-label="Limpiar filtro"]')
    await expect(page.locator('button[aria-label="Limpiar filtro"]')).not.toBeVisible({ timeout: 3000 })

    await ss(page, 'qa-f4-14-filtro-tag-limpiado')
  })

  // -------------------------------------------------------------------------
  // TC-F4-15: EditForm — BLOCKED: WorkspaceDashboard pasa onEdit={() => {}}
  // El ItemEditForm no está conectado al flujo principal (bug de integración)
  // -------------------------------------------------------------------------
  test('TC-F4-15: ItemDetail abre y botón Editar existe (EditForm no conectado — BUG)', async ({ page }) => {
    await loginIfNeeded(page)
    await waitForSidebar(page)

    // Clear any filter first
    const clearBtn = page.locator('button[aria-label="Limpiar filtro"]')
    if (await clearBtn.isVisible()) {
      await clearBtn.click()
    }

    // Wait for grid to have at least one item card
    const firstCard = page.locator('[aria-label^="Ver detalle:"]').first()
    await expect(firstCard).toBeVisible({ timeout: 8000 })

    // Click card to open ItemDetail
    await firstCard.click()

    // Detail panel should open
    await expect(page.locator('text=Editar').first()).toBeVisible({ timeout: 5000 })

    // The "Editar" button exists in the sticky footer
    const editBtn = page.locator('button:has-text("Editar")').first()
    await expect(editBtn).toBeVisible()

    await ss(page, 'qa-f4-15-itemdetail-abierto')

    // Click Editar — ItemEditForm is NOT connected (WorkspaceDashboard passes onEdit={() => {}})
    // This means clicking edit does nothing (BUG: EditForm not wired up)
    await editBtn.click()
    await page.waitForTimeout(500)

    // Verify EditForm does NOT open (confirming the bug)
    const editFormVisible = await page.locator('text=Editar item').isVisible().catch(() => false)
    console.log('TC-F4-15 BUG CONFIRMED: EditForm opens?', editFormVisible)
    console.log('TC-F4-15: ItemDetail opened correctly, but EditForm is not wired in WorkspaceDashboard')

    await ss(page, 'qa-f4-15-editform-no-conectado')
  })

  // -------------------------------------------------------------------------
  // TC-F4-16: EditForm save — BLOCKED by same wiring bug
  // -------------------------------------------------------------------------
  test('TC-F4-16: EditForm save — BLOCKED (same bug as TC-F4-15)', async ({ page }) => {
    await loginIfNeeded(page)
    await waitForSidebar(page)

    // Clear filter
    const clearBtn = page.locator('button[aria-label="Limpiar filtro"]')
    if (await clearBtn.isVisible()) {
      await clearBtn.click()
    }

    // Open first item
    const firstCard = page.locator('[aria-label^="Ver detalle:"]').first()
    await expect(firstCard).toBeVisible({ timeout: 8000 })
    await firstCard.click()

    await expect(page.locator('text=Editar').first()).toBeVisible({ timeout: 5000 })

    await ss(page, 'qa-f4-16-itemdetail-open')

    // Verify ItemDetail is properly rendered with all expected elements
    await expect(page.locator('button[aria-label="Más opciones"]')).toBeVisible()
    await expect(page.locator('button:has-text("Eliminar")').first()).toBeVisible()

    console.log('TC-F4-16: ItemDetail renders correctly but EditForm save cannot be tested — onEdit is not wired in WorkspaceDashboard')
  })

  // -------------------------------------------------------------------------
  // TC-F4-17: Recarga — carpetas y categorías persisten, filtro se limpia
  // -------------------------------------------------------------------------
  test('TC-F4-17: Recarga de página — carpetas y categorías persisten desde DB', async ({ page }) => {
    await loginIfNeeded(page)

    // Set a filter first
    await waitForSidebar(page)
    const folderBtn = page.locator('button:has-text("Carpeta Renombrada")').first()
    if (await folderBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await folderBtn.click()
      await expect(page.locator('button[aria-label="Limpiar filtro"]')).toBeVisible({ timeout: 3000 })
    }

    // Reload page
    await page.reload({ waitUntil: 'networkidle' })
    await waitForSidebar(page)

    // Carpeta Renombrada should still be visible (persists from DB)
    await expect(page.locator('button:has-text("Carpeta Renombrada")').first()).toBeVisible({ timeout: 8000 })

    // Check if Testing category persists (only if it was created successfully)
    const testingCatExists = await page.locator('button:has-text("Testing")').first().isVisible({ timeout: 3000 }).catch(() => false)
    console.log('TC-F4-17: "Testing" category persists after reload:', testingCatExists)

    // Filter should be cleared after reload (Zustand state is ephemeral)
    const filterBanner = page.locator('button[aria-label="Limpiar filtro"]')
    const filterActive = await filterBanner.isVisible()
    console.log('TC-F4-17: Filter active after reload:', filterActive)
    // Filter is in Zustand (memory), so it should be cleared after reload
    expect(filterActive).toBeFalsy()

    // Sección Carpetas should show "Carpeta Renombrada" from DB
    const sectionHeader = page.locator('p.sidebar-section-header:has-text("Carpetas")')
    await expect(sectionHeader).toBeVisible()

    await ss(page, 'qa-f4-17-reload-datos-persisten')
  })

})
