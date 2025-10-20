(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/mocks/seed/pacientes.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v(JSON.parse("[{\"id\":1,\"dni\":\"32123456\",\"nombre\":\"Ana\",\"apellido\":\"Gómez\",\"mail\":\"ana@example.com\"},{\"id\":2,\"dni\":\"28999888\",\"nombre\":\"Luis\",\"apellido\":\"Pérez\",\"mail\":\"luis@example.com\"},{\"id\":3,\"dni\":\"41222333\",\"nombre\":\"María\",\"apellido\":\"Rojas\"}]"));}),
"[project]/mocks/seed/medicos.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v(JSON.parse("[{\"id\":1,\"nombre\":\"Julián\",\"apellido\":\"Suárez\",\"matricula\":\"M-1001\",\"especialidad_id\":1},{\"id\":2,\"nombre\":\"Lucía\",\"apellido\":\"Martín\",\"matricula\":\"M-1002\",\"especialidad_id\":2},{\"id\":3,\"nombre\":\"Carlos\",\"apellido\":\"Molina\",\"matricula\":\"M-1003\",\"especialidad_id\":3}]"));}),
"[project]/mocks/seed/especialidades.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v(JSON.parse("[{\"id\":1,\"nombre\":\"Clínica Médica\"},{\"id\":2,\"nombre\":\"Pediatría\"},{\"id\":3,\"nombre\":\"Cardiología\"}]"));}),
"[project]/mocks/seed/agenda_medico.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v(JSON.parse("[{\"id\":1,\"medico_id\":1,\"dia_semana\":1,\"hora_inicio\":\"09:00\",\"hora_fin\":\"13:00\",\"duracion_min\":30},{\"id\":2,\"medico_id\":1,\"dia_semana\":3,\"hora_inicio\":\"14:00\",\"hora_fin\":\"18:00\",\"duracion_min\":30},{\"id\":3,\"medico_id\":2,\"dia_semana\":2,\"hora_inicio\":\"09:00\",\"hora_fin\":\"12:00\",\"duracion_min\":20},{\"id\":4,\"medico_id\":3,\"dia_semana\":4,\"hora_inicio\":\"10:00\",\"hora_fin\":\"16:00\",\"duracion_min\":30}]"));}),
"[project]/mocks/seed/turnos.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v(JSON.parse("[{\"id\":1,\"paciente_id\":1,\"medico_id\":1,\"fecha_hora\":\"2025-10-20T12:00:00.000Z\",\"duracion_min\":30,\"estado\":\"asignado\",\"estado_id\":1,\"motivo\":\"Control anual\",\"created_at\":\"2025-10-10T12:00:00.000Z\"}]"));}),
"[project]/mocks/seed/recetas.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v(JSON.parse("[{\"id\":1,\"turno_id\":1,\"medico_id\":1,\"paciente_id\":1,\"fecha_emision\":\"2025-10-10\",\"indicaciones\":\"Ibuprofeno 400mg cada 8h x 3 días\"}]"));}),
"[project]/mocks/handlers.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "handlers",
    ()=>handlers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$http$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/msw/lib/core/http.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/msw/lib/core/HttpResponse.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$mocks$2f$seed$2f$pacientes$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/mocks/seed/pacientes.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f$mocks$2f$seed$2f$medicos$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/mocks/seed/medicos.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f$mocks$2f$seed$2f$especialidades$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/mocks/seed/especialidades.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f$mocks$2f$seed$2f$agenda_medico$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/mocks/seed/agenda_medico.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f$mocks$2f$seed$2f$turnos$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/mocks/seed/turnos.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f$mocks$2f$seed$2f$recetas$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/mocks/seed/recetas.json (json)");
