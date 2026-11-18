import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = await createClient();
  if (!supabase) return <main className="admin-wrap"><div className="admin-card"><h1>Store administration</h1><p className="muted">Admin access requires Supabase configuration and an assigned owner role.</p><a href="/account">Configure customer access</a></div></main>;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/account");
  const { data: staff } = await supabase.from("staff_roles").select("role").eq("user_id", user.id).maybeSingle();
  if (!staff || !["owner", "admin", "manager", "supervisor", "inventory", "frontdesk"].includes(staff.role)) redirect("/");
  const [{ count: productCount }, { count: orderCount }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
  ]);
  return <main className="admin-wrap">
    <div className="admin-top"><div><div className="eyebrow">Mirha Collection By BZ</div><h1 className="admin-title">Store overview</h1><p className="muted">Signed in as {user.email} · Role: {staff.role}</p></div><a className="btn" href="/">View storefront</a></div>
    <div className="admin-stats">
      <a className="admin-card stat-link" href="/admin/products"><span className="muted">Products</span><strong>{productCount ?? 0}</strong><span className="muted">Manage catalogue →</span></a>
      <div className="admin-card"><span className="muted">Orders</span><strong>{orderCount ?? 0}</strong><span className="muted">Order management milestone next</span></div>
    </div>
    <section className="admin-card" style={{marginTop:24}}><h2>Store operations</h2><div className="admin-links"><a href="/admin/products">Products & catalogue <span>Manage listings, prices, stock and visibility →</span></a><a href="/account">Customer authentication <span>Email one-time codes through Supabase →</span></a><a href="/">Open storefront <span>Preview the public shop →</span></a></div></section>
    <p className="muted" style={{marginTop:20}}>Supplier costs and financial records are not exposed in this product workspace. Team invitations, detailed permissions, orders, PostEx and payment workflows remain separate implementation milestones.</p>
  </main>;
}
