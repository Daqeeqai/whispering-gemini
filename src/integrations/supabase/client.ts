// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://neowcqzcwpryyajustjq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lb3djcXpjd3ByeXlhanVzdGpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0OTAzMzMsImV4cCI6MjA1NTA2NjMzM30.5jWRs-dp0Mxp1ZeK-rJZrCKAYdocm1NhwewLfV6Znn8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);