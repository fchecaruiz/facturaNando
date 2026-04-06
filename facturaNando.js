const app = {
    avisos: [],
    opciones: {
        aseguradora: [
            "SEJESCAR", "MESOS GESTION", "CATALANA OCCIDENTE", 
            "SARETEKNIKA", "SIGMA REPARACIONES", "CORBERO", 
            "HISENSE", "SVAN", "ASPES", "HIUNDAY"
        ],
        marca: [
            "CORBERO", "HISENSE", "SVAN", "ASPES", "HIUNDAY"
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
    
    init: function() {
        this.loadData();
        this.loadOpciones();
        this.setupEventListeners();
        this.displayAvisos();
        this.populateFilterOptions();
        this.loadDatosFacturacion();
        this.populateSelects();
    },

    loadData: function() {
        const storedAvisos = localStorage.getItem('facturaNandoAvisos');
        if (storedAvisos) {
            this.avisos = JSON.parse(storedAvisos);
        }
        const storedUltimoNumero = localStorage.getItem('ultimoNumeroFactura');
        if (storedUltimoNumero) {
            this.ultimoNumeroFactura = parseInt(storedUltimoNumero, 10) || 0;
        }
    },

    loadOpciones: function() {
        const storedOpciones = localStorage.getItem('facturaNandoOpciones');
        if (storedOpciones) {
            this.opciones = JSON.parse(storedOpciones);
        }
    },

    saveData: function() {
        localStorage.setItem('facturaNandoAvisos', JSON.stringify(this.avisos));
        localStorage.setItem('facturaNandoOpciones', JSON.stringify(this.opciones));
        localStorage.setItem('ultimoNumeroFactura', this.ultimoNumeroFactura.toString());
    },

    loadDatosFacturacion: function() {
        const storedEmisor = localStorage.getItem('datosEmisor');
        const storedReceptor = localStorage.getItem('datosReceptor');

        if (storedEmisor) {
            this.datosFacturacion.emisor = JSON.parse(storedEmisor);
        }
        if (storedReceptor) {
            this.datosFacturacion.receptor = JSON.parse(storedReceptor);
        }

        // Cargar en el formulario
        document.getElementById('emisorNombre').value = this.datosFacturacion.emisor.nombre;
        document.getElementById('emisorDireccion').value = this.datosFacturacion.emisor.direccion;
        document.getElementById('emisorLocalidad').value = this.datosFacturacion.emisor.localidad;
        document.getElementById('emisorDni').value = this.datosFacturacion.emisor.dni;
        document.getElementById('emisorTelf').value = this.datosFacturacion.emisor.telf;
        document.getElementById('emisorEmail').value = this.datosFacturacion.emisor.email;
        document.getElementById('emisorCuenta').value = this.datosFacturacion.emisor.cuenta;
        document.getElementById('emisorBanco').value = this.datosFacturacion.emisor.banco;

        document.getElementById('receptorNombre').value = this.datosFacturacion.receptor.nombre;
        document.getElementById('receptorDireccion').value = this.datosFacturacion.receptor.direccion;
        document.getElementById('receptorLocalidad').value = this.datosFacturacion.receptor.localidad;
        document.getElementById('receptorCif').value = this.datosFacturacion.receptor.cif;
        document.getElementById('receptorEmail').value = this.datosFacturacion.receptor.email;
        document.getElementById('receptorTelf').value = this.datosFacturacion.receptor.telf;
    },

    guardarDatosFacturacion: function() {
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
        this.showToast('Datos guardados correctamente');
    },

    setupEventListeners: function() {
        document.getElementById('aviso-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addAviso();
        });

        document.getElementById('filtroAseguradora').addEventListener('change', () => this.displayAvisos());
        document.getElementById('filtroAno').addEventListener('change', () => this.displayAvisos());
        document.getElementById('filtroMes').addEventListener('change', () => this.displayAvisos());
    
        document.getElementById('avisos-list').addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.classList.contains('aviso-checkbox')) {
                const avisoId = parseInt(e.target.dataset.id);
                const aviso = this.avisos.find(a => a.id === avisoId);
                if (aviso) {
                    aviso.seleccionado = e.target.checked;
                    this.updateFacturaPreview();
                }
            }
        });

        document.getElementById('generar-factura-pdf').addEventListener('click', () => {
            this.generarFacturaPDF();
        });

        // Modal close button
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('manage-modal').style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            const modal = document.getElementById('manage-modal');
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    },

    populateSelects: function() {
        this.populateSelect('aseguradora');
        this.populateSelect('marca');
        this.populateSelect('tipoAparato');
        this.populateFilterOptions();
    },

    populateSelect: function(selectId) {
        const selectElement = document.getElementById(selectId);
        if (!selectElement) return;
        
        // Guardar valor actual
        const currentValue = selectElement.value;
        
        // Limpiar opciones
        selectElement.innerHTML = '<option value="">Selecciona ' + 
            (selectId === 'aseguradora' ? 'Aseguradora' : 
             selectId === 'marca' ? 'Marca' : 'Tipo de Aparato') + '</option>';
        
        // Añadir opciones
        this.opciones[selectId].forEach(option => {
            const newOption = document.createElement('option');
            newOption.value = option;
            newOption.textContent = option;
            selectElement.appendChild(newOption);
        });
        
        // Restaurar valor si existe
        if (currentValue && this.opciones[selectId].includes(currentValue)) {
            selectElement.value = currentValue;
        }
    },

    openManageModal: function(tipo) {
        const modal = document.getElementById('manage-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        modalTitle.textContent = `Gestionar ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
        
        let content = '<div class="option-list">';
        this.opciones[tipo].forEach((opcion, index) => {
            content += `
                <div class="option-item">
                    <span>${opcion}</span>
                    <div>
                        <button class="edit-btn" onclick="app.editOption(\'${tipo}\', ${index})">Editar</button>
                        <button class="delete-btn" onclick="app.deleteOption(\'${tipo}\', ${index})">Eliminar</button>
                    </div>
                </div>
            `;
        });
        content += '</div>';
        
        content += `
            <div class="add-option-form">
                <input type="text" id="nueva-opcion-${tipo}" placeholder="Añadir nueva opción">
                <button onclick="app.addOption(\'${tipo}\')">Añadir</button>
            </div>
        `;
        
        modalBody.innerHTML = content;
        modal.style.display = 'block';
    },

    addOption: function(tipo) {
        const input = document.getElementById(`nueva-opcion-${tipo}`);
        const newValue = input.value.trim().toUpperCase();
        
        if (newValue && !this.opciones[tipo].includes(newValue)) {
            this.opciones[tipo].push(newValue);
            this.saveData();
            this.populateSelects();
            input.value = '';
            this.openManageModal(tipo); // Recargar modal
        }
    },

    editOption: function(tipo, index) {
        const oldValue = this.opciones[tipo][index];
        const newValue = prompt('Editar opción:', oldValue);
        
        if (newValue !== null && newValue.trim() !== '' && newValue.trim().toUpperCase() !== oldValue) {
            const trimmedNewValue = newValue.trim().toUpperCase();
            if (!this.opciones[tipo].includes(trimmedNewValue)) {
                this.opciones[tipo][index] = trimmedNewValue;
                this.saveData();
                this.populateSelects();
                this.openManageModal(tipo); // Recargar modal
            }
        }
    },

    deleteOption: function(tipo, index) {
        if (confirm('¿Estás seguro de eliminar esta opción?')) {
            this.opciones[tipo].splice(index, 1);
            this.saveData();
            this.populateSelects();
            this.openManageModal(tipo); // Recargar modal
        }
    },

    addAviso: function() {
        const numeroAviso = document.getElementById('numeroAviso').value.trim();

        if (this.avisos.some(aviso => aviso.numeroAviso === numeroAviso)) {
            this.showToast('Número de aviso duplicado');
            return;
        }

        const fechaAviso = document.getElementById('fechaAviso').value;
        const aseguradora = document.getElementById('aseguradora').value;
        const marca = document.getElementById('marca').value;
        const tipoAparato = document.getElementById('tipoAparato').value;
        const manoObra = parseFloat(document.getElementById('manoObra').value) || 0;
        const desplazamientoKm = parseFloat(document.getElementById('desplazamientoKm').value) || 0;
        const importeDesplazamiento = desplazamientoKm * 0.30; // Precio fijo por km
        const codigoRecambio = document.getElementById('codigoRecambio').value;
        const importeRecambios = parseFloat(document.getElementById('importeRecambios').value) || 0;

        const nuevoAviso = {
            id: Date.now(),
            numeroAviso,
            fechaAviso,
            aseguradora,
            marca,
            tipoAparato,
            manoObra,
            desplazamientoKm,
            importeDesplazamiento: parseFloat(importeDesplazamiento.toFixed(2)),
            codigoRecambio,
            importeRecambios,
            seleccionado: false
        };

        this.avisos.push(nuevoAviso);
        this.saveData();
        this.showToast('Aviso registrado');
        document.getElementById('aviso-form').reset();
        this.displayAvisos();
        this.populateFilterOptions();
    },

    deleteAviso: function(id) {
        if (confirm('¿Estás seguro de eliminar este aviso?')) {
            this.avisos = this.avisos.filter(aviso => aviso.id !== id);
            this.saveData();
            this.displayAvisos();
            this.updateFacturaPreview();
        }
    },

    editAviso: function(id) {
        const aviso = this.avisos.find(a => a.id === id);
        if (!aviso) return;

        // Rellenar formulario con datos del aviso
        document.getElementById('numeroAviso').value = aviso.numeroAviso;
        document.getElementById('fechaAviso').value = aviso.fechaAviso;
        document.getElementById('aseguradora').value = aviso.aseguradora;
        document.getElementById('marca').value = aviso.marca;
        document.getElementById('tipoAparato').value = aviso.tipoAparato;
        document.getElementById('manoObra').value = aviso.manoObra;
        document.getElementById('desplazamientoKm').value = aviso.desplazamientoKm;
        document.getElementById('codigoRecambio').value = aviso.codigoRecambio;
        document.getElementById('importeRecambios').value = aviso.importeRecambios;

        // Eliminar aviso actual
        this.avisos = this.avisos.filter(a => a.id !== id);
        this.saveData();
        this.displayAvisos();
        this.updateFacturaPreview();

        // Scroll al formulario
        document.getElementById('aviso-form-section').scrollIntoView({ behavior: 'smooth' });
        
        // Cambiar texto del botón
        document.getElementById('guardar-aviso-btn').textContent = 'Actualizar Aviso';
        
        // Añadir identificador temporal
        document.getElementById('aviso-form').dataset.editId = id;
    },

    displayAvisos: function() {
        const avisosListDiv = document.getElementById('avisos-list');
        avisosListDiv.innerHTML = '';

        const filtroAseguradora = document.getElementById('filtroAseguradora').value;
        const filtroAno = document.getElementById('filtroAno').value;
        const filtroMes = document.getElementById('filtroMes').value;

        const filteredAvisos = this.avisos.filter(aviso => {
            const avisoDate = new Date(aviso.fechaAviso + 'T00:00:00');
            const year = avisoDate.getFullYear().toString();
            const month = (avisoDate.getMonth() + 1).toString();

            const matchAseguradora = filtroAseguradora ? aviso.aseguradora === filtroAseguradora : true;
            const matchAno = filtroAno ? year === filtroAno : true;
            const matchMes = filtroMes ? month === filtroMes : true;
            
            return matchAseguradora && matchAno && matchMes;
        });

        if (filteredAvisos.length === 0) {
            avisosListDiv.innerHTML = '<p class="no-avisos">No hay avisos para los filtros seleccionados.</p>';
            this.updateFacturaPreview();
            return;
        }

        filteredAvisos.forEach(aviso => {
            const avisoDiv = document.createElement('div');
            avisoDiv.classList.add('aviso-item');
            const checked = aviso.seleccionado ? 'checked' : '';
            avisoDiv.innerHTML = `
                <div>
                    <input type="checkbox" class="aviso-checkbox" data-id="${aviso.id}" ${checked}>
                    <strong>Nº Aviso:</strong> ${aviso.numeroAviso}<br>
                    <strong>Fecha:</strong> ${aviso.fechaAviso}<br>
                    <strong>Aseguradora:</strong> ${aviso.aseguradora}<br>
                    <strong>Marca:</strong> ${aviso.marca}<br>
                    <strong>Tipo Aparato:</strong> ${aviso.tipoAparato}<br>
                    <strong>M. Obra:</strong> <span class="importe-principal">${aviso.manoObra.toFixed(2)}€</span> | 
                    <strong>Desplazamiento:</strong> ${aviso.desplazamientoKm.toFixed(1)} km (<span class="importe-secundario">${aviso.importeDesplazamiento.toFixed(2)}€</span>) |
                    <strong>Recambios:</strong> <span class="importe-principal">${aviso.importeRecambios.toFixed(2)}€</span> (Cód: ${aviso.codigoRecambio || 'N/A'})
                </div>
                <div class="aviso-actions">
                    <button class="edit-btn-small" onclick="app.editAviso(${aviso.id})">Editar</button>
                    <button class="delete-btn-small" onclick="app.deleteAviso(${aviso.id})">Eliminar</button>
                </div>
            `;
            avisosListDiv.appendChild(avisoDiv);
        });

        this.updateFacturaPreview();
    },

    populateFilterOptions: function() {
        const filtroAseguradoraSelect = document.getElementById('filtroAseguradora');
        const filtroAnoSelect = document.getElementById('filtroAno');

        // Aseguradoras
        filtroAseguradoraSelect.innerHTML = '<option value="">Todas</option>';
        this.opciones.aseguradora.forEach(aseg => {
            const option = document.createElement('option');
            option.value = aseg;
            option.textContent = aseg;
            filtroAseguradoraSelect.appendChild(option);
        });

        // Años
        const anos = [...new Set(this.avisos.map(aviso => new Date(aviso.fechaAviso + 'T00:00:00').getFullYear()))];
        filtroAnoSelect.innerHTML = '<option value="">Todos</option>';
        anos.sort((a, b) => b - a).forEach(ano => {
            const option = document.createElement('option');
            option.value = ano;
            option.textContent = ano;
            filtroAnoSelect.appendChild(option);
        });
    },

    updateFacturaPreview: function() {
        const facturaPreviewDiv = document.getElementById('factura-preview');
        const avisosSeleccionados = this.avisos.filter(aviso => aviso.seleccionado);
        const generarPdfBtn = document.getElementById('generar-factura-pdf');

        if (avisosSeleccionados.length === 0) {
            facturaPreviewDiv.innerHTML = '<p class="no-seleccion">No hay avisos seleccionados para facturar.</p>';
            generarPdfBtn.disabled = true;
            return;
        }

        let baseImponibleTotal = 0;
        avisosSeleccionados.forEach(aviso => {
            baseImponibleTotal += aviso.manoObra + aviso.importeDesplazamiento + aviso.importeRecambios;
        });

        const ivaPorcentaje = 0.21;
        const retencionPorcentaje = 0.15;

        const ivaTotal = baseImponibleTotal * ivaPorcentaje;
        const retencionTotal = baseImponibleTotal * retencionPorcentaje;
        const totalFactura = baseImponibleTotal + ivaTotal - retencionTotal;

        // Distribución entre socios
        const tuParteBase = baseImponibleTotal * 0.75;
        const carlosParteBase = baseImponibleTotal * 0.25;
        const tuParteConIva = tuParteBase + (tuParteBase * ivaPorcentaje);

        facturaPreviewDiv.innerHTML = `
            <h4>Resumen de Factura (<span class="importe-destacado">${avisosSeleccionados.length}</span> aviso(s) seleccionado(s))</h4>
            <p><strong>Base Imponible Total:</strong> <span class="importe-principal">${baseImponibleTotal.toFixed(2)}€</span></p>
            <p><strong>IVA (21%):</strong> <span class="importe-secundario">${ivaTotal.toFixed(2)}€</span></p>
            <p><strong>Retención (15%):</strong> <span class="importe-destacado">-${retencionTotal.toFixed(2)}€</span></p>
            <p><strong>Total Factura:</strong> <span class="importe-destacado">${totalFactura.toFixed(2)}€</span></p>
            <hr>
            <h4>Distribución de Beneficios:</h4>
            <p><strong>Tu Parte (75% Base + IVA sobre tu parte):</strong> <span class="importe-principal">${tuParteConIva.toFixed(2)}€</span></p>
            <p><strong>Parte de Carlos (25% Base):</strong> <span class="importe-secundario">${carlosParteBase.toFixed(2)}€</span></p>
            <hr>
            <h5>Detalle de Avisos:</h5>
            <ul>
                ${avisosSeleccionados.map(aviso => `
                    <li>
                        <strong>Nº Aviso:</strong> ${aviso.numeroAviso} - 
                        <strong>Fecha:</strong> ${aviso.fechaAviso} - 
                        <strong>Aseguradora:</strong> ${aviso.aseguradora} - 
                        <strong>Importe Base:</strong> <span class="importe-principal">${(aviso.manoObra + aviso.importeDesplazamiento + aviso.importeRecambios).toFixed(2)}€</span>
                    </li>
                `).join('')}
            </ul>
        `;
        generarPdfBtn.disabled = false;
    },

    generarFacturaPDF: function() {
        const self = this;
        const avisosSeleccionados = this.avisos.filter(aviso => aviso.seleccionado);
        if (avisosSeleccionados.length === 0) {
            this.showToast('No hay avisos seleccionados');
            return;
        }

        // Incrementar número de factura
        this.ultimoNumeroFactura++;
        const numeroFactura = `FAC-${this.ultimoNumeroFactura.toString().padStart(4, '0')}`;
        this.saveData(); // Guardar el nuevo número

        // Solicitar número de factura editable
        const numeroFacturaFinal = prompt('Introduce el número de factura (editable):', numeroFactura);
        if (numeroFacturaFinal === null) {
            // Usuario canceló
            this.ultimoNumeroFactura--; // Revertir incremento
            this.saveData();
            return;
        }

        // Preparar datos
        let baseImponibleTotal = 0;
        const filas = avisosSeleccionados.map(aviso => {
            const subtotal = aviso.manoObra + aviso.importeDesplazamiento + aviso.importeRecambios;
            baseImponibleTotal += subtotal;
            return {
                numero: aviso.numeroAviso,
                fecha: aviso.fechaAviso,
                aseguradora: aviso.aseguradora,
                concepto: `M.O: ${aviso.manoObra.toFixed(2)}€, Desp: ${aviso.importeDesplazamiento.toFixed(2)}€, Rec: ${aviso.importeRecambios.toFixed(2)}€`,
                subtotal: subtotal.toFixed(2)
            };
        });

        const ivaPorcentaje = 0.21;
        const retencionPorcentaje = 0.15;
        const ivaTotal = baseImponibleTotal * ivaPorcentaje;
        const retencionTotal = baseImponibleTotal * retencionPorcentaje;
        const totalFactura = baseImponibleTotal + ivaTotal - retencionTotal;
        const tuParteBase = baseImponibleTotal * 0.75;
        const carlosParteBase = baseImponibleTotal * 0.25;
        const tuParteConIva = tuParteBase + (tuParteBase * ivaPorcentaje);

        const emisor = this.datosFacturacion.emisor;
        const receptor = this.datosFacturacion.receptor;
        const fechaActual = new Date().toISOString().split('T')[0];

        // HTML fallback (impresión) por si falla la carga de jsPDF
        const htmlContent = `
            <!doctype html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Factura_${numeroFacturaFinal}_${fechaActual}</title>
                <style>
                    body { font-family: Arial, sans-serif; color: #222; padding: 20px; }
                    h1 { text-align: center; }
                    .cols { display:flex; gap:20px; margin-top:20px; }
                    .col { flex:1; }
                    table { width:100%; border-collapse:collapse; margin-top:20px; }
                    th, td { border:1px solid #ccc; padding:6px; text-align:left; }
                    .summary { margin-top:20px; float:right; width:40%; }
                </style>
            </head>
            <body>
                <h1>FACTURA - facturaNando</h1>
                <p><strong>Número de factura:</strong> ${numeroFacturaFinal} | <strong>Fecha:</strong> ${fechaActual}</p>
                <div class="cols">
                    <div class="col">
                        <h3>EMISOR</h3>
                        <div>${emisor.nombre}</div>
                        <div>${emisor.direccion}</div>
                        <div>${emisor.localidad}</div>
                        <div>DNI: ${emisor.dni}</div>
                        <div>TEL: ${emisor.telf}</div>
                        <div>Email: ${emisor.email}</div>
                        <div>Cuenta: ${emisor.cuenta}</div>
                        <div>Banco: ${emisor.banco}</div>
                    </div>
                    <div class="col">
                        <h3>RECEPTOR</h3>
                        <div>${receptor.nombre}</div>
                        <div>${receptor.direccion}</div>
                        <div>${receptor.localidad}</div>
                        <div>CIF: ${receptor.cif}</div>
                        <div>Email: ${receptor.email}</div>
                        <div>TEL: ${receptor.telf}</div>
                    </div>
                </div>

                <h3>Detalle de servicios</h3>
                <table>
                    <thead>
                        <tr><th>Nº Aviso</th><th>Fecha</th><th>Aseguradora</th><th>Concepto</th><th>Importe Base (€)</th></tr>
                    </thead>
                    <tbody>
                        ${filas.map(f => `<tr><td>${f.numero}</td><td>${f.fecha}</td><td>${f.aseguradora}</td><td>${f.concepto}</td><td style="text-align:right">${f.subtotal}€</td></tr>`).join('')}
                    </tbody>
                </table>

                <div class="summary">
                    <table>
                        <tr><td><strong>Base Imponible:</strong></td><td style="text-align:right">${baseImponibleTotal.toFixed(2)}€</td></tr>
                        <tr><td><strong>IVA (21%):</strong></td><td style="text-align:right">${ivaTotal.toFixed(2)}€</td></tr>
                        <tr><td><strong>Retención (15%):</strong></td><td style="text-align:right">-${retencionTotal.toFixed(2)}€</td></tr>
                        <tr><td><strong>TOTAL FACTURA:</strong></td><td style="text-align:right"><strong>${totalFactura.toFixed(2)}€</strong></td></tr>
                    </table>
                </div>
            </body>
            </html>
        `;

        // Helper para cargar script con timeout
        function loadScriptWithTimeout(src, timeout = 8000) {
            return new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = src;
                s.async = true;
                let timedOut = false;
                const to = setTimeout(() => {
                    timedOut = true;
                    s.onerror = s.onload = null;
                    reject(new Error('timeout'));
                }, timeout);
                s.onload = () => {
                    if (timedOut) return;
                    clearTimeout(to);
                    resolve();
                };
                s.onerror = () => {
                    if (timedOut) return;
                    clearTimeout(to);
                    reject(new Error('error loading ' + src));
                };
                document.head.appendChild(s);
            });
        }

        // Intentar cargar jsPDF desde varios CDNs secuencialmente
        const cdns = [
            'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
            'https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
        ];

        (async () => {
            let loaded = false;
            for (let i = 0; i < cdns.length && !loaded; i++) {
                try {
                    await loadScriptWithTimeout(cdns[i], 7000);
                    // Verificar presencia
                    if (window.jspdf && (window.jspdf.jsPDF || window.jspdf)) {
                        loaded = true;
                        break;
                    }
                } catch (err) {
                    // siguiente CDN
                }
            }

            if (!loaded) {
                // Fallback: abrir nueva ventana imprimible (el usuario puede "Guardar como PDF" desde la impresión)
                const w = window.open('', '_blank');
                if (!w) {
                    self.showToast('No se pudo abrir la ventana de impresión. Permite popups o usa otro navegador.');
                    return;
                }
                w.document.open();
                w.document.write(htmlContent);
                w.document.close();
                // Esperar un momento a que cargue y lanzar print
                w.focus();
                setTimeout(() => {
                    try {
                        w.print();
                    } catch (e) {
                        // Si falla print, dejar contenido y mensaje
                    }
                }, 800);
                self.showToast('No se pudo generar PDF automáticamente. Se ha abierto una vista imprimible; utiliza "Guardar como PDF" en la impresión.');
                return;
            }

            // Si llegamos aquí, jsPDF está disponible
            try {
                const jsPDF = (window.jspdf && (window.jspdf.jsPDF || window.jspdf)) ? (window.jspdf.jsPDF || window.jspdf) : null;
                if (!jsPDF) throw new Error('jsPDF no encontrado');

                const doc = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                // Layout básico y seguro usando la API de texto (sin dependencias externas)
                const leftMargin = 14;
                const rightLimit = 196; // 210 - 14
                let y = 15;

                doc.setFontSize(18);
                doc.text('FACTURA', 105, y, { align: 'center' });
                y += 8;
                doc.setFontSize(10);
                doc.text(`Número de factura: ${numeroFacturaFinal} | Fecha: ${fechaActual}`, leftMargin, y);
                y += 8;

                // Emisor y Receptor en columnas
                const colGap = 8;
                const colWidth = (rightLimit - leftMargin - colGap) / 2;
                const xLeft = leftMargin;
                const xRight = leftMargin + colWidth + colGap;

                doc.setFontSize(11);
                doc.setFont(undefined, 'bold');
                doc.text('EMISOR:', xLeft, y);
                doc.text('RECEPTOR:', xRight, y);
                doc.setFont(undefined, 'normal');
                y += 6;

                const emLines = [
                    emisor.nombre, emisor.direccion, emisor.localidad,
                    `DNI: ${emisor.dni}`, `TEL: ${emisor.telf}`, `Email: ${emisor.email}`, `Cuenta: ${emisor.cuenta}`, `Banco: ${emisor.banco}`
                ];
                const reLines = [
                    receptor.nombre, receptor.direccion, receptor.localidad,
                    `CIF: ${receptor.cif}`, `Email: ${receptor.email}`, `TEL: ${receptor.telf}`
                ];

                const lineHeight = 6;
                for (let i = 0; i < Math.max(emLines.length, reLines.length); i++) {
                    if (emLines[i]) {
                        const emSplit = doc.splitTextToSize(emLines[i], colWidth);
                        doc.text(emSplit, xLeft, y);
                    }
                    if (reLines[i]) {
                        const reSplit = doc.splitTextToSize(reLines[i], colWidth);
                        doc.text(reSplit, xRight, y);
                    }
                    y += lineHeight;
                }

                y += 4;

                // Encabezado tabla
                doc.setFont(undefined, 'bold');
                const headers = ['Nº Aviso', 'Fecha', 'Aseguradora', 'Concepto', 'Imp. Base'];
                const colWidths = [24, 26, 46, 70, 22]; // suma aprox 188mm (ajustado a márgenes)
                const colX = [leftMargin];
                for (let i = 1; i < colWidths.length; i++) {
                    colX[i] = colX[i - 1] + colWidths[i - 1];
                }

                // Dibujar headers
                doc.setFontSize(10);
                for (let i = 0; i < headers.length; i++) {
                    doc.text(headers[i], colX[i] + 1, y);
                }
                y += 6;
                doc.setFont(undefined, 'normal');

                // Filas
                for (let r = 0; r < filas.length; r++) {
                    const row = filas[r];
                    // Si nos acercamos al final de la página, crear nueva
                    if (y > 270) {
                        doc.addPage();
                        y = 20;
                    }
                    // Nº Aviso
                    doc.text(String(row.numero), colX[0] + 1, y);
                    doc.text(String(row.fecha), colX[1] + 1, y);
                    // Aseguradora (dividir si largo)
                    const asegLines = doc.splitTextToSize(row.aseguradora || '-', colWidths[2] - 2);
                    doc.text(asegLines, colX[2] + 1, y);
                    // Concepto (puede ocupar varias líneas)
                    const conceptoLines = doc.splitTextToSize(row.concepto, colWidths[3] - 2);
                    doc.text(conceptoLines, colX[3] + 1, y);
                    // Importe alineado derecha en su columna
                    const importeText = `${row.subtotal}€`;
                    const importeX = colX[4] + colWidths[4] - 2;
                    doc.text(importeText, importeX, y, { align: 'right' });

                    // Avanzar y tomar en cuenta el mayor número de líneas (aseg + concepto)
                    const maxLines = Math.max(1, asegLines.length, conceptoLines.length);
                    y += maxLines * lineHeight;
                }

                // Resumen (al final derecha)
                if (y > 220) {
                    doc.addPage();
                    y = 20;
                }
                y += 6;
                const resumenX = rightLimit - 80;
                doc.setFont(undefined, 'bold');
                doc.text('Resumen:', resumenX, y);
                doc.setFont(undefined, 'normal');
                y += 6;
                doc.text(`Base Imponible: ${baseImponibleTotal.toFixed(2)}€`, resumenX, y);
                y += 6;
                doc.text(`IVA (21%): ${ivaTotal.toFixed(2)}€`, resumenX, y);
                y += 6;
                doc.text(`Retención (15%): -${retencionTotal.toFixed(2)}€`, resumenX, y);
                y += 6;
                doc.setFont(undefined, 'bold');
                doc.text(`TOTAL FACTURA: ${totalFactura.toFixed(2)}€`, resumenX, y);

                // Guardar PDF
                doc.save(`factura_${numeroFacturaFinal}_${fechaActual}.pdf`);
                // (intencionadamente no mostramos toast de éxito para evitar mensajes que pediste eliminar)
            } catch (err) {
                console.error('Error generando PDF con jsPDF:', err);
                self.showToast('Error al generar PDF automáticamente. Se abrirá una vista imprimible como alternativa.');
                // abrir fallback imprimible
                const w = window.open('', '_blank');
                if (w) {
                    w.document.open();
                    w.document.write(htmlContent);
                    w.document.close();
                    setTimeout(() => { try { w.print(); } catch(e) {} }, 700);
                }
            }
        })();
    },

    showToast: function(message) {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.classList.add('toast');
        toast.textContent = message;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    }
};

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});