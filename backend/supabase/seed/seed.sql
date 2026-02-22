-- Seed base rooms (published)
insert into public.rooms (slug, title, color, sort_order, is_published)
values
  ('retratos', 'Retratos y personas queridas', '#2d4a73', 1, true),
  ('fantasia', 'Fantasía y color', '#355f4a', 2, true),
  ('pop', 'Cultura pop y héroes', '#6a3f56', 3, true),
  ('tradicion', 'Tradición, fe y estudio', '#6b5a32', 4, true)
on conflict (slug) do update
set
  title = excluded.title,
  color = excluded.color,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published,
  updated_at = now();

-- Admin bootstrap:
-- replace the UUID with your auth.users.id after creating your account
-- insert into public.admin_profiles (user_id, role)
-- values ('00000000-0000-0000-0000-000000000000', 'admin')
-- on conflict (user_id) do update set role = excluded.role;