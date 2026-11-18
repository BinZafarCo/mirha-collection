import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createProduct, updateProduct } from "./actions";

type Props = { searchParams: Promise<{ created?: string; updated?: string; error?: string }> };

export default async function ProductsAdmin({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();
  if (!supabase) return <main className="admin-wrap"><div className="admin-card"><h1>Products</h1><p className="muted">Connect Supabase to manage your catalogue.</p></div></main>;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/account");
  const { data: staff } = await supabase.from("staff_roles").select("role").eq("user_id", user.id).maybeSingle();
  if (!staff || !["owner", "admin", "manager", "supervisor", "inventory"].includes(staff.role)) redirect("/");
  const { data: products, error } = await supabase.from("products").select("id,name,category,price,stock,status,sku,cover_url,created_at").order("created_at", { ascending: false }).limit(100);

  const errorMessage = params.error === "invalid" ? "Check the product name, price and stock values." :
    params.error === "media-failed" ? "Product saved, but its media links could not be saved. Check the Storage/database policies." :
    params.error ? "The product could not be saved. Check permissions and try again." : "";

  return <main className="admin-wrap">
    <div className="admin-top"><div><div className="eyebrow">Mirha Collection By BZ · Catalogue</div><h1 className="admin-title">Products</h1><p className="muted">Create, edit and publish your product catalogue.</p></div><a className="btn" href="/admin">Back to overview</a></div>
    {params.created && <p className="notice">Product created successfully.</p>}
    {params.updated && <p className="notice">Product updated successfully.</p>}
    {errorMessage && <p className="status" role="alert">{errorMessage}</p>}
    <section className="admin-card product-create">
      <h2>Add a product</h2>
      <form action={createProduct} className="admin-form">
        <label>Product name<input className="field" name="name" required maxLength={120} placeholder="e.g. Embroidered 3-piece lawn suit" /></label>
        <div className="form-grid">
          <label>Category<input className="field" name="category" placeholder="Women / 2-piece / 3-piece" /></label>
          <label>SKU (optional)<input className="field" name="sku" placeholder="MC-001" /></label>
          <label>Selling price (PKR)<input className="field" name="price" type="number" min="0" step="1" required /></label>
          <label>Compare-at price (PKR)<input className="field" name="compare_at_price" type="number" min="0" step="1" /></label>
          <label>Available stock<input className="field" name="stock" type="number" min="0" step="1" defaultValue="0" required /></label>
          <label>Initial visibility<select className="field" name="status" defaultValue="draft"><option value="draft">Save as draft</option><option value="active">Publish to storefront</option></select></label>
        </div>
        <label>Description<textarea className="field" name="description" rows={4} placeholder="Fabric, pieces included, details, care instructions..." /></label>
        <label>Product image/video URLs <span className="muted">(one HTTPS URL per line; images and videos keep their natural proportions)</span><textarea className="field" name="media_urls" rows={4} placeholder={"https://your-image-host.com/product-front.jpg\nhttps://your-image-host.com/product-video.mp4"} /></label>
        <button className="btn" type="submit">Save product</button>
      </form>
    </section>
    <section className="admin-card" style={{marginTop:24}}>
      <div className="admin-list-head"><h2>All products</h2><span className="muted">{products?.length ?? 0} shown · newest first</span></div>
      {error && <p className="status">Could not load products. Check your Supabase schema and access policies.</p>}
      {!products?.length && !error && <p className="muted">No products yet. Add your first product above.</p>}
      <div className="admin-product-list">
        {(products ?? []).map((product) => <form action={updateProduct} className="admin-product-row" key={product.id}>
          <input type="hidden" name="id" value={product.id} />
          <div className="admin-product-preview">{product.cover_url ? <img src={product.cover_url} alt="" /> : <span>No media</span>}</div>
          <div className="admin-product-fields">
            <label className="sr-only" htmlFor={"name-" + product.id}>Product name</label><input id={"name-" + product.id} className="field" name="name" defaultValue={product.name} required />
            <div className="form-grid compact">
              <label>Category<input className="field" name="category" defaultValue={product.category ?? ""} /></label>
              <label>Price (PKR)<input className="field" name="price" type="number" min="0" step="1" defaultValue={product.price} required /></label>
              <label>Stock<input className="field" name="stock" type="number" min="0" step="1" defaultValue={product.stock} required /></label>
              <label>Status<select className="field" name="status" defaultValue={product.status}><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select></label>
            </div>
            <div className="admin-product-actions"><span className="muted">{product.sku ? "SKU: " + product.sku : "No SKU"} · {product.status}</span><button className="btn small" type="submit">Save changes</button></div>
          </div>
        </form>)}
      </div>
    </section>
  </main>;
}
