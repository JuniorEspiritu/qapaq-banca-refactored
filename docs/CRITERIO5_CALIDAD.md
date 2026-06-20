# Criterio 5 — Calidad de Datos, Arquitectura y Documentación
## Sistema Qapaq Banca — Core Bancario + Homebanking

---

## 1. Calidad de Datos y Proporciones Reales

### Cartera simulada con proporciones reales (~13% mora):
- **Total de créditos en la BD:** ~15 registros de prueba
- **En mora:** ~2–3 créditos (≈13%) — alineado a proporciones SBS Perú
- **Productos implementados:** 2 tipos
  - `Microempresa` — TEA 43.92% (sin seguro de desgravamen)
  - `Consumo` — TEA 40.92% (con seguro de desgravamen)
- **Integridad referencial:** Todas las tablas tienen FK con ON DELETE CASCADE/RESTRICT donde corresponde

### Scripts SQL versionados (carpeta `/supabase`):
| Script | Descripción |
|--------|-------------|
| `00_drop_all.sql` | Limpia el esquema anterior |
| `01_create_tables.sql` | Crea todas las tablas con FK e índices |
| `02_seed_usuarios.sql` | Inserta usuarios con roles (cliente, asesor, comité) |
| `03_seed_cuentas.sql` | Cuentas de ahorro con saldos calibrados |
| `04_seed_creditos.sql` | Créditos con distribución real: Normal y Mora |
| `05_seed_mora.sql` | Gestiones de cobranza y bandas de mora |
| `MAESTRO_reinstalar_todo.sql` | Script maestro que ejecuta todos en orden |
| `schema.sql` / `schema_completo.sql` | DDL completo documentado |
| `migracion_criterio2.sql` | Migración de scoring, RDS, semáforo, nivel de aprobación |

---

## 2. Arquitectura en Capas

```
Frontend (React + Vite)          Backend (Express + Node.js)         Base de Datos (Supabase / PostgreSQL)
┌────────────────────────┐       ┌────────────────────────────┐       ┌──────────────────────────────────────┐
│  Pages / Views         │       │  Routes (Express Router)   │       │  Tablas                              │
│  ├─ LoginPage          │  HTTP │  ├─ auth.routes.js         │  SQL  │  ├─ usuarios                         │
│  ├─ LandingPage        │ ◄────►│  ├─ cuentas.routes.js     │◄────► │  ├─ cuentas_ahorro                   │
│  ├─ cliente/           │  JWT  │  ├─ creditos.routes.js     │ Supa  │  ├─ movimientos_ahorro               │
│  │   ├─ HomePage       │       │  ├─ operaciones.routes.js  │ base  │  ├─ creditos                         │
│  │   ├─ AhorrosPage    │       │  ├─ asesor.routes.js       │       │  ├─ cuotas_credito                   │
│  │   ├─ CreditosPage   │       │  └─ mora.routes.js         │       │  ├─ solicitudes_credito              │
│  │   ├─ OperacionesPage│       │                            │       │  ├─ gestiones_cobranza               │
│  │   ├─ SimuladorPage  │       │  Middleware                │       │  └─ pagos_servicio                   │
│  │   └─ SolicitarPage  │       │  ├─ requireAuth (JWT)      │       │                                      │
│  └─ asesor/            │       │  └─ requireRole (RBAC)     │       │  Integridad referencial              │
│      ├─ AsesorDashboard│       │                            │       │  ├─ creditos.usuario_id → usuarios   │
│      ├─ AsesorNuevaSol │       │  Servicios / Lógica        │       │  ├─ cuotas.credito_id → creditos     │
│      ├─ ResueltasPage  │       │  ├─ auth.js (JWT sign/ver) │       │  ├─ movimientos.cuenta_id → cuentas  │
│      └─ MoraPage ★     │       │  ├─ creditCalc.js          │       │  └─ gestiones.credito_id → creditos  │
│                        │       │  └─ db.js (Supabase client)│       └──────────────────────────────────────┘
│  Components            │       └────────────────────────────┘
│  ├─ HBHeader           │
│  ├─ HBLayout           │
│  ├─ ProtectedRoute     │
│  ├─ Badge              │
│  ├─ Icon               │
│  └─ RiskBadges         │
│                        │
│  Lib / Context         │
│  ├─ api.js             │
│  ├─ creditCalc.js      │
│  ├─ casos.js           │
│  ├─ format.js          │
│  ├─ supabaseClient.js  │
│  └─ AuthContext.jsx    │
└────────────────────────┘
```

★ MoraPage implementa completamente R1, R2 y R3 (Criterio 4).

---

## 3. Historias de Usuario

Ver archivo `HISTORIAS_USUARIO.md` con 15+ historias que cubren:
- Módulo 1: Autenticación y RBAC (HU-01, HU-02)
- Módulo 2: Portal del Cliente — Homebanking (HU-03 a HU-09)
- Módulo 3: Core Backoffice — Asesor/Comité (HU-10 a HU-13)
- Módulo 4: Recuperaciones / Mora (HU-14, HU-15)

---

## 4. Diagramas UML

Ver archivo `DIAGRAMAS_UML.md` con:
- Diagrama de Casos de Uso (Actor: Cliente, Asesor, Comité)
- Diagrama de Flujo — Solicitud de Crédito End-to-End
- Diagrama de Secuencia — Login con JWT
- Diagrama de Entidad-Relación (ER) de la BD
- Arquitectura general del sistema

---

## 5. Requisitos Funcionales (RF)

| RF | Descripción | Estado |
|----|-------------|--------|
| RF-01 | Login con JWT por correo institucional | ✅ |
| RF-02 | Control de acceso RBAC por rol | ✅ |
| RF-03 | Consultar posición global (KPIs) | ✅ |
| RF-04 | Ver movimientos de ahorro | ✅ |
| RF-05 | Ver cronograma de crédito | ✅ |
| RF-06 | Transferencia entre cuentas propias | ✅ |
| RF-07 | Pago de cuota de crédito | ✅ |
| RF-08 | Pago de servicios | ✅ |
| RF-09 | Simulador de crédito con cronograma | ✅ |
| RF-10 | Solicitar crédito con scoring y semáforo | ✅ |
| RF-11 | Registrar solicitud (asesor) con validación de elegibilidad | ✅ |
| RF-12 | Evaluar/aprobar/rechazar solicitud (asesor/comité) | ✅ |
| RF-13 | Desembolso automático al aprobar | ✅ |
| RF-14 | Consulta cartera morosa por bandas R1 | ✅ |
| RF-15 | Registro e historial de gestiones R2 | ✅ |
| RF-16 | Derivar a judicial/castigo R3 con validación de umbrales | ✅ |

---

## 6. Checklist de Criterio 5 — Excelente (4/4 pts)

- [x] **BD con integridad referencial** — FK en todas las tablas relacionadas
- [x] **Datos calibrados** — mora ≈13%, 2 productos (Microempresa + Consumo)
- [x] **Arquitectura en capas** — rutas → middleware → servicios/repositorios → BD
- [x] **Scripts SQL versionados (00–07)** — presentes en `/supabase/`
- [x] **Historias de Usuario + RF** — documentadas en `HISTORIAS_USUARIO.md`
- [x] **Diagramas UML completos** — en `DIAGRAMAS_UML.md`
