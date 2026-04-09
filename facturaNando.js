/* facturaNando.js - actualizado: recuadro "CERRADO" y selección/facturación solo para cerrados.
   Sustituye completamente tu fichero facturaNando.js por este contenido. */

const app = {
    avisos: [],
    opciones: {
        aseguradora: [
            "SEJESCAR", "MESOS GESTION", "CATALANA OCCIDENTE",
            "SARETEKNIKA", "SIGMA REPARACIONES", "CORBERO",
            "HISENSE", "SVAN", "ASPES", "HIUNDAY"
        ],
        marca: [
            "CORBERO", "HISENSE", "SVAN", "ASPES", "HIUNDAY", "SONY", "LG", "BOSCH"
        ],
        tipoAparato: [
            "LAVADORA", "FRIGORÍFICO", "LAVAVAJILLAS", "HORNO",
            "MICROONDAS", "TV", "AIRE ACONDICIONADO", "SECADORA",
            "CONGELADOR", "CALEFACCIÓN", "VENTILADOR", "ASPIRADORA",
            "CAFETERA", "TOSTADORA", "BATIDORA", "OTROS"
        ]
    },
    datosFacturacion: {
        emisor: {
            nombre: "FERNANDO CHECA RUIZ",
            direccion: "C/ REYES CATOLICOS Nº 1",
            localidad: "42110 OLVEGA (SORIA)",
            dni: "16.807.738-M",
            telf: "68-29-64-59",
            email: "fchecaruiz@gmail.com",
            cuenta: "ES71 2085 9611 10 0300041000",
            banco: "IBERCAJA"
        },
        receptor: {
            nombre: "REPARACIONES TECNICAS DUERO S.L.U.",
            direccion: "C/ CASCANTE Nº 7 BAJO",
            localidad: "42100 AGREDA (SORIA)",
            cif: "B-01953504",
            email: "electroduero@hotmail.com",
            telf: "686-252-248"
        }
    },
    ultimoNumeroFactura: 0,
    selectionMode: null,

    init: function() {
        this.loadData();
        this.loadOpciones();
        this.loadDatosFacturacion();
        this.populateSelects();
        this.populateFilterOptions();
        this.setupEventListeners();
        this.displayAvisos();
    },

    // --- Storage ---
    loadData() {
        try {
            const s = localStorage.getItem('facturaNandoAvisos');
            if (s) this.avisos = JSON.parse(s);
            const u = localStorage.getItem('ultimoNumeroFactura');
            if (u) this.ultimoNumeroFactura = parseInt(u, 10) || 0;
        } catch (err) {
            console.warn('Error leyendo avisos desde localStorage', err);
            this.avisos = [];
            this.ultimoNumeroFactura = 0;
            this.saveData();
        }
    },
    loadOpciones() {
        try {
            const stored = localStorage.getItem('facturaNandoOpciones');
            if (stored) {
                const parsed = JSON.parse(stored);
                this.opciones = {
                    aseguradora: Array.isArray(parsed.aseguradora) ? parsed.aseguradora : this.opciones.aseguradora,
                    marca: Array.isArray(parsed.marca) ? parsed.marca : this.opciones.marca,
                    tipoAparato: Array.isArray(parsed.tipoAparato) ? parsed.tipoAparato : this.opciones.tipoAparato
                };
            } else {
                localStorage.setItem('facturaNandoOpciones', JSON.stringify(this.opciones));
            }
        } catch (err) {
            console.warn('Error leyendo opciones desde localStorage, usando valores por defecto', err);
            localStorage.setItem('facturaNandoOpciones', JSON.stringify(this.opciones));
        }
    },
    saveData() {
        try {
            localStorage.setItem('facturaNandoAvisos', JSON.stringify(this.avisos));
            localStorage.setItem('facturaNandoOpciones', JSON.stringify(this.opciones));
            localStorage.setItem('ultimoNumeroFactura', String(this.ultimoNumeroFactura));
        } catch (err) {
            console.error('Error guardando datos en localStorage', err);
        }
    },

    // --- Datos facturación ---
    loadDatosFacturacion() {
        try {
            const em = localStorage.getItem('datosEmisor');
            const re = localStorage.getItem('datosReceptor');
            if (em) this.datosFacturacion.emisor = JSON.parse(em);
            if (re) this.datosFacturacion.receptor = JSON.parse(re);
        } catch (err) {
            console.warn('Error cargando datos de facturación', err);
        }

        const setIf = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
        setIf('emisorNombre', this.datosFacturacion.emisor.nombre);
        setIf('emisorDireccion', this.datosFacturacion.emisor.direccion);
        setIf('emisorLocalidad', this.datosFacturacion.emisor.localidad);
        setIf('emisorDni', this.datosFacturacion.emisor.dni);
        setIf('emisorTelf', this.datosFacturacion.emisor.telf);
        setIf('emisorEmail', this.datosFacturacion.emisor.email);
        setIf('emisorCuenta', this.datosFacturacion.emisor.cuenta);
        setIf('emisorBanco', this.datosFacturacion.emisor.banco);

        setIf('receptorNombre', this.datosFacturacion.receptor.nombre);
        setIf('receptorDireccion', this.datosFacturacion.receptor.direccion);
        setIf('receptorLocalidad', this.datosFacturacion.receptor.localidad);
        setIf('receptorCif', this.datosFacturacion.receptor.cif);
        setIf('receptorEmail', this.datosFacturacion.receptor.email);
        setIf('receptorTelf', this.datosFacturacion.receptor.telf);
    },
    guardarDatosFacturacion() {
        this.datosFacturacion.emisor = {
            nombre: document.getElementById('emisorNombre').value,
            direccion: document.getElementById('emisorDireccion').value,
            localidad: document.getElementById('emisorLocalidad').value,
            dni: document.getElementById('emisorDni').value,
            telf: document.getElementById('emisorTelf').value,
            email: document.getElementById('emisorEmail').value,
            cuenta: document.getElementById('emisorCuenta').value,
            banco: document.getElementById('emisorBanco').value
        };
        this.datosFacturacion.receptor = {
            nombre: document.getElementById('receptorNombre').value,
            direccion: document.getElementById('receptorDireccion').value,
            localidad: document.getElementById('receptorLocalidad').value,
            cif: document.getElementById('receptorCif').value,
            email: document.getElementById('receptorEmail').value,
            telf: document.getElementById('receptorTelf').value
        };
        localStorage.setItem('datosEmisor', JSON.stringify(this.datosFacturacion.emisor));
        localStorage.setItem('datosReceptor', JSON.stringify(this.datosFacturacion.receptor));
        this.showToast('success','Datos guardados correctamente', 4000);
    },

    // --- Eventos ---
    setupEventListeners() {
        document.getElementById('aviso-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addOrUpdateAviso();
        });

        document.getElementById('buscadorAvisos').addEventListener('input', () => this.displayAvisos());
        document.getElementById('limpiar-busqueda').addEventListener('click', () => { document.getElementById('buscadorAvisos').value = ''; this.displayAvisos(); });
        document.getElementById('filtroAseguradora').addEventListener('change', () => this.displayAvisos());
        document.getElementById('filtroAno').addEventListener('change', () => this.displayAvisos());
        document.getElementById('filtroMes').addEventListener('change', () => this.displayAvisos());
        document.getElementById('aplicar-filtro-btn').addEventListener('click', () => this.displayAvisos());

        document.getElementById('sel-all').addEventListener('click', () => this.bulkSelect('all'));
        document.getElementById('sel-none').addEventListener('click', () => this.bulkSelect('none'));
        document.getElementById('sel-month').addEventListener('click', () => this.openSelectionModal('month'));
        document.getElementById('sel-week').addEventListener('click', () => this.openSelectionModal('week'));
        document.getElementById('sel-year').addEventListener('click', () => this.openSelectionModal('year'));

        document.getElementById('avisos-list').addEventListener('change', (e) => {
            if (e.target && e.target.classList.contains('aviso-checkbox')) {
                const id = e.target.dataset.id;
                const avis = this.avisos.find(a => String(a.id) === String(id));
                if (avis) {
                    // Solo permitir seleccionar si está cerrado (defensa extra)
                    if (!avis.cerrado) {
                        e.target.checked = false;
                        this.showToast('info','El aviso no está cerrado. No se puede facturar.', 4000);
                        return;
                    }
                    avis.seleccionado = e.target.checked;
                    this.saveData();
                    this.updateFacturaPreview();
                }
            }
        });

        document.getElementById('generar-factura-pdf').addEventListener('click', () => this.generarFacturaPDF());

        // Modal manage
        document.querySelector('#manage-modal .close').addEventListener('click', () => document.getElementById('manage-modal').style.display = 'none');
        window.addEventListener('click', (ev) => {
            const modal = document.getElementById('manage-modal');
            if (ev.target === modal) modal.style.display = 'none';
            const selModal = document.getElementById('select-modal');
            if (ev.target === selModal) selModal.style.display = 'none';
        });

        // Buttons to open manage modal
        document.getElementById('manage-aseg-btn').addEventListener('click', () => this.openManageModal('aseguradora'));
        document.getElementById('manage-marca-btn').addEventListener('click', () => this.openManageModal('marca'));
        document.getElementById('manage-tipo-btn').addEventListener('click', () => this.openManageModal('tipoAparato'));

        // Selection modal
        document.querySelector('#select-modal .close-select').addEventListener('click', () => this.closeSelectionModal());
        document.getElementById('cancel-selection-btn').addEventListener('click', () => this.closeSelectionModal());
        document.getElementById('apply-selection-btn').addEventListener('click', () => this.applySelectionFromModal());

        // Guardar datos facturación
        document.getElementById('guardar-datos-btn').addEventListener('click', () => this.guardarDatosFacturacion());
    },

    // --- Selects ---
    populateSelects() {
        this.populateSelect('aseguradora');
        this.populateSelect('marca');
        this.populateSelect('tipoAparato');
    },
    populateSelect(selectId) {
        const sel = document.getElementById(selectId);
        if (!sel) return;
        const cur = sel.value || '';
        sel.innerHTML = `<option value="">Selecciona ${selectId === 'aseguradora' ? 'Aseguradora' : selectId === 'marca' ? 'Marca' : 'Tipo de Aparato'}</option>`;
        if (!Array.isArray(this.opciones[selectId])) this.opciones[selectId] = [];
        this.opciones[selectId].forEach(opt => {
            const o = document.createElement('option'); o.value = opt; o.textContent = opt; sel.appendChild(o);
        });
        if (cur && this.opciones[selectId].includes(cur)) sel.value = cur;
    },

    populateFilterOptions() {
        const filtroAseg = document.getElementById('filtroAseguradora');
        filtroAseg.innerHTML = '<option value="">Todas</option>';
        if (!Array.isArray(this.opciones.aseguradora)) this.opciones.aseguradora = [];
        this.opciones.aseguradora.forEach(a => { const o = document.createElement('option'); o.value = a; o.textContent = a; filtroAseg.appendChild(o); });

        const selAno = document.getElementById('filtroAno');
        const anos = [...new Set(this.avisos.map(av => av.fechaAviso ? new Date(av.fechaAviso + 'T00:00:00').getFullYear() : null).filter(Boolean))].sort((a,b)=>b-a);
        selAno.innerHTML = '<option value="">Todos</option>';
        anos.forEach(ano => { const o = document.createElement('option'); o.value = ano; o.textContent = ano; selAno.appendChild(o); });
    },

    // --- Modal gestionar opciones ---
    openManageModal(tipo) {
        const modal = document.getElementById('manage-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');

        if (!this.opciones[tipo]) this.opciones[tipo] = [];

        modalTitle.textContent = `Gestionar ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;

        let html = '<div class="option-list">';
        if (this.opciones[tipo].length === 0) {
            html += `<div class="option-item"><span>No hay opciones todavía</span></div>`;
        } else {
            this.opciones[tipo].forEach((op, idx) => {
                html += `<div class="option-item">
                            <span>${op}</span>
                            <div>
                                <button class="edit-btn" data-idx="${idx}" data-tipo="${tipo}">Editar</button>
                                <button class="delete-btn" data-idx="${idx}" data-tipo="${tipo}">Eliminar</button>
                            </div>
                         </div>`;
            });
        }
        html += `</div>
            <div class="add-option-form" style="display:flex; gap:8px; margin-top:10px;">
                <input type="text" id="nueva-opcion-${tipo}" placeholder="Añadir nueva opción..." style="flex:1">
                <button id="add-btn-${tipo}">Añadir</button>
            </div>`;

        modalBody.innerHTML = html;
        modal.style.display = 'block';

        // attach button handlers
        modalBody.querySelectorAll('.edit-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.dataset.idx, 10);
                const tipoLocal = btn.dataset.tipo;
                const nuevo = prompt('Modifica la opción:', this.opciones[tipoLocal][idx]);
                if (nuevo === null) return;
                const up = nuevo.trim().toUpperCase();
                if (!up) return this.showToast('info','Texto vacío', 4000);
                if (this.opciones[tipoLocal].includes(up)) return this.showToast('info','La opción ya existe', 4000);
                this.opciones[tipoLocal][idx] = up;
                this.saveData();
                this.openManageModal(tipoLocal);
            };
        });
        modalBody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.dataset.idx, 10);
                const tipoLocal = btn.dataset.tipo;
                if (!confirm('Eliminar opción?')) return;
                this.opciones[tipoLocal].splice(idx,1);
                this.saveData();
                this.openManageModal(tipoLocal);
            };
        });

        const addBtn = document.getElementById(`add-btn-${tipo}`);
        if (addBtn) {
            addBtn.onclick = () => {
                const input = document.getElementById(`nueva-opcion-${tipo}`);
                if (!input) return;
                const val = input.value.trim();
                if (!val) { this.showToast('info','Introduce texto para añadir', 4000); return; }
                const up = val.toUpperCase();
                if (!Array.isArray(this.opciones[tipo])) this.opciones[tipo] = [];
                if (this.opciones[tipo].includes(up)) { this.showToast('info','La opción ya existe', 4000); input.value=''; return; }
                this.opciones[tipo].push(up);
                this.saveData();
                this.openManageModal(tipo);
                this.showToast('success','Opción añadida', 4000);
            };
        }
    },

    addOrUpdateAviso() {
        const form = document.getElementById('aviso-form');
        const editId = form.dataset.editId || '';
        const numeroAviso = document.getElementById('numeroAviso').value.trim();
        const fechaAviso = document.getElementById('fechaAviso').value;
        const aseguradora = document.getElementById('aseguradora').value;
        const marca = document.getElementById('marca').value;
        const tipoAparato = document.getElementById('tipoAparato').value;
        const manoObra = parseFloat(document.getElementById('manoObra').value) || 0;
        const desplazamientoKm = parseFloat(document.getElementById('desplazamientoKm').value) || 0;
        const importeDesplazamiento = parseFloat((desplazamientoKm * 0.30).toFixed(2));
        const codigoRecambio = document.getElementById('codigoRecambio').value;
        const importeRecambios = parseFloat(document.getElementById('importeRecambios').value) || 0;

        if (!numeroAviso) { this.showToast('info','Introduce número de aviso', 4000); return; }

        if (!editId && this.avisos.some(a=>a.numeroAviso === numeroAviso)) { this.showToast('danger','Número de aviso duplicado', 4000); return; }

        if (editId) {
            const idx = this.avisos.findIndex(a=>String(a.id)===String(editId));
            if (idx===-1) { this.showToast('danger','Aviso no encontrado para actualizar', 4000); return; }
            // Preserve cerrado / seleccionado states
            const preserved = { cerrado: this.avisos[idx].cerrado || false, seleccionado: this.avisos[idx].seleccionado || false };
            this.avisos[idx] = { ...this.avisos[idx], numeroAviso, fechaAviso, aseguradora, marca, tipoAparato, manoObra, desplazamientoKm, importeDesplazamiento, codigoRecambio, importeRecambios, ...preserved };
            delete form.dataset.editId;
            document.getElementById('guardar-aviso-btn').textContent = 'Guardar Aviso';
            this.showToast('info','Aviso actualizado', 4000);
        } else {
            const nuevo = { id: Date.now(), numeroAviso, fechaAviso, aseguradora, marca, tipoAparato, manoObra, desplazamientoKm, importeDesplazamiento, codigoRecambio, importeRecambios, seleccionado:false, cerrado:false };
            this.avisos.push(nuevo);
            this.showToast('success','Aviso registrado', 4000);
        }
        this.saveData();
        this.displayAvisos();
        this.populateFilterOptions();
        form.reset();
    },

    toggleCerrado(id) {
        const idx = this.avisos.findIndex(a => String(a.id) === String(id));
        if (idx === -1) return;
        this.avisos[idx].cerrado = !this.avisos[idx].cerrado;
        // If marking as abierto, also unselect for facturación
        if (!this.avisos[idx].cerrado) this.avisos[idx].seleccionado = false;
        this.saveData();
        this.displayAvisos();
    },

    deleteAviso(id) {
        if (!confirm('¿Estás seguro de eliminar este aviso?')) return;
        const idx = this.avisos.findIndex(a => String(a.id)===String(id));
        if (idx === -1) return;
        const removed = this.avisos.splice(idx,1);
        this.saveData();
        this.displayAvisos();
        this.updateFacturaPreview();
        this.showToast('danger', `Aviso ${removed[0].numeroAviso} eliminado`, 4000);
    },

    editAviso(id) {
        const avis = this.avisos.find(a => String(a.id) === String(id));
        if (!avis) return;
        // Fill form and set editId (do NOT remove from array)
        document.getElementById('numeroAviso').value = avis.numeroAviso;
        document.getElementById('fechaAviso').value = avis.fechaAviso;
        document.getElementById('aseguradora').value = avis.aseguradora;
        document.getElementById('marca').value = avis.marca;
        document.getElementById('tipoAparato').value = avis.tipoAparato;
        document.getElementById('manoObra').value = avis.manoObra;
        document.getElementById('desplazamientoKm').value = avis.desplazamientoKm;
        document.getElementById('codigoRecambio').value = avis.codigoRecambio;
        document.getElementById('importeRecambios').value = avis.importeRecambios;

        document.getElementById('aviso-form').dataset.editId = id;
        document.getElementById('guardar-aviso-btn').textContent = 'Actualizar Aviso';
        document.getElementById('aviso-form-section').scrollIntoView({ behavior: 'smooth' });
        this.showToast('info','Editando aviso (actualiza y guarda)', 4000);
    },

    displayAvisos() {
        const container = document.getElementById('avisos-list');
        container.innerHTML = '';
        const query = (document.getElementById('buscadorAvisos').value || '').trim().toLowerCase();
        const filtroAseg = document.getElementById('filtroAseguradora').value;
        const filtroAno = document.getElementById('filtroAno').value;
        const filtroMes = document.getElementById('filtroMes').value;

        const filtered = this.avisos.filter(av => {
            const dt = av.fechaAviso ? new Date(av.fechaAviso + 'T00:00:00') : null;
            const year = dt ? String(dt.getFullYear()) : '';
            const month = dt ? String(dt.getMonth() + 1) : '';
            let matchQuery = true;
            if (query) {
                const hay = `${av.numeroAviso} ${av.aseguradora} ${av.marca} ${av.tipoAparato} ${year}`.toLowerCase();
                matchQuery = hay.includes(query);
            }
            const matchAseg = filtroAseg ? av.aseguradora === filtroAseg : true;
            const matchYear = filtroAno ? year === filtroAno : true;
            const matchMonth = filtroMes ? month === filtroMes : true;
            return matchQuery && matchAseg && matchYear && matchMonth;
        });

        if (!filtered.length) { container.innerHTML = '<p class="no-avisos">No hay avisos para los filtros/búsqueda.</p>'; this.updateFacturaPreview(); return; }

        filtered.forEach(av => {
            const subtotal = (av.manoObra || 0) + (av.importeDesplazamiento || 0) + (av.importeRecambios || 0);
            const base75 = parseFloat((subtotal * 0.75).toFixed(2));
            const base25 = parseFloat((subtotal * 0.25).toFixed(2));

            const div = document.createElement('div'); div.className = 'aviso-item';
            div.innerHTML = `
                <div class="aviso-left">
                    <input type="checkbox" class="aviso-checkbox" data-id="${av.id}" ${av.seleccionado ? 'checked' : ''} ${av.cerrado ? '' : 'disabled'}>
                    <div style="display:inline-block; margin-left:8px;">
                        <strong>Nº Aviso:</strong> ${av.numeroAviso}<br>
                        <small><strong>Fecha:</strong> ${av.fechaAviso || ''} — <strong>Aseg:</strong> ${av.aseguradora || ''} — <strong>Marca:</strong> ${av.marca || ''}</small><br>
                        <small><strong>Tipo:</strong> ${av.tipoAparato || ''}</small><br>
                        <small><strong>Subtotal:</strong> <span class="importe-principal">${subtotal.toFixed(2)}€</span> | <strong>75%:</strong> <span class="importe-secundario">${base75.toFixed(2)}€</span> | <strong>25%:</strong> <span class="importe-destacado">${base25.toFixed(2)}€</span></small>
                    </div>
                </div>
                <div style="display:flex; gap:8px; align-items:center;">
                    <div class="cerrado-toggle ${av.cerrado ? 'cerrado' : 'abierto'}" data-id="${av.id}" title="${av.cerrado ? 'Aviso cerrado' : 'Aviso abierto'}">
                        ${av.cerrado ? 'CERRADO' : 'ABIERTO'}
                    </div>
                    <div class="aviso-actions">
                        <button class="edit-btn-small" data-id="${av.id}">Editar</button>
                        <button class="delete-btn-small" data-id="${av.id}">Eliminar</button>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });

        // event handlers for edit/delete
        container.querySelectorAll('.edit-btn-small').forEach(b => {
            b.onclick = () => this.editAviso(b.dataset.id);
        });
        container.querySelectorAll('.delete-btn-small').forEach(b => {
            b.onclick = () => this.deleteAviso(b.dataset.id);
        });

        // handlers for cerrar toggle
        container.querySelectorAll('.cerrado-toggle').forEach(el => {
            el.onclick = () => this.toggleCerrado(el.dataset.id);
        });

        this.updateFacturaPreview();
    },

    bulkSelect(mode) {
        // Only select/deselect closed avisos
        if (mode === 'all') {
            this.avisos.forEach(av => { if (av.cerrado) av.seleccionado = true; });
            this.showToast('success','Avisos cerrados seleccionados', 4000);
        } else if (mode === 'none') {
            this.avisos.forEach(av => av.seleccionado = false);
            this.showToast('info','Selección eliminada', 3000);
        }
        this.saveData();
        this.displayAvisos();
    },

    openSelectionModal(mode) {
        this.selectionMode = mode;
        const modal = document.getElementById('select-modal');
        const title = document.getElementById('select-modal-title');
        const body = document.getElementById('select-modal-body');
        title.textContent = mode === 'month' ? 'Seleccionar meses' : mode === 'week' ? 'Seleccionar semanas' : 'Seleccionar años';
        body.innerHTML = '';

        if (mode === 'month') {
            const years = [...new Set(this.avisos.map(a => a.fechaAviso ? new Date(a.fechaAviso + 'T00:00:00').getFullYear() : null).filter(Boolean))].sort((a,b)=>b-a);
            const ySel = document.createElement('select'); ySel.id = 'sel-month-year';
            if (years.length) {
                years.forEach(y=> { const o = document.createElement('option'); o.value = y; o.textContent = y; ySel.appendChild(o); });
            } else {
                ySel.innerHTML = '<option value="">(sin años)</option>';
            }
            const monthsHtml = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
                .map((m,i)=>`<label style="display:inline-block; margin:6px;"><input type="checkbox" data-month="${i+1}"> ${m}</label>`).join('');
            body.innerHTML = `<div style="text-align:center; margin-bottom:8px;"><strong>Año:</strong> </div><div style="text-align:center; margin-bottom:10px;">${ySel.outerHTML}</div><div style="display:flex; flex-wrap:wrap; justify-content:center; gap:6px;">${monthsHtml}</div>`;
        } else if (mode === 'year') {
            const years = [...new Set(this.avisos.map(a => a.fechaAviso ? new Date(a.fechaAviso + 'T00:00:00').getFullYear() : null).filter(Boolean))].sort((a,b)=>b-a);
            if (!years.length) body.innerHTML = '<p style="text-align:center;">No hay años disponibles en los avisos.</p>';
            else {
                body.innerHTML = years.map(y=>`<label style="display:block; text-align:center; margin:6px;"><input type="checkbox" data-year="${y}"> ${y}</label>`).join('');
            }
        } else if (mode === 'week') {
            const weeksMap = {};
            this.avisos.forEach(av => {
                if (!av.fechaAviso) return;
                const dt = new Date(av.fechaAviso + 'T00:00:00');
                const iso = getISOWeekInfo(dt);
                const key = `${iso.year}-W${String(iso.week).padStart(2,'0')}`;
                if (!weeksMap[key]) weeksMap[key] = { start: iso.start, end: iso.end, count: 0 };
                weeksMap[key].count++;
            });
            const entries = Object.keys(weeksMap).sort().reverse();
            if (!entries.length) body.innerHTML = '<p style="text-align:center;">No hay semanas disponibles en los avisos.</p>';
            else {
                body.innerHTML = entries.map(k=>{
                    const w = weeksMap[k];
                    const label = `${k} (${formatDate(w.start)} → ${formatDate(w.end)}) - ${w.count} aviso(s)`;
                    return `<label style="display:block; margin:6px;"><input type="checkbox" data-week="${k}"> ${label}</label>`;
                }).join('');
            }
        }

        modal.style.display = 'block';
    },
    closeSelectionModal() {
        document.getElementById('select-modal').style.display = 'none';
    },
    applySelectionFromModal() {
        const mode = this.selectionMode;
        if (!mode) return;
        const body = document.getElementById('select-modal-body');
        const checkboxes = body.querySelectorAll('input[type="checkbox"]');
        const selected = Array.from(checkboxes).filter(cb => cb.checked);

        if (!selected.length) { this.showToast('info','No se seleccionó nada', 4000); return; }

        if (mode === 'month') {
            const yearSel = document.getElementById('sel-month-year');
            const year = yearSel ? yearSel.value : null;
            const months = selected.map(cb => parseInt(cb.dataset.month,10));
            this.avisos.forEach(av => {
                if (!av.fechaAviso) return;
                const dt = new Date(av.fechaAviso + 'T00:00:00');
                const y = dt.getFullYear();
                const m = dt.getMonth() + 1;
                if ((!year || String(y) === String(year)) && months.includes(m)) {
                    if (av.cerrado) av.seleccionado = true;
                }
            });
        } else if (mode === 'year') {
            const years = selected.map(cb => parseInt(cb.dataset.year,10));
            this.avisos.forEach(av => {
                if (!av.fechaAviso) return;
                const y = new Date(av.fechaAviso + 'T00:00:00').getFullYear();
                if (years.includes(y) && av.cerrado) av.seleccionado = true;
            });
        } else if (mode === 'week') {
            const weeks = selected.map(cb => cb.dataset.week);
            this.avisos.forEach(av => {
                if (!av.fechaAviso) return;
                const dt = new Date(av.fechaAviso + 'T00:00:00');
                const iso = getISOWeekInfo(dt);
                const key = `${iso.year}-W${String(iso.week).padStart(2,'0')}`;
                if (weeks.includes(key) && av.cerrado) av.seleccionado = true;
            });
        }

        this.saveData();
        this.displayAvisos();
        this.updateFacturaPreview();
        this.closeSelectionModal();
        this.showToast('success','Selección aplicada (solo cerrados)', 4000);
    },

    updateFacturaPreview() {
        const preview = document.getElementById('factura-preview');
        const generarBtn = document.getElementById('generar-factura-pdf');
        const seleccionados = this.avisos.filter(a => a.seleccionado);
        if (!seleccionados.length) { preview.innerHTML = '<p class="no-seleccion">No hay avisos seleccionados para facturar.</p>'; generarBtn.disabled = true; return; }

        // calculos con 75/25
        let baseTotal = 0;      // suma de subtotales (100%)
        let base75Total = 0;    // suma de 75%
        let base25Total = 0;    // suma de 25%

        seleccionados.forEach(av => {
            const subtotal = (av.manoObra || 0) + (av.importeDesplazamiento || 0) + (av.importeRecambios || 0);
            baseTotal += subtotal;
            base75Total += subtotal * 0.75;
            base25Total += subtotal * 0.25;
        });

        baseTotal = parseFloat(baseTotal.toFixed(2));
        base75Total = parseFloat(base75Total.toFixed(2));
        base25Total = parseFloat(base25Total.toFixed(2));

        const retencion = parseFloat((base75Total * 0.15).toFixed(2)); // 15% sobre 75%
        const iva = parseFloat((base75Total * 0.21).toFixed(2)); // 21% sobre 75%
        // total de factura: base75 + iva - retencion + base25 -> corresponde al total facturado al cliente
        const totalFactura = parseFloat((base75Total + iva - retencion + base25Total).toFixed(2));

        preview.innerHTML = `
            <p>Avisos seleccionados: <strong>${seleccionados.length}</strong></p>
            <p>Base Imponible: <span class="importe-principal">${base75Total.toFixed(2)}€</span></p>
            <p>Base total (100%): <span class="importe-secundario">${baseTotal.toFixed(2)}€</span></p>
            <p>Retención (15%): <span class="importe-destacado">-${retencion.toFixed(2)}€</span></p>
            <p>IVA (21%): <span class="importe-secundario">${iva.toFixed(2)}€</span></p>
            <p><strong>Total:</strong> <span class="importe-destacado">${totalFactura.toFixed(2)}€</span></p>
            <hr>
            <h5>Detalle de avisos</h5>
            <ul>
                ${seleccionados.map(av=>{
                    const subtotal = ((av.manoObra||0)+(av.importeDesplazamiento||0)+(av.importeRecambios||0)).toFixed(2);
                    const b75 = (parseFloat(subtotal) * 0.75).toFixed(2);
                    return `<li>Nº ${av.numeroAviso} — ${av.fechaAviso || ''} — Subtotal ${subtotal}€ — 75%: ${b75}€</li>`;
                }).join('')}
            </ul>
        `;
        generarBtn.disabled = false;
    },

    generarFacturaPDF() {
        const seleccionados = this.avisos.filter(a => a.seleccionado);
        if (!seleccionados.length) { this.showToast('info','No hay avisos seleccionados', 4000); return; }

        // double-check: todos seleccionados deben estar cerrados
        const abiertos = seleccionados.filter(s => !s.cerrado);
        if (abiertos.length) {
            this.showToast('danger','Hay avisos seleccionados que no están cerrados. No se puede facturar.', 4000);
            return;
        }

        if (!window.jspdf) {
            alert("La librería PDF no está cargada. Recarga la página.");
            return;
        }

        this.ultimoNumeroFactura++;
        let defaultNum = `FAC-${String(this.ultimoNumeroFactura).padStart(4,'0')}`;
        let num = prompt('Introduce número de factura:', defaultNum);
        if (num === null) { this.ultimoNumeroFactura--; return; }

        // cálculos (75/25)
        let baseTotal = 0, base75Total = 0, base25Total = 0;
        const seleccionadosOrdenados = [...seleccionados].sort((a,b) => new Date(a.fechaAviso) - new Date(b.fechaAviso));
        seleccionadosOrdenados.forEach(av => {
            const subtotal = (av.manoObra || 0) + (av.importeDesplazamiento || 0) + (av.importeRecambios || 0);
            baseTotal += subtotal;
            base75Total += subtotal * 0.75;
            base25Total += subtotal * 0.25;
        });
        baseTotal = parseFloat(baseTotal.toFixed(2));
        base75Total = parseFloat(base75Total.toFixed(2));
        base25Total = parseFloat(base25Total.toFixed(2));
        const retencion = parseFloat((base75Total * 0.15).toFixed(2));
        const iva = parseFloat((base75Total * 0.21).toFixed(2));
        const totalFactura = parseFloat((base75Total + iva - retencion + base25Total).toFixed(2));

        const em = this.datosFacturacion.emisor;
        const rec = this.datosFacturacion.receptor;
        const fechaActual = formatDate(new Date());

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

            const pageW = doc.internal.pageSize.width;
            const left = 40, right = pageW - 40;

            // Cabecera
            doc.setFontSize(18); doc.setFont(undefined, 'bold');
            doc.text('FACTURA', pageW / 2, 40, { align:'center' });

            doc.setFontSize(10); doc.setFont(undefined, 'normal');
            doc.text(`Nº Factura: ${num}`, left, 80);
            doc.text(`Fecha: ${fechaActual}`, left, 98);

            // Emisor y Receptor (PDF)
            doc.setFont(undefined, 'bold');
            doc.text('EMISOR', left, 124); doc.text('RECEPTOR', left + 300, 124);
            doc.setFont(undefined, 'normal'); doc.setFontSize(10);
            doc.text([em.nombre, em.direccion, em.localidad, `DNI: ${em.dni}`, `Telf: ${em.telf}`], left, 142);
            doc.text([rec.nombre, rec.direccion, rec.localidad, `CIF: ${rec.cif}`, `Telf: ${rec.telf}`], left + 300, 142);

            // Tabla con anchos cuidados
            let y = 240; // espacio extra antes de primera línea (solicitado)

            doc.setFont(undefined, 'bold');
            doc.setFillColor(245,245,245);
            doc.rect(left, y - 18, right - left, 18, 'F');
            doc.text('Aviso', left + 8, y);
            doc.text('Fecha', left + 110, y);
            doc.text('Aseguradora', left + 170, y);
            doc.text('Detalle Conceptos', left + 300, y);
            doc.text('Base', right - 8, y, { align: 'right' }); // etiqueta simplificada: "Base"
            y += 10;
            doc.setFont(undefined, 'normal');

            seleccionadosOrdenados.forEach(av => {
                if (y > doc.internal.pageSize.height - 120) { doc.addPage(); y = 80; }
                const subtotal = (av.manoObra || 0) + (av.importeDesplazamiento || 0) + (av.importeRecambios || 0);
                const b75 = parseFloat((subtotal * 0.75).toFixed(2));

                const numAvisoTxt = doc.splitTextToSize(av.numeroAviso || '', 80);
                const asegTxt = doc.splitTextToSize(av.aseguradora || '', 120);
                const conceptoTxt = doc.splitTextToSize(`M.O: ${av.manoObra.toFixed(2)}€ | Desp: ${av.importeDesplazamiento.toFixed(2)}€ | Rec: ${av.importeRecambios.toFixed(2)}€`, 200);

                doc.text(numAvisoTxt, left + 8, y);
                doc.text(av.fechaAviso || '', left + 110, y);
                doc.text(asegTxt, left + 170, y);
                doc.text(conceptoTxt, left + 300, y);
                doc.text(`${b75.toFixed(2)}€`, right - 8, y, { align: 'right' });

                const lines = Math.max(numAvisoTxt.length, asegTxt.length, conceptoTxt.length);
                y += (lines * 12) + 8;
            });

            // Totales (ordenado según petición)
            if (y > doc.internal.pageSize.height - 140) { doc.addPage(); y = 80; }
            y += 6;
            doc.setFont(undefined, 'bold'); doc.setFontSize(11);
            const xFact = right - 260;

            doc.text(`Base imponible:`, xFact, y); doc.text(`${base75Total.toFixed(2)}€`, right - 8, y, { align:'right' }); y += 16;
            doc.text(`Retención (15%):`, xFact, y); doc.text(`-${retencion.toFixed(2)}€`, right - 8, y, { align:'right' }); y += 16;
            doc.text(`IVA (21%):`, xFact, y); doc.text(`${iva.toFixed(2)}€`, right - 8, y, { align:'right' }); y += 20;

            doc.setFontSize(13);
            doc.text(`TOTAL:`, xFact, y); doc.text(`${totalFactura.toFixed(2)}€`, right - 8, y, { align:'right' });

            // NO incluimos el desglose de reparto (solicitado eliminar)

            doc.save(`Factura_Nando_${num}.pdf`);
            this.saveData();
            this.showToast('success','PDF descargado correctamente', 4000);
        } catch (err) {
            console.error(err);
            alert("Error crítico al generar el PDF.");
        }
    },

    showToast(type = 'info', message = '', duration = 4000) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        t.textContent = message;
        container.appendChild(t);
        // for CSS animation
        requestAnimationFrame(() => t.classList.add('show'));
        // remove after duration: fade out then remove
        setTimeout(() => {
            t.classList.remove('show');
            // wait for transition then remove
            setTimeout(() => { if (t && t.parentNode) t.parentNode.removeChild(t); }, 300);
        }, duration);
    }
};

function formatDate(d) {
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2,'0')}-${String(dt.getMonth()+1).padStart(2,'0')}-${dt.getFullYear()}`;
}

/* util: ISO week info (start date, end date, week number, year) */
function getISOWeekInfo(date){
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
    // compute start/end
    const start = new Date(d);
    start.setUTCDate(start.getUTCDate() - (start.getUTCDay() || 7) + 1);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 6);
    return { year: d.getUTCFullYear(), week: weekNo, start: start, end: end };
}

document.addEventListener('DOMContentLoaded', () => app.init());