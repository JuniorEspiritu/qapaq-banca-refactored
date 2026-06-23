import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const { data: usuarios, error } = await supabase
  .from('usuarios')
  .select('id, password')

if (error) { console.error(error); process.exit(1) }

for (const u of usuarios) {
  // Si ya está hasheado (empieza con $2b$), lo saltamos
  if (u.password.startsWith('$2b$')) {
    console.log(`⏭️  ${u.id} ya tiene hash, se omite`)
    continue
  }
  const hash = await bcrypt.hash(u.password, 10)
  const { error: errUpdate } = await supabase
    .from('usuarios')
    .update({ password: hash })
    .eq('id', u.id)

  if (errUpdate) console.error(`❌ Error en ${u.id}:`, errUpdate.message)
  else console.log(`✅ ${u.id} actualizado`)
}

console.log('Listo.')