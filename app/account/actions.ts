"use server";
import { createClient } from "@/lib/supabase/server";
export async function requestEmailOtp(formData: FormData) {
 const email = String(formData.get("email")??"").trim().toLowerCase();
 if (!/^\S+@\S+\.\S+$/.test(email)) return {error:"Enter a valid email address."};
 const supabase = await createClient();
 if (!supabase) return {error:"Account service is not configured yet."};
 const {error} = await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:undefined,shouldCreateUser:true}});
 return error ? {error:"Unable to send verification code. Please try again."} : {success:"Check your email for the one-time verification code or sign-in link."};
}