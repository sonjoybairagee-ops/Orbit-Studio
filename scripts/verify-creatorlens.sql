select tablename, rowsecurity
from pg_tables
where schemaname = 'public' and tablename like 'creatorlens%'
order by 1;

select e.slug as extension_slug, e.name as extension_name, e.host_app, p.slug as plan_slug, p.name as plan_name, p.is_public
from public.extensions e
join public.plan_extensions pe on pe.extension_id = e.id
join public.plans p on p.id = pe.plan_id
where e.slug = 'creatorlens';