;
;
;
;
;
;
;
let pacientes = [
    ...__TURBOPACK__imported__module__$5b$project$5d2f$mocks$2f$seed$2f$pacientes$2e$json__$28$json$29$__["default"]
];
let medicos = [
    ...__TURBOPACK__imported__module__$5b$project$5d2f$mocks$2f$seed$2f$medicos$2e$json__$28$json$29$__["default"]
];
let especialidades = [
    ...__TURBOPACK__imported__module__$5b$project$5d2f$mocks$2f$seed$2f$especialidades$2e$json__$28$json$29$__["default"]
];
let agenda = [
    ...__TURBOPACK__imported__module__$5b$project$5d2f$mocks$2f$seed$2f$agenda_medico$2e$json__$28$json$29$__["default"]
];
let turnos = [
    ...__TURBOPACK__imported__module__$5b$project$5d2f$mocks$2f$seed$2f$turnos$2e$json__$28$json$29$__["default"]
];
let recetas = [
    ...__TURBOPACK__imported__module__$5b$project$5d2f$mocks$2f$seed$2f$recetas$2e$json__$28$json$29$__["default"]
];
const nextId = (arr)=>arr.length ? Math.max(...arr.map((x)=>x.id)) + 1 : 1;
// Helpers sin tipos: garantizan objeto plano para poder usar "..."
const asObj = (x)=>x && typeof x === 'object' && !Array.isArray(x) ? x : {};
const readJsonObj = async (req)=>{
    try {
        const data = await req.json();
        return asObj(data);
    } catch (e) {
        return {};
    }
};
// Helpers
function pageOf(rows) {
    let page = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1, size = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 10;
    const start = (page - 1) * size;
    return {
        data: rows.slice(start, start + size),
        page,
        size,
        total: rows.length
    };
}
function withinSchedule(medico_id, iso, duracion_min) {
    const d = new Date(iso);
    const day = d.getDay(); // 0..6
    const pad = (n)=>String(n).padStart(2, '0');
    const hm = (h, m)=>"".concat(pad(h), ":").concat(pad(m));
    const hh = d.getHours(), mm = d.getMinutes();
    const start = hm(hh, mm);
    const seg = agenda.filter((a)=>a.medico_id === medico_id && a.dia_semana === day);
    if (!seg.length) return false;
    const addMin = (iso, min)=>new Date(new Date(iso).getTime() + min * 60000).toISOString();
    const end = addMin(iso, duracion_min);
    const ehh = new Date(end).getHours(), emm = new Date(end).getMinutes();
    const endStr = hm(ehh, emm);
    return seg.some((a)=>start >= a.hora_inicio && endStr <= a.hora_fin);
}
function overlaps(medico_id, iso, duracion_min) {
    const start = new Date(iso).getTime();
    const end = start + duracion_min * 60000;
    return turnos.some((t)=>t.medico_id === medico_id && (()=>{
            const s = new Date(t.fecha_hora).getTime();
            const e = s + t.duracion_min * 60000;
            return Math.max(s, start) < Math.min(e, end);
        })());
}
const handlers = [
    // Pacientes
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$http$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["http"].get('/api/pacientes', (param)=>{
        let { request } = param;
        const url = new URL(request.url);
        const search = (url.searchParams.get('search') || '').toLowerCase();
        const page = Number(url.searchParams.get('page') || '1');
        const size = Number(url.searchParams.get('size') || '10');
        let rows = [
            ...pacientes
        ];
        if (search) {
            rows = rows.filter((p)=>p.dni.includes(search) || p.nombre.toLowerCase().includes(search) || p.apellido.toLowerCase().includes(search));
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"].json(pageOf(rows, page, size));
    }),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$http$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["http"].get('/api/pacientes/:id', (param)=>{
        let { params } = param;
        const p = pacientes.find((x)=>x.id === Number(params.id));
        return p ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"].json(p) : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"].json({
            detail: 'Not found'
        }, {
            status: 404
        });
    }),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$http$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["http"].post('/api/pacientes', async (param)=>{
        let { request } = param;
        const body = await readJsonObj(request);
        const p = {
            id: nextId(pacientes),
            ...body
        };
        pacientes.push(p);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"].json(p, {
            status: 201
        });
    }),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$http$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["http"].put('/api/pacientes/:id', async (param)=>{
        let { params, request } = param;
        const id = Number(params.id);
        const idx = pacientes.findIndex((x)=>x.id === id);
        if (idx < 0) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"].json({
            detail: 'Not found'
        }, {
            status: 404
        });
        const body = await readJsonObj(request);
        pacientes[idx] = {
            ...pacientes[idx],
            ...body
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"].json(pacientes[idx]);
    }),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$http$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["http"].delete('/api/pacientes/:id', (param)=>{
        let { params } = param;
        const id = Number(params.id);
        pacientes = pacientes.filter((x)=>x.id !== id);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"](null, {
            status: 204
        });
    }),
    // Medicos
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$http$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["http"].get('/api/medicos', ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"].json(medicos)),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$http$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["http"].get('/api/medicos/:id', (param)=>{
        let { params } = param;
        const m = medicos.find((x)=>x.id === Number(params.id));
        return m ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"].json(m) : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"].json({
            detail: 'Not found'
        }, {
            status: 404
        });
    }),
    // GET /api/medicos (con search) — deja el que ya pusimos
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$http$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["http"].post('/api/medicos', async (param)=>{
        let { request } = param;
        const body = await readJsonObj(request);
        const m = {
            id: nextId(medicos),
            ...body
        };
        medicos.push(m);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"].json(m, {
            status: 201
        });
    }),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$http$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["http"].put('/api/medicos/:id', async (param)=>{
        let { params, request } = param;
        const id = Number(params.id);
        const idx = medicos.findIndex((x)=>x.id === id);
        if (idx < 0) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"].json({
            detail: 'Not found'
        }, {
            status: 404
        });
        const body = await readJsonObj(request);
        medicos[idx] = {
            ...medicos[idx],
            ...body
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"].json(medicos[idx]);
    }),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$http$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["http"].delete('/api/medicos/:id', (param)=>{
        let { params } = param;
        const id = Number(params.id);
        medicos = medicos.filter((x)=>x.id !== id);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"](null, {
            status: 204
        });
    }),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$http$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["http"].get('/api/medicos/:id/agenda', (param)=>{
        let { params } = param;
        const rows = agenda.filter((a)=>a.medico_id === Number(params.id));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"].json(rows);
    }),
    // Especialidades
    // Especialidades
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$http$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["http"].get('/api/especialidades', ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"].json(especialidades)),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$http$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["http"].post('/api/especialidades', async (param)=>{
        let { request } = param;
        const body = await readJsonObj(request);
        var _nombre;
        const nombre = String((_nombre = body.nombre) !== null && _nombre !== void 0 ? _nombre : '').trim();
        if (!nombre) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"].json({
                detail: 'Nombre requerido'
            }, {
                status: 400
            });
        }
        const e = {
            id: nextId(especialidades),
            nombre
        };
        especialidades.push(e);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"].json(e, {
            status: 201
        });
    }),
    // Turnos
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$http$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["http"].get('/api/turnos', (param)=>{
        let { request } = param;
        const url = new URL(request.url);
        const medicoId = url.searchParams.get('medicoId');
        const pacienteId = url.searchParams.get('pacienteId');
        const desde = url.searchParams.get('desde');
        const hasta = url.searchParams.get('hasta');
        const estado = url.searchParams.get('estado');
        let rows = [
            ...turnos
        ];
        if (medicoId) rows = rows.filter((t)=>t.medico_id === Number(medicoId));
        if (pacienteId) rows = rows.filter((t)=>t.paciente_id === Number(pacienteId));
        if (desde) rows = rows.filter((t)=>new Date(t.fecha_hora) >= new Date(desde));
        if (hasta) rows = rows.filter((t)=>new Date(t.fecha_hora) <= new Date(hasta));
        if (estado) rows = rows.filter((t)=>t.estado === estado);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"].json(rows);
    }),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$http$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["http"].get('/api/turnos/:id', (param)=>{
        let { params } = param;
        const t = turnos.find((x)=>x.id === Number(params.id));
        return t ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"].json(t) : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"].json({
            detail: 'Not found'
        }, {
            status: 404
        });
    }),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$http$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["http"].post('/api/turnos', async (param)=>{
        let { request } = param;
        const body = await readJsonObj(request);
        var _medico_id;
        const medico_id = Number((_medico_id = body.medico_id) !== null && _medico_id !== void 0 ? _medico_id : 0);
        var _fecha_hora;
        const fecha_hora = String((_fecha_hora = body.fecha_hora) !== null && _fecha_hora !== void 0 ? _fecha_hora : '');
        var _duracion_min;
        const duracion_min = Number((_duracion_min = body.duracion_min) !== null && _duracion_min !== void 0 ? _duracion_min : 30);
        if (!withinSchedule(medico_id, fecha_hora, duracion_min)) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"].json({
            detail: 'Fuera de agenda del médico'
        }, {
            status: 400
        });
        if (overlaps(medico_id, fecha_hora, duracion_min)) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"].json({
            detail: 'Se superpone con otro turno'
        }, {
            status: 409
        });
        const t = {
            id: nextId(turnos),
            estado: 'asignado',
            estado_id: 1,
            created_at: new Date().toISOString(),
            ...body,
            medico_id,
            fecha_hora,
            duracion_min
        };
        turnos.push(t);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"].json(t, {
            status: 201
        });
    }),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$http$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["http"].patch('/api/turnos/:id/estado', async (param)=>{
        let { params, request } = param;
        const id = Number(params.id);
        const idx = turnos.findIndex((x)=>x.id === id);
        if (idx < 0) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"].json({
            detail: 'Not found'
        }, {
            status: 404
        });
        const body = await readJsonObj(request);
        var _estado;
        const estado = String((_estado = body.estado) !== null && _estado !== void 0 ? _estado : '');
        const valid = [
            'asignado',
            'cancelado_medico',
            'cancelado_paciente',
            'atendido',
            'ausente'
        ];
        if (!valid.includes(estado)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"].json({
                detail: 'Estado inválido'
            }, {
                status: 400
            });
        }
        turnos[idx] = {
            ...turnos[idx],
            estado
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"].json(turnos[idx]);
    }),
    // Recetas
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$http$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["http"].get('/api/recetas', (param)=>{
        let { request } = param;
        const url = new URL(request.url);
        const turnoId = url.searchParams.get('turnoId');
        const pacienteId = url.searchParams.get('pacienteId');
        const medicoId = url.searchParams.get('medicoId');
        let rows = [
            ...recetas
        ];
        if (turnoId) rows = rows.filter((r)=>r.turno_id === Number(turnoId));
        if (pacienteId) rows = rows.filter((r)=>r.paciente_id === Number(pacienteId));
        if (medicoId) rows = rows.filter((r)=>r.medico_id === Number(medicoId));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"].json(rows);
    }),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$http$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["http"].post('/api/recetas', async (param)=>{
        let { request } = param;
        const body = await readJsonObj(request);
        const r = {
            id: nextId(recetas),
            ...body
        };
        recetas.push(r);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$core$2f$HttpResponse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HttpResponse"].json(r, {
            status: 201
        });
    })
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/mocks/browser.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "worker",
    ()=>worker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$browser$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/msw/lib/browser/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$mocks$2f$handlers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/mocks/handlers.ts [app-client] (ecmascript)");
;
;
const worker = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$msw$2f$lib$2f$browser$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setupWorker"])(...__TURBOPACK__imported__module__$5b$project$5d2f$mocks$2f$handlers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["handlers"]);
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=mocks_24227a7d._.js.map