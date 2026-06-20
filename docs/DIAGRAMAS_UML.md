# Diagramas UML — Sistema Qapaq Banca

## 1. Diagrama de Casos de Uso

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA QAPAQ BANCA                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              HOMEBANKING (Portal Cliente)                │   │
│  │                                                          │   │
│  │  ○ Ver posición global (KPIs)                           │   │
│  │  ○ Consultar cuentas de ahorro y movimientos            │   │
│  │  ○ Ver cronograma de créditos                           │   │
│  │  ○ Realizar transferencia entre cuentas                 │   │
│  │  ○ Pagar cuota de crédito                               │   │
│  │  ○ Pagar servicios (agua, luz, teléfono)                │   │
│  │  ○ Simular crédito (TEA/RDS/cronograma)                 │   │
│  │  ○ Solicitar crédito (con scoring y semáforo)           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ▲                                   │
│                         [CLIENTE]                                │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              BACKOFFICE (Core Financiero)                │   │
│  │                                                          │   │
│  │  ○ Ubicar cliente y registrar solicitud de crédito      │   │
│  │  ○ Evaluar solicitudes (bandeja con semáforo/scoring)   │   │
│  │  ○ Aprobar solicitud + generar cronograma + desembolso  │   │
│  │  ○ Rechazar solicitud con comentario                    │   │
│  │  ○ Consultar cartera morosa por bandas (R1)             │   │
│  │  ○ Registrar gestiones de cobranza (R2)                 │   │
│  │  ○ Derivar crédito a Judicial ≥121 días (R3)            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         ▲                                        │
│                    [ASESOR DE NEGOCIOS]                          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              EXCLUSIVO COMITÉ DE CRÉDITOS               │   │
│  │                                                          │   │
│  │  ○ Todo lo del asesor PLUS:                             │   │
│  │  ○ Aprobar solicitudes >S/8,000                         │   │
│  │  ○ Castigar créditos >180 días (R3)                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         ▲                                        │
│                  [COMITÉ DE CRÉDITOS]                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Diagrama de Flujo — Solicitud de Crédito (End-to-End)

```
[CLIENTE]                    [ASESOR/COMITÉ]               [SISTEMA/BD]
    │                               │                            │
    │── Ingresa datos del crédito ──►│                            │
    │   (monto, plazo, ingreso)      │                            │
    │                               │                            │
    │◄── Calcula cuota, RDS,        │                            │
    │    scoring, semáforo ─────────│                            │
    │                               │                            │
    │── Envía solicitud ────────────►│──── INSERT solicitudes ──►│
    │                               │     (estado: En Eval.)     │
    │                               │                            │
    │◄── "En Evaluación" ──────────│                            │
    │                               │                            │
    │                    [ASESOR ubica solicitud en Bandeja]      │
    │                               │                            │
    │                               │── Verifica nivel ─────────►│
    │                               │   (monto ≤/> 8,000)        │
    │                               │                            │
    │                    [Si monto > 8,000: solo COMITÉ puede]    │
    │                               │                            │
    │                               │── Revisa cronograma        │
    │                               │   generado en backend      │
    │                               │                            │
    │                               │── Confirma aprobación ────►│
    │                               │                       ┌────┤
    │                               │                       │ INSERT creditos
    │                               │                       │ INSERT cuotas_credito
    │                               │                       │ UPDATE saldo ahorro
    │                               │                       │ INSERT movimiento
    │                               │                       │ UPDATE solicitud→Desembolsado
    │                               │                       └────┤
    │◄── Saldo actualizado ─────────────────────────────────────│
    │◄── Crédito creado ────────────────────────────────────────│
    │◄── Solicitud: Desembolsado ───────────────────────────────│
```

---

