-- =============================================
-- Nucleo — Schema completo Fase 1
-- =============================================

-- PASO 1: Extensión
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- PASO 2: ENUMs
CREATE TYPE content_type AS ENUM ('link', 'text', 'markdown', 'command');
CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'ready', 'failed');

-- PASO 3: workspaces
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  icon TEXT DEFAULT 'briefcase',
  position SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, slug)
);
CREATE INDEX idx_workspaces_user ON workspaces(user_id);
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_workspaces" ON workspaces FOR ALL USING (auth.uid() = user_id);

-- PASO 4: folders
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  depth SMALLINT NOT NULL DEFAULT 0 CHECK (depth <= 2),
  position SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(workspace_id, parent_id, slug)
);
CREATE INDEX idx_folders_workspace ON folders(workspace_id);
CREATE INDEX idx_folders_parent ON folders(parent_id);
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_folders" ON folders FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

-- PASO 5: categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  color TEXT DEFAULT '#2383E2',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(workspace_id, slug)
);
CREATE INDEX idx_categories_workspace ON categories(workspace_id);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_categories" ON categories FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

-- PASO 6: items
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  content_type content_type NOT NULL,
  title TEXT,
  original_url TEXT,
  original_content TEXT NOT NULL,
  summary TEXT,
  ai_metadata JSONB DEFAULT '{}',
  processing_status processing_status NOT NULL DEFAULT 'pending',
  processing_error TEXT,
  thumbnail_url TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_items_workspace ON items(workspace_id);
CREATE INDEX idx_items_folder ON items(folder_id);
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_content_type ON items(content_type);
CREATE INDEX idx_items_status ON items(processing_status);
CREATE INDEX idx_items_created ON items(created_at DESC);
CREATE INDEX idx_items_title_trgm ON items USING GIN (title gin_trgm_ops);
CREATE INDEX idx_items_summary_trgm ON items USING GIN (summary gin_trgm_ops);
CREATE INDEX idx_items_content_trgm ON items USING GIN (original_content gin_trgm_ops);
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_items" ON items FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

-- PASO 7: tags + item_tags
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(workspace_id, slug)
);
CREATE INDEX idx_tags_workspace ON tags(workspace_id);
CREATE INDEX idx_tags_name_trgm ON tags USING GIN (name gin_trgm_ops);
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_tags" ON tags FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

CREATE TABLE item_tags (
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, tag_id)
);
CREATE INDEX idx_item_tags_tag ON item_tags(tag_id);
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_item_tags" ON item_tags FOR ALL
  USING (item_id IN (
    SELECT id FROM items WHERE workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  ));

-- PASO 8: función search_items
CREATE OR REPLACE FUNCTION search_items(
  p_workspace_id UUID,
  p_query TEXT,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID, title TEXT, summary TEXT, content_type content_type,
  thumbnail_url TEXT, category_id UUID, folder_id UUID,
  created_at TIMESTAMPTZ, similarity REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id, i.title, i.summary, i.content_type,
    i.thumbnail_url, i.category_id, i.folder_id, i.created_at,
    GREATEST(
      similarity(COALESCE(i.title,''), p_query),
      similarity(COALESCE(i.summary,''), p_query),
      similarity(i.original_content, p_query)
    ) AS similarity
  FROM items i
  WHERE i.workspace_id = p_workspace_id
    AND i.processing_status = 'ready'
    AND (
      i.title % p_query OR i.summary % p_query OR i.original_content % p_query
    )
  ORDER BY similarity DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
