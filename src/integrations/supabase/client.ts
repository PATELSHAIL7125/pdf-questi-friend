
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wqigqvdzndqvmtyiwxuv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxaWdxdmR6bmRxdm10eWl3eHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MjE2NTIsImV4cCI6MjA1ODA5NzY1Mn0.mZYEAsvFRvaDO-30Zb7vP8ztGSiItz2L7AIoVzB9q5c";



export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);