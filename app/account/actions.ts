"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function requestEmailOtp(formData: FormData): Promise<void> {
 const email = String(formData.get("email")??"").trim().toLowerCase();
 if (!/^\\S+@\\S+\\.\\S+$/.test(email)) redirect("/account?error=invalid-email");
 const supabase = await createClient();
 if (!supabase) redirect("/account?error=not-configured");
 const {error} = await supabase.auth.signInWithOtp({email,options:{shouldCreateUser:true}});
 if (error) redirect("/account?error=send-failed");
 redirect("/account/verify?email="+encodeURIComponent(email));
}

export async function verifyEmailOtp(formData: FormData): Promise<void> {
 const email = String(formData.get("email")??"").trim().toLowerCase();
 const token = String(formData.get("token")??"").trim();
 if (!email || !/^\\d{6}$/.test(token)) redirect("/account/verify?error=invalid-code");
 const supabase = await createClient();
 if (!supabase) redirect("/account?error=not-configured");
 const {error} = await supabase.auth.verifyOtp({email,token,type:"email"});
 if (error) redirect("/account/verify?email="+encodeURIComponent(email)+"&error=verification-failed");
 redirect("/");
}