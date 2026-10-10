// ============================================================
//  CONFIGURACIÓN DE FIREBASE PARA LUBRIPOINT
// ============================================================
// 1. Entra a https://console.firebase.google.com y crea un proyecto.
// 2. Agrega una app Web (</>) y copia el objeto firebaseConfig que te da.
// 3. Reemplaza los valores de abajo por los de TU proyecto.
// 4. En la consola, ve a "Firestore Database" > Crear base de datos
//    (modo producción) y crea una colección llamada "appointments".
// 5. En "Reglas" de Firestore pega las reglas sugeridas (ver README /
//    instrucciones que te entregó el desarrollador).
//
// Si dejas estos valores con "TU_..." la página seguirá funcionando
// SOLO en modo local (localStorage) como respaldo, sin enviar al taller.
// ============================================================

window.FIREBASE_CONFIG = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

// Clave simple para abrir el Panel de Citas del taller.
// Cámbiala por la que quieras. (No es seguridad fuerte, solo evita
// que un cliente curioso abra el panel o borre registros.)
window.ADMIN_PASSCODE = "lubri2026";
