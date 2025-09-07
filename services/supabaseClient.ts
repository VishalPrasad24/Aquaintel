import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://joimsiskykdnkqpfvsfy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvaW1zaXNreWtkbmtxcGZ2c2Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5OTc2MjUsImV4cCI6MjA3MjU3MzYyNX0.g9qKR5ZK1PhqTUT1M88BxW8-SMNRhQB07k1A_g1bEa0';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase URL or anonymous key is not set. Using placeholders. App will not connect to backend.");
}

export const supabase = createClient(supabaseUrl || "http://localhost:54321", supabaseAnonKey || "placeholderkey");