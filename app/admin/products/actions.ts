"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const allowedRoles = ["owner", "admin", "manager", "supervisor", "inventory"];

async function requireProductStaff() {
  const supabase = await createClient();
  if (!supabase) redirect("/account?error=not-configured");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/account");
  const { data: staff } = await supabase.from("staff_roles").select("role").eq("user_id", user.id).maybeSingle();
  if (!staff || !allowedRoles.includes(staff.role)) redirect("/");
  return supabase;
}

function safeMediaUrls(value: FormDataEntryValue | null): string[] {
  return String(value ?? "").split("\n").map((item) => item.trim()).filter(Boolean).filter((item) => {
    try { return new URL(item).protocol === "https:"; } catch { return false; }
  }).slice(0, 12);
}

export async function createProduct(formData: FormData): Promise<void> {
  const supabase = await requireProductStaff();
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price"));
  const compareAt = String(formData.get("compare_at_price") ?? "").trim();
  const stock = Number(formData.get("stock") ?? 0);
  const sku = String(formData.get("sku") ?? "").trim() || null;
  const mediaUrls = safeMediaUrls(formData.get("media_urls"));
  const status = formData.get("status") === "active" ? "active" : "draft";

  if (!name || name.length > 120 || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
    redirect("/admin/products?error=invalid");
  }
  const slugBase = name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "product";
  const slug = `${slugBase}-${Date.now().toString(36)}`;
  const { data: product, error } = await supabase.from("products").insert({
    name, slug, category: category || "Collection", description, price,
    compare_at_price: compareAt ? Number(compareAt) : null,
    sku, stock, status, cover_url: mediaUrls[0] ?? null,
  }).select("id").single();
  if (error || !product) redirect("/admin/products?error=save-failed");

  if (mediaUrls.length) {
    const mediaRows = mediaUrls.map((url, index) => ({
      product_id: product.id,
      url,
      media_type: /\.(mp4|webm|mov)(\?.*)?$/i.test(url) ? "video" : "image",
      alt: name,
      sort_order: index,
    }));
    const { error: mediaError } = await supabase.from("product_media").insert(mediaRows);
    if (mediaError) redirect("/admin/products?error=media-failed");
  }
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  redirect("/admin/products?created=1");
}

export async function updateProduct(formData: FormData): Promise<void> {
  const supabase = await requireProductStaff();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const status = String(formData.get("status") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id) || !name || name.length > 120 || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0 || !["draft", "active", "archived"].includes(status)) {
    redirect("/admin/products?error=invalid");
  }
  const { error } = await supabase.from("products").update({
    name, category: category || "Collection", price, stock, status,
  }).eq("id", id);
  if (error) redirect("/admin/products?error=update-failed");
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  redirect("/admin/products?updated=1");
}
