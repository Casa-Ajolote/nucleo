-- Habilitar Realtime en tabla items para actualizaciones en tiempo real
ALTER TABLE items REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE items;
