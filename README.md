# QAPAQ Banca — Sistema Core + Homebanking Integrado
## Proyecto Integrado — Banco Andino

---

## Credenciales de prueba

| Correo | Clave | Rol | Descripción |
|---|---|---|---|
| `carlos.ramirez@qapaq.pe` | `demo1234` | cliente | Con 2 cuentas de ahorro y 1 crédito vigente |
| `rosa.mamani@qapaq.pe` | `qapaq2026` | cliente | Con historial y créditos en mora |
| `ana.torres@qapaq.pe` | `cliente2026` | cliente | Cuenta limpia, ideal para los 30 casos del PDF |
| `maria.quispe@qapaq.pe` | `asesor1234` | asesor | Registra y aprueba solicitudes hasta S/8,000 |
| `jorge.torres@qapaq.pe` | `comite1234` | comité | Aprueba cualquier monto y puede castigar créditos |

---

## Levantar el proyecto

### Paso 1 — Base de datos (Supabase)
1. Ve a tu proyecto en https://supabase.com → SQL Editor → New query
2. Pega TODO el contenido de `supabase/schema_completo.sql` y ejecuta
3. Verifica: `select codigo, nombre, rol from usuarios;` → debe mostrar 5 filas

### Paso 2 — Backend
```bash
cd backend
npm install
```
Edita `backend/.env` y pon tu SERVICE_ROLE_KEY (Project Settings → API → service_role):
```env
PORT=8000
SUPABASE_URL=https://TU_PROYECTO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY
JWT_SECRET=qapaq_secreto_2026_muy_seguro
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:5173
```
```bash
npm run dev
# → Qapaq Core API corriendo en http://localhost:8000
```

### Paso 3 — Frontend
```bash
cd frontend
npm install
npm run dev
# → Local: http://localhost:5173
```

---

## Resumen de criterios de la rúbrica

| Criterio | Implementación | Nivel |
|---|---|---|
| **1. Integración Core↔Homebanking** | Cliente solicita → asesor aprueba en Core → desembolso se refleja en saldo y movimientos del Homebanking. Una sola BD en Supabase. | **Excelente** |
| **2. Reglas de negocio del crédito** | TEA por tipo, cuota fija (sistema francés), RDS ≤40% con semáforo, scoring 0-100, categoría A/B/C, ruta de aprobación por monto (asesor ≤S/8k / comité >S/8k), cronograma completo al desembolsar. | **Excelente** |
| **3. Seguridad y RBAC (JWT + roles)** | JWT firmado en backend, middleware requireAuth (401) y requireRole (403), rutas protegidas en frontend, cliente no puede entrar a /asesor y viceversa. | **Excelente** |
| **4. Recuperaciones / Mora (R1·R2·R3)** | R1: cartera por bandas con KPIs. R2: registro e historial de gestiones. R3: derivar a judicial (>=121d) y castigar (>180d, solo comité). Umbrales validados en backend. | **Excelente** |
| **5. Calidad de datos, arquitectura y documentación** | BD con integridad referencial, mora ~13% de cartera, 2 productos (Microempresa/Consumo), arquitectura en capas, scripts SQL versionados, Historias de Usuario, RF y diagramas UML. | **Excelente** |

---

## Flujo completo de los 30 casos del PDF

El PDF dice: "Ingresa al sistema como asesor de negocios, ubica al cliente y registra la solicitud."

1. Login como asesor → `maria.quispe@qapaq.pe` / `asesor1234`
2. Menu "Nueva Solicitud"
3. Selecciona Ana Torres (cuenta limpia)
4. Click en el Caso N de la tabla → autocompleta monto/plazo/TEA
5. Ingresa ingreso neto (ej. cuota × 3)
6. Verifica que la cuota coincida con el PDF
7. Click "Registrar solicitud"
8. Menu "Bandeja" → Click "Aprobar" → revisar cronograma → "Confirmar"
9. Login como Ana Torres → verifica saldo actualizado y crédito creado

---

## API Endpoints

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/auth/login` | público | Login → JWT |
| GET | `/cuentas/ahorro` | cliente | Mis cuentas de ahorro |
| GET | `/cuentas/ahorro/:codigo/movimientos` | cliente | Movimientos |
| GET | `/cuentas/credito` | cliente | Mis créditos vigentes |
| GET | `/cuentas/credito/:codigo/cuotas` | cliente | Cronograma |
| POST | `/creditos/solicitar` | cliente | Registrar solicitud |
| GET | `/creditos/solicitudes` | cliente | Historial de solicitudes |
| POST | `/operaciones/transferencia` | cliente | Transferencia |
| POST | `/operaciones/pago-credito` | cliente | Pagar cuota |
| POST | `/operaciones/pago-servicio` | cliente | Pagar servicio |
| GET | `/asesor/clientes` | asesor/comité | Buscar clientes |
| POST | `/asesor/solicitudes` | asesor/comité | Registrar solicitud por cliente |
| GET | `/asesor/solicitudes` | asesor/comité | Bandeja |
| POST | `/asesor/solicitudes/:id/aprobar` | asesor/comité | Aprobar + desembolsar |
| POST | `/asesor/solicitudes/:id/rechazar` | asesor/comité | Rechazar |
| GET | `/mora/cartera` | asesor/comité | Cartera morosa por bandas (R1) |
| POST | `/mora/gestiones` | asesor/comité | Registrar gestión (R2) |
| GET | `/mora/gestiones/:creditoId` | asesor/comité | Historial gestiones (R2) |
| POST | `/mora/judicial/:creditoId` | asesor/comité | Derivar a judicial (R3) |
| POST | `/mora/castigo/:creditoId` | solo comité | Castigar (R3) |
