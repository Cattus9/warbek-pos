import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan kata sandi wajib diisi" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Call Supabase Auth API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase URL or Key not configured");
      return NextResponse.json(
        { error: "Konfigurasi server tidak lengkap" },
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    console.log(`Attempting login for: ${email}`);

    // Make fetch call with timeout and error handling
    let supabaseResponse;
    try {
      supabaseResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      
      if (!supabaseResponse.ok) {
        const errorText = await supabaseResponse.text();
        console.error(`Supabase error response (${supabaseResponse.status}):`, errorText);
        
        // Try to parse as JSON, fall back to text
        let errorMessage = "Login gagal - periksa kredensial Anda";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          // Use the raw text
          errorMessage = errorText || errorMessage;
        }
        
        return NextResponse.json(
          { error: errorMessage },
          { status: supabaseResponse.status }
        );
      }
    } catch (fetchError: any) {
      console.error("Fetch error:", fetchError.message);
      return NextResponse.json(
        { error: "Tidak dapat terhubung ke Supabase. Periksa koneksi." },
        { status: 500 }
      );
    }

    // Parse response
    let data;
    try {
      data = await supabaseResponse.json();
    } catch (parseError: any) {
      console.error("JSON parse error:", parseError.message);
      return NextResponse.json(
        { error: "Terjadi kesalahan format respons server" },
        { status: 500 }
      );
    }

    if (!supabaseResponse.ok || !data.session) {
      console.error("Supabase login failed:", data);
      return NextResponse.json(
        { error: data.message || "Login gagal" },
        { status: supabaseResponse.status }
      );
    }

    console.log("Login successful, redirecting...");
    
    // Create redirect
    const currentOrigin = request.headers.get("origin") || "http://localhost:3000";
    
    return NextResponse.redirect(`${currentOrigin}/`, {
      headers: {
        "Set-Cookie": `sb-${supabaseUrl.replace(/https?:\/\//, "").split(".")[0]}-auth-token=${data.access_token}; Path=/; HttpOnly; Secure; SameSite=Lax`,
      },
    });
  } catch (error: any) {
    console.error("Internal login error:", error.message);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