## 3. Diagrama de Arquitectura en Capas

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React + Vite)                │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │   PÁGINAS   │  │  COMPONENTES │  │       LIBS        │ │
│  │             │  │              │  │                   │ │
│  │ LandingPage │  │ HBHeader     │  │ api.js            │ │
│  │ LoginPage   │  │ HBLayout     │  │ creditCalc.js     │ │
│  │ HomePage    │  │ Badge        │  │ format.js         │ │
│  │ AhorrosPage │  │ RiskBadges   │  │ casos.js          │ │
│  │ CreditosPage│  │ Icon         │  │ supabaseClient.js │ │
│  │ OpsPage     │  │ ProtectedRoute│  │                   │ │
│  │ SimuladorPage│  └──────────────┘  └───────────────────┘ │
│  │ SolicitarPage│                                           │
│  │ AsesorPanel │  ┌──────────────────────────────────────┐ │
│  │ MoraPage    │  │  CONTEXTO: AuthContext (JWT + rol)   │ │
│  └─────────────┘  └──────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP REST (JWT en headers)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    RUTAS (Routes)                   │   │
│  │  /auth  /cuentas  /creditos  /operaciones           │   │
│  │  /asesor  /mora                                     │   │
│  └────────────────────────┬────────────────────────────┘   │
│                           │                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               MIDDLEWARES                           │   │
│  │  requireAuth (JWT verify) │ requireRole (RBAC)      │   │
│  └────────────────────────┬────────────────────────────┘   │
│                           │                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              LÓGICA DE NEGOCIO                      │   │
│  │  creditCalc.js: TEA→TEM→cuota, scoring, RDS,       │   │
│  │  cronograma, nivel de aprobación, umbrales mora     │   │
│  └────────────────────────┬────────────────────────────┘   │
│                           │                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              ACCESO A DATOS (db.js)                 │   │
│  │  Supabase client (service_role key — ignora RLS)    │   │
│  └────────────────────────┬────────────────────────────┘   │
└────────────────────────────┼────────────────────────────────┘
                             │ Supabase REST API
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              BASE DE DATOS (Supabase / PostgreSQL)          │
│                                                             │
│  usuarios → cuentas_ahorro → movimientos_ahorro             │
│  usuarios → solicitudes_credito → creditos → cuotas_credito │
│  creditos → gestiones_cobranza                              │
│                                                             │
│  RLS habilitado en todas las tablas                         │
│  Solo el backend (service_role) puede leer/escribir         │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Diagrama de Base de Datos (Entidad-Relación)

```
USUARIOS (id, codigo, nombre, dni, password, rol)
    │
    ├──────────────────► CUENTAS_AHORRO (id, codigo, usuario_id, tipo, saldo, estado)
    │                           │
    │                           └──► MOVIMIENTOS_AHORRO (id, cuenta_id, fecha, descripcion, monto, saldo)
    │
    ├──────────────────► SOLICITUDES_CREDITO
    │                    (id, codigo, usuario_id, tipo_credito, monto, plazo, tea,
    │                     cuota_mensual, rds, scoring, categoria_riesgo, semaforo,
    │                     nivel_aprobacion, estado, asesor_id, comentario_asesor)
    │                           │
    │                           └──► CREDITOS
    │                                (id, codigo, usuario_id, solicitud_id, tipo_credito,
    │                                 monto, plazo, tea, cuota_mensual, saldo_pendiente,
    │                                 dias_atraso, estado, banda_mora, fecha_desembolso)
    │                                       │
    │                                       ├──► CUOTAS_CREDITO
    │                                       │    (id, credito_id, numero, fecha_pago,
    │                                       │     cuota, capital, interes, saldo, estado)
    │                                       │
    │                                       └──► GESTIONES_COBRANZA
    │                                            (id, credito_id, usuario_id, fecha,
    │                                             tipo_gestion, resultado, comentario,
    │                                             monto_prometido, fecha_promesa)
    │
    └──────────────────► GESTIONES_COBRANZA (usuario_id → gestor que registró)
```

---

## 5. Diagrama de Transición de Estados — Solicitud de Crédito

```
[INICIO]
    │
    ▼
┌──────────────┐    Validación fallida    ┌──────────────┐
│  Formulario  │ ────────────────────────► │   Error UI   │
│  de Solicitud│    (RDS>40%, monto fuera  │  (no se crea)│
└──────┬───────┘     de rango, etc.)       └──────────────┘
       │ Validación OK
       ▼
┌──────────────┐
│ En Evaluación│ ◄── Estado inicial al registrar
└──────┬───────┘
       │
       ├──────────────────────────────────────┐
       │ Asesor/Comité aprueba                │ Asesor/Comité rechaza
       ▼                                      ▼
┌──────────────┐                    ┌──────────────────┐
│ Desembolsado │                    │    Rechazado     │
│              │                    │  + comentario    │
│ Crea crédito │                    └──────────────────┘
│ Crea cuotas  │
│ Abona saldo  │
└──────────────┘
```

---

## 6. Diagrama de Transición de Estados — Crédito en Mora (R3)

```
[Normal] ──── cliente no paga ────► [Mora]
                                       │
                          días_atraso  │
                                       │
                    1-30 días ────────► [Banda: Preventiva]
                   31-60 días ────────► [Banda: Temprana]
                  61-120 días ────────► [Banda: Tardía]
                                       │
                   ≥121 días ──────────► [Judicial] ◄── Asesor o Comité deriva
                                       │
                   >180 días ──────────► [Castigo] ◄── SOLO Comité puede castigar
                                                        (403 si intenta asesor)
```
