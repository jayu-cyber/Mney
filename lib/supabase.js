import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { PrismaAdapter } from '@prisma/adapter-supabase';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const prisma = new PrismaClient();

// Create Prisma adapter for Supabase
const prismaAdapter = new PrismaAdapter(prisma, supabase);

export { supabase, prisma, prismaAdapter };