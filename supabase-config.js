// ============================================================
//  CONFIGURACIÓN DE SUPABASE PARA LUBRIPOINT
// ============================================================
// 1. Entra a https://supabase.com y crea un proyecto (gratis).
// 2. En "Project Settings > API" copia:
//      - Project URL            -> SUPABASE_URL
//      - anon public API key    -> SUPABASE_ANON_KEY
// 3. En "SQL Editor" ejecuta el script de creación de tabla y políticas
//    (ver el bloque SQL que te entregó el desarrollador / README).
// 4. Reemplaza los valores de abajo por los de TU proyecto.
//
// Si dejas estos valores con "TU_..." la página seguirá funcionando
// SOLO en modo local (localStorage) como respaldo, sin enviar al taller.
// ============================================================

window.SUPABASE_URL = "https://ijwqdywavtzsixkmassq.supabase.co";
window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqd3FkeXdhdnR6c2l4a21hc3NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4MzUyNTgsImV4cCI6MjEwNTQxMTI1OH0.Pe1658kHTDsw5Sv20Pk8huyatVqefHAEkzjrdUpDu7M";

// Clave simple para abrir el Panel de Citas del taller.
// Cámbiala por la que quieras. (No es seguridad fuerte, solo evita
// que un cliente curioso abra el panel o borre registros.)
window.ADMIN_PASSCODE = "lubri2026";
