# Historias de Usuario — Sistema Qapaq Banca
## Proyecto Integrado: Core Bancario + Homebanking

---

## MÓDULO 1 — AUTENTICACIÓN Y ACCESO (RBAC)

### HU-01 Login por correo institucional
**Como** usuario del sistema (cliente, asesor o comité)
**Quiero** iniciar sesión con mi correo institucional y clave
**Para** acceder a las funciones que me corresponden según mi rol

**Criterios de aceptación:**
- El sistema valida correo y clave contra la BD
- Emite un JWT firmado con el rol del usuario
- Redirige automáticamente: cliente → /banca, asesor/comité → /asesor
- Un correo o clave incorrectos muestran mensaje de error claro

**RF asociado:** RF-01
**Prioridad:** Alta

---

### HU-02 Control de acceso por rol (RBAC)
**Como** administrador del sistema
**Quiero** que cada usuario solo pueda acceder a las rutas de su rol
**Para** garantizar la seguridad e integridad de la información

**Criterios de aceptación:**
- Cliente que intenta acceder a /asesor es redirigido a /banca
- Asesor que intenta acceder a /banca es redirigido a /asesor
- Usuario sin sesión que accede a cualquier ruta protegida va a /login
- El backend retorna 401 si no hay token, 403 si el rol no tiene permiso

**RF asociado:** RF-02
**Prioridad:** Alta

---

## MÓDULO 2 — PORTAL DEL CLIENTE (HOMEBANKING)

### HU-03 Consultar posición global
**Como** cliente
**Quiero** ver un resumen de mis cuentas de ahorro y créditos al ingresar
**Para** conocer mi situación financiera actual de un vistazo

**Criterios de aceptación:**
- Muestra total en ahorros sumando todas las cuentas activas
- Muestra deuda total de créditos vigentes
- Lista cuentas de ahorro con saldo y estado
- Lista créditos con saldo pendiente y estado
- KPIs actualizados en tiempo real desde Supabase

**RF asociado:** RF-03
**Prioridad:** Alta

---

### HU-04 Ver movimientos de cuenta de ahorro
**Como** cliente
**Quiero** ver el detalle y movimientos de mis cuentas de ahorro
**Para** revisar mis depósitos, retiros y abonos de desembolso

**Criterios de aceptación:**
- Lista todas mis cuentas con saldo y tipo
- Al expandir una cuenta muestra movimientos ordenados por fecha desc
- Cada movimiento muestra: fecha, descripción, monto (+/-) y saldo resultante
- Los desembolsos de crédito aparecen como movimiento positivo

**RF asociado:** RF-04
**Prioridad:** Alta

---

### HU-05 Ver cronograma de crédito
**Como** cliente
**Quiero** ver el cronograma de pagos de mis créditos vigentes
**Para** saber cuánto debo pagar cada mes y en qué fechas

**Criterios de aceptación:**
- Lista créditos con: código, tipo, TEA, cuota mensual, saldo pendiente, días de atraso
- Al expandir muestra el cronograma completo: N°, vencimiento, cuota, capital, interés, saldo
- El estado de cada cuota se muestra: Pendiente, Pagada, Vencida
- Botón "Pagar cuota" lleva a la pantalla de operaciones

**RF asociado:** RF-05
**Prioridad:** Alta

---

### HU-06 Realizar transferencia entre cuentas
**Como** cliente
**Quiero** transferir saldo entre mis cuentas de ahorro
**Para** mover mi dinero según mis necesidades

**Criterios de aceptación:**
- Selección de cuenta origen y destino propias
- Validación de saldo suficiente en cuenta origen
- Ambas cuentas se actualizan en la BD
- Se registra movimiento en ambas cuentas con descripción
- Se muestra comprobante con fecha y monto

**RF asociado:** RF-06
**Prioridad:** Media

---

### HU-07 Pagar cuota de crédito
**Como** cliente
**Quiero** pagar una cuota de mi crédito desde mi cuenta de ahorro
**Para** mantener mi historial crediticio al día

**Criterios de aceptación:**
- Selección del crédito a pagar y cuenta de débito
- Validación de saldo suficiente
- Actualiza saldo pendiente del crédito
- Marca la siguiente cuota pendiente como Pagada
- Registra movimiento negativo en la cuenta de ahorro

**RF asociado:** RF-07
**Prioridad:** Alta

---

### HU-08 Simular crédito antes de solicitar
**Como** cliente
**Quiero** simular el cálculo de mi cuota y cronograma antes de solicitar
**Para** evaluar si puedo asumir el préstamo sin comprometer mis finanzas

**Criterios de aceptación:**
- Selección de tipo (Microempresa 43.92% / Consumo 40.92%), monto, plazo y fecha
- Calcula cuota fija en tiempo real (sistema francés: TEA→TEM→cuota)
- Muestra total a pagar, total de intereses y RDS si ingresa su ingreso
- Cronograma completo con N°, vencimiento, capital, interés y saldo
- Los 30 casos del PDF aparecen como referencia con ✓/✗ de verificación
- No registra ninguna solicitud, es solo informativo

**RF asociado:** RF-08
**Prioridad:** Media

---

### HU-09 Solicitar crédito empresarial
**Como** cliente
**Quiero** solicitar un crédito desde el homebanking
**Para** financiar mi negocio o necesidades personales

**Criterios de aceptación:**
- Selección de tipo de crédito, actividad CIIU, monto, plazo e ingreso neto
- Validación automática: monto mínimo/máximo, plazo máximo, RDS ≤ 40%
- Muestra scoring crediticio (0-100), categoría (A/B/C) y semáforo (verde/amarillo)
- Indica ruta de aprobación: asesor (≤S/8,000) o comité (>S/8,000)
- Solicitud queda en estado "En Evaluación" en la BD
- Historial de solicitudes con estado actualizado en tiempo real

