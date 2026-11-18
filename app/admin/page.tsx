import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export default async function AdminPage(){
 const supabase=await createClient();
 if(!supabase) return <main className="admin-wrap"><div className="admin-card"><h1>Store administration</h1><p className="muted">Admin access requires Supabase configuration and an assigned owner role.</p><a href="/account">Configure customer access</a></div></main>;
 const {data:{user}}=await supabase.auth.getUser();
 if(!user) redirect("/account");
 const {data:staff}=await supabase.from("staff_roles").select("role").eq("user_id",user.id).maybeSingle();
 if(!staff || !["owner","admin","manager","supervisor","inventory","frontdesk"].includes(staff.role)) redirect("/");
 const [{count:productCount},{count:orderCount}] = await Promise.all([
  supabase.from("products").select("*",{count:"exact",head:true}),
  supabase.from("orders").select("*",{count:"exact",head:true})
 ]);
 return <main className="admin-wrap"><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:20,flexWrap:"wrap"}}><div><div className="eyebrow">Mirha Collection By BZ</div><h1 style={{fontFamily:"Playfair Display",fontWeight:500}}>Store overview</h1><p className="muted">Signed in as {user.email} · Role: {staff.role}</p></div><a className="btn" href="/">View storefront</a></div><div className="products" style={{marginTop:30}}><div className="admin-card"><div className="muted">Products</div><h2>{productCount??0}</h2></div><div className="admin-card"><div className="muted">Orders</div><h2>{orderCount??0}</h2></div></div><div className="notice" style={{marginTop:24}}>Admin authorization is checked on the server and database policies. Product, order, staff and media management screens are scheduled for the next implementation milestone; this overview is not yet the complete Shopify-style admin.</div></main>;
}