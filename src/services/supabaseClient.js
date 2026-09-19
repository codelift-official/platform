import { createClient } from '@supabase/supabase-js';

if (typeof WebSocket === 'undefined') {
  globalThis.WebSocket = class DummyWebSocket {
    constructor() { }
    addEventListener() { }
    removeEventListener() { }
    send() { }
    close() { }
  };
}

const rawUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL);
const rawAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY);

const isValidUrl = (val) => {
  try {
    const parsed = new URL(val);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isSupabaseConfigured = Boolean(
  rawUrl && isValidUrl(rawUrl) && rawAnonKey && rawAnonKey.trim().length > 0
);

export const checkIsSupabaseConfigured = () => isSupabaseConfigured;

if (!isSupabaseConfigured) {
  console.warn(
    '[SupabaseClient] Notice: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not defined in this build. ' +
    'CodeLift is running seamlessly in offline/seed mode with local fixtures.'
  );
}

const supabaseUrl = isSupabaseConfigured ? rawUrl : 'https://placeholder.supabase.co';
const supabaseAnonKey = isSupabaseConfigured ? rawAnonKey : 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
