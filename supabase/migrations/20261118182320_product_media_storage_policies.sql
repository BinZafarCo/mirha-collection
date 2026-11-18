create policy "Public can read product media objects" on storage.objects
for select to anon, authenticated using (bucket_id = 'product-media');
create policy "Staff upload product media objects" on storage.objects
for insert to authenticated with check (
 bucket_id = 'product-media'
 and private.has_staff_role(array['owner','admin','manager','supervisor','inventory'])
);
create policy "Staff update product media objects" on storage.objects
for update to authenticated using (
 bucket_id = 'product-media'
 and private.has_staff_role(array['owner','admin','manager','supervisor','inventory'])
) with check (
 bucket_id = 'product-media'
 and private.has_staff_role(array['owner','admin','manager','supervisor','inventory'])
);
create policy "Staff delete product media objects" on storage.objects
for delete to authenticated using (
 bucket_id = 'product-media'
 and private.has_staff_role(array['owner','admin','manager','supervisor','inventory'])
);