**RF asociado:** RF-09
**Prioridad:** Alta

---

## MÓDULO 3 — BACKOFFICE DEL ASESOR / COMITÉ

### HU-10 Registrar solicitud a nombre del cliente
**Como** asesor de negocios
**Quiero** ubicar a un cliente y registrar su solicitud de crédito
**Para** cumplir con el flujo del PDF: "Ingresa al sistema como asesor, ubica al cliente y registra la solicitud"

**Criterios de aceptación:**
- Buscador de clientes por nombre, correo o DNI
- Tabla de los 30 casos del PDF para prellenar datos con un clic
- Validación de elegibilidad, RDS, scoring y ruta de aprobación en tiempo real
- Solicitud queda en BD con todos los campos: cuota, RDS, scoring, categoría, nivel de aprobación
- Mensaje indica si requiere asesor o comité

**RF asociado:** RF-10
**Prioridad:** Alta

---

### HU-11 Evaluar y aprobar solicitud de crédito
**Como** asesor de negocios (montos ≤ S/8,000) o comité (todos los montos)
**Quiero** revisar el cronograma y aprobar o rechazar una solicitud
**Para** completar el flujo end-to-end hasta el desembolso

**Criterios de aceptación:**
- Bandeja muestra solicitudes "En Evaluación" con semáforo, scoring y nivel requerido
- Solicitudes >S/8,000 muestran "🔒 Requiere Comité" para el asesor
- Modal de aprobación muestra cronograma completo generado en backend
- Al aprobar: crea crédito + cuotas + abona desembolso en cuenta de ahorro del cliente
- Al rechazar: marca solicitud con comentario del asesor
- El cliente ve el resultado inmediatamente en su historial y "Mis Créditos"

**RF asociado:** RF-11
**Prioridad:** Alta

---

### HU-12 Consultar cartera morosa por bandas (R1)
**Como** asesor de negocios o comité
**Quiero** ver la cartera de créditos en mora clasificada por bandas
**Para** priorizar la gestión de cobranza según el nivel de riesgo

**Criterios de aceptación:**
- KPIs por banda: cantidad de créditos y saldo total en cada banda
- Bandas: Preventiva (1-30d), Temprana (31-60d), Tardía (61-120d), Judicial (≥121d), Castigo (>180d)
- Filtro por banda con actualización en tiempo real
- Tabla con: código, cliente, DNI, saldo, cuota, días de atraso y banda
- La mora total representa ~13% de la cartera (calibrado a proporciones reales)

**RF asociado:** RF-12
**Prioridad:** Alta

---

### HU-13 Registrar gestión de cobranza (R2)
**Como** asesor de negocios
**Quiero** registrar cada acción de cobranza realizada sobre un crédito moroso
**Para** mantener un historial completo de gestiones y cumplir con la normativa

**Criterios de aceptación:**
- Tipos de gestión: Llamada, Visita, Carta, WhatsApp, Correo
- Resultados: Contactado, No contactado, Promesa de pago, Pago realizado
- Si resultado es "Promesa de pago": campos de monto prometido y fecha de promesa
- Historial de gestiones ordenado por fecha descendente
- Muestra el gestor que realizó cada gestión

**RF asociado:** RF-13
**Prioridad:** Alta

---

### HU-14 Derivar a judicial y castigar crédito (R3)
**Como** asesor (judicial) o comité (castigo)
**Quiero** realizar las transiciones de estado de créditos muy morosos
**Para** aplicar la normativa SBS de gestión de cartera

**Criterios de aceptación:**
- Derivar a Judicial: requiere ≥121 días, disponible para asesor y comité
- Castigar: requiere >180 días, SOLO disponible para comité (403 si asesor intenta)
- Botones muestran días faltantes si no cumple el umbral
- Cada transición registra automáticamente una gestión en el historial
- El backend valida los umbrales independientemente del frontend (seguridad real)

**RF asociado:** RF-14
**Prioridad:** Alta

---

## REQUISITOS FUNCIONALES (RF)

| RF | Descripción | HU |
|---|---|---|
| RF-01 | Login con JWT por correo + clave | HU-01 |
| RF-02 | RBAC: rutas protegidas por rol (cliente/asesor/comité) | HU-02 |
| RF-03 | Dashboard cliente con KPIs de ahorros y créditos | HU-03 |
| RF-04 | Consulta de cuentas de ahorro y movimientos | HU-04 |
| RF-05 | Consulta de créditos vigentes y cronograma de cuotas | HU-05 |
| RF-06 | Transferencia entre cuentas propias con registro de movimiento | HU-06 |
| RF-07 | Pago de cuota de crédito con débito en cuenta de ahorro | HU-07 |
| RF-08 | Simulador de crédito (TEA→TEM→cuota fija, cronograma, RDS) | HU-08 |
| RF-09 | Solicitud de crédito con scoring, semáforo RDS y ruta de aprobación | HU-09 |
| RF-10 | Registro de solicitud por asesor a nombre de cliente con 30 casos PDF | HU-10 |
| RF-11 | Aprobación/rechazo con cronograma + desembolso automático | HU-11 |
| RF-12 | Consulta de cartera morosa por bandas con KPIs (R1) | HU-12 |
| RF-13 | Registro e historial de gestiones de cobranza (R2) | HU-13 |
| RF-14 | Transición judicial/castigo con validación de umbrales y RBAC (R3) | HU-14 |
