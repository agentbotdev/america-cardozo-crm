import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, code, redirect_uri, refresh_token } = await req.json()
    
    // Get credentials from environment (stored in Supabase Vault / Secrets)
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')

    if (!clientId || !clientSecret) {
       throw new Error('Google OAuth credentials not configured')
    }

    if (action === 'exchange_code') {
      const url = 'https://oauth2.googleapis.com/token'
      const values = {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code',
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(values),
      })
      
      const tokens = await response.json()
      if (!response.ok) throw new Error(tokens.error || 'Failed to exchange token')
      
      return new Response(JSON.stringify(tokens), { headers: { ...corsHeaders, "Content-Type": "application/json" } })

    } else if (action === 'refresh_token') {
      const url = 'https://oauth2.googleapis.com/token'
      const values = {
        refresh_token: refresh_token,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(values),
      })

      const tokens = await response.json()
      if (!response.ok) throw new Error(tokens.error || 'Failed to refresh token')
      
      return new Response(JSON.stringify(tokens), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    throw new Error('Invalid action')
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})
