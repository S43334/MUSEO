# Supabase Backend

## Requisitos
- Proyecto Supabase creado.
- Variables de entorno en Edge Functions:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Estructura
- `migrations/`: esquema SQL base.
- `seed/`: seeds iniciales y script de importación del catálogo local.
- `functions/`: Edge Functions para catálogo, tracking y admin.

## Flujo recomendado
1. Ejecutar migración `20260222_initial_schema.sql`.
2. Ejecutar `seed/seed.sql`.
3. Crear cuenta admin en Auth y asignarla en `admin_profiles`.
4. Deploy de funciones:
   - `get_public_catalog`
   - `track_event`
   - `admin_issue_upload_urls`
   - `admin_upsert_content`
5. Correr script de importación inicial desde `seed/import_local_catalog.mjs`.

## Buckets
- `artworks-original`
- `artworks-web`
- `artworks-thumb`

Notas:
- La migración crea buckets privados.
- `get_public_catalog` genera URLs firmadas para derivados publicados.

## Frontend config (estático)
Configurar en runtime:
```html
<script>
  window.__MUSEO_CONFIG__ = {
    supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
    supabaseAnonKey: 'YOUR_ANON_KEY'
  };
</script>
```

## Admin config
En `admin/index.html`:
```html
<script>
  window.__MUSEO_ADMIN_CONFIG__ = {
    supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
    supabaseAnonKey: 'YOUR_ANON_KEY',
    functionsBaseUrl: 'https://YOUR_PROJECT.supabase.co/functions/v1'
  };
</script>
```