import { useState, useEffect } from 'react'

function App() {
  const [busqueda, setBusqueda] = useState('');
  const [fechaFiltro, setFechaFiltro] = useState('');
  
  const [pestanaActiva, setPestanaActiva] = useState('Envios');
  const [tiempoActual, setTiempoActual] = useState(new Date());
  const [formularioAbierto, setFormularioAbierto] = useState(false);

  // --- BASE DE DATOS DE USUARIOS ---
  const [usuarios] = useState([
    { usuario: 'BRANDO CM', clave: 'industriasozul123', nombre: 'Brando CM (Administrador)', rol: 'ADMIN' },
    { usuario: 'VENTAS', clave: 'ozul2026', nombre: 'ventas general', rol: 'VENTAS' },
    { usuario: 'DESPACHO', clave: 'despacho', nombre: 'Encargado de Almacén', rol: 'LOGISTICA' }
  ]);
  
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [inputUsuario, setInputUsuario] = useState('');
  const [inputClave, setInputClave] = useState('');

  // --- MONITOREO DE INTERNET EN TIEMPO REAL ---
  useEffect(() => {
    const temporizador = setInterval(() => setTiempoActual(new Date()), 10000);
    return () => clearInterval(temporizador);
  }, []);

  // --- BASE DE DATOS DE ENVÍOS PENDIENTES ---
  const [enviosPendientes, setEnviosPendientes] = useState([
    { 
      id: 'ENV-2026-0001', 
      cliente: 'PRUEBA', 
      celular: '987654321',
      ubicacion: 'LIMA / CALLAO',
      agencia: 'AGENCIA SHALOM',
      dni: '20615073360',
      guiaRemision: 'GR-001-004322',
      fechaIngreso: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
      observaciones: 'Llevar kits antiderrames completos para el sector de hidrocarburos.',
      fotosIngreso: [],
      registradoPor: 'Tania Ramos' 
    }
  ]);

  const [entregasRealizadas, setEntregasRealizadas] = useState([
    {
      id: 'ENV-2026-0000',
      cliente: 'DP WORLD LOGISTICS',
      celular: '955123456',
      ubicacion: 'AV. NESTOR GAMBETTA KM 3.5, CALLAO',
      agencia: 'MARVISUR',
      dni: '20504334455',
      guiaRemision: 'GR-001-004323',
      fechaIngreso: new Date().toISOString(),
      fechaEntrega: new Date().toLocaleDateString('es-PE'),
      horaEntrega: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      observacionesFinales: 'Entregado sin novedades en rampa de descarga.',
      fotosIngreso: [],
      fotosDespacho: [],
      registradoPor: 'Brando CM (Administrador)',
      despachadoPor: 'Encargado de Almacén'
    }
  ]);

  // Campos del Formulario
  const [cliente, setCliente] = useState('');
  const [celular, setCellular] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [agenciaSeleccionada, setAgenciaSeleccionada] = useState('AGENCIA SHALOM');
  const [agenciaManual, setAgenciaManual] = useState('');
  const [dni, setDni] = useState('');
  const [guiaRemision, setGuiaRemision] = useState('');
  const [observaciones, setObservations] = useState('');
  
  // Estado para las fotos en base64 con previsualización
  const [fotosIngresoForm, setFotosIngresoForm] = useState([]); 

  const [pedidoADespachar, setPedidoADespachar] = useState(null);
  const [notaClaveDespacho, setNotaClaveDespacho] = useState('');
  const [fotosDespachoForm, setFotosDespachoForm] = useState([]);

  // Lógica para procesar las imágenes subidas
  const handleSubirFotos = (e, tipo) => {
    const archivos = Array.from(e.target.files);
    archivos.forEach(archivo => {
      const lector = new FileReader();
      lector.onloadend = () => {
        if (tipo === 'ingreso') {
          setFotosIngresoForm(prev => [...prev, lector.result]);
        } else {
          setFotosDespachoForm(prev => [...prev, lector.result]);
        }
      };
      lector.readAsDataURL(archivo);
    });
  };

  // Lógica para eliminar una foto si se equivocan
  const handleEliminarFoto = (index, tipo) => {
    if (tipo === 'ingreso') {
      setFotosIngresoForm(prev => prev.filter((_, i) => i !== index));
    } else {
      setFotosDespachoForm(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const cuentaEncontrada = usuarios.find(
      (u) => u.usuario.toUpperCase() === inputUsuario.trim().toUpperCase() && u.clave === inputClave
    );
    if (cuentaEncontrada) {
      setUsuarioLogueado(cuentaEncontrada);
    } else {
      alert('❌ Usuario o Contraseña incorrectos.');
    }
  };

  const handleAggregateEnvio = (e) => {
    e.preventDefault();
    const agenciaFinal = agenciaSeleccionada === 'MANUAL' ? agenciaManual.trim().toUpperCase() : agenciaSeleccionada;
    const correlativo = enviosPendientes.length + entregasRealizadas.length + 1;
    
    const nuevoEnvio = {
      id: `ENV-2026-000${correlativo}`,
      cliente: cliente.trim().toUpperCase(),
      celular: celular.trim(),
      ubicacion: ubicacion.trim().toUpperCase(),
      agencia: agenciaFinal,
      dni: dni.trim(),
      guiaRemision: guiaRemision.trim().toUpperCase(),
      fechaIngreso: new Date().toISOString(),
      observaciones: observaciones.trim() || 'Sin observaciones.',
      fotosIngreso: fotosIngresoForm,
      registradoPor: usuarioLogueado.nombre 
    };

    setEnviosPendientes([nuevoEnvio, ...enviosPendientes]);
    setCliente(''); setCellular(''); setUbicacion(''); setDni(''); setGuiaRemision('');
    setObservations(''); setFotosIngresoForm([]); setFormularioAbierto(false);
  };

  const handleConfirmarDespacho = (e) => {
    e.preventDefault();
    const ahora = new Date();
    setEntregasRealizadas([{
      ...pedidoADespachar,
      fechaEntrega: ahora.toLocaleDateString('es-PE'),
      horaEntrega: ahora.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      observacionesFinales: notaClaveDespacho.trim() || "Despachado correctamente.",
      fotosDespacho: fotosDespachoForm,
      despachadoPor: usuarioLogueado.nombre 
    }, ...entregasRealizadas]);

    setEnviosPendientes(enviosPendientes.filter(e => e.id !== pedidoADespachar.id));
    setPedidoADespachar(null);
    setNotaClaveDespacho('');
    setFotosDespachoForm([]);
  };

  // --- DISEÑO INTERFAZ DE LOGIN REPARADA ---
  if (!usuarioLogueado) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#111827', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ width: '100%', maxWidth: '380px', backgroundColor: '#1f2937', padding: '30px 24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', textAlign: 'center' }}>
          <h2 style={{ color: '#ffffff', margin: '0 0 6px 0', fontSize: '24px', letterSpacing: '0.5px' }}>Industrias Ozul</h2>
          <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 28px 0' }}>Control Interno de Despachos</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
            <div>
              <label style={{ color: '#e5e7eb', fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '8px' }}>NOMBRE DE USUARIO</label>
              {/* Se forzó background blanco y letras oscuras para eliminar la apariencia negra */}
              <input type="text" value={inputUsuario} onChange={(e) => setInputUsuario(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #4b5563', backgroundColor: '#ffffff', color: '#111827', fontSize: '16px', fontWeight: '500', boxSizing: 'border-box' }} placeholder="Ej: NOMBRE" required />
            </div>
            <div>
              <label style={{ color: '#e5e7eb', fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '8px' }}>CONTRASEÑA</label>
              <input type="password" value={inputClave} onChange={(e) => setInputClave(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #4b5563', backgroundColor: '#ffffff', color: '#111827', fontSize: '16px', boxSizing: 'border-box' }} placeholder="••••••••" required />
            </div>
            <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '8px', backgroundColor: '#0284c7', color: '#fff', border: 'none', fontWeight: '700', fontSize: '16px', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 12px rgba(2,132,199,0.3)' }}>Ingresar al Sistema</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '30px' }}>
      
      {/* HEADER PRINCIPAL MÓVIL */}
      <header style={{ backgroundColor: '#111827', color: '#fff', padding: '14px 16px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '16px', fontWeight: '800', color: '#38bdf8', letterSpacing: '0.5px' }}>OZUL LOGÍSTICA</span>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>👤 {usuarioLogueado.nombre}</div>
          </div>
          <button onClick={() => setUsuarioLogueado(null)} style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>Salir</button>
        </div>
        
        {/* NAVEGACIÓN EN BOTONES AMPLIOS PARA EL DEDO */}
        <nav style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'Envios', label: '📥 Registrar e Inspeccionar', visible: true },
            { id: 'Depositos', label: '📦 Historial Completo', visible: true }
          ].map((item) => item.visible && (
            <button
              key={item.id}
              onClick={() => { setPestanaActiva(item.id); setPedidoADespachar(null); }}
              style={{
                flex: 1, padding: '10px 6px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase',
                backgroundColor: pestanaActiva === item.id ? '#0284c7' : '#1f2937', color: '#fff', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {/* CONTENEDOR DE CONTENIDO */}
      <main style={{ padding: '12px', maxWidth: '480px', margin: '0 auto' }}>
        
        {/* INTERFAZ DE MONITOREO */}


        {/* PESTAÑA PRINCIPAL: REGISTROS E INSPECCIÓN */}
        {pestanaActiva === 'Envios' && !pedidoADespachar && (
          <div>
            {/* COMPONENTE COLAPSABLE CON DISEÑO BLANCO TOTALMENTE ENCUADRADO */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', boxShadow: '0 3px 10px rgba(0,0,0,0.06)', border: '1px solid #d1d5db' }}>
              <button 
                onClick={() => setFormularioAbierto(!formularioAbierto)}
                style={{ width: '100%', padding: '14px', backgroundColor: '#1f2937', color: '#fff', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
              >
                <span>{formularioAbierto ? '🔽 MINIMIZAR REGISTRO' : '📝 REGISTRAR DATOS DE DESPACHO'}</span>
                <span style={{ fontSize: '11px', backgroundColor: '#0284c7', padding: '3px 8px', borderRadius: '5px' }}>{formularioAbierto ? 'CERRAR' : 'ABRIR'}</span>
              </button>

              {formularioAbierto && (
                <form onSubmit={handleAggregateEnvio} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#ffffff' }}>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>CLIENTE / RAZÓN SOCIAL *</label>
                    <input type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #9ca3af', backgroundColor: '#ffffff', color: '#111827', fontSize: '14px', boxSizing: 'border-box' }} required />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>CELULAR *</label>
                      <input type="tel" value={celular} onChange={(e) => setCellular(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #9ca3af', backgroundColor: '#ffffff', color: '#111827', fontSize: '14px', boxSizing: 'border-box' }} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>RUC / DNI *</label>
                      <input type="text" value={dni} onChange={(e) => setDni(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #9ca3af', backgroundColor: '#ffffff', color: '#111827', fontSize: '14px', boxSizing: 'border-box' }} required />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>N° GUÍA DE REMISIÓN *</label>
                      <input type="text" value={guiaRemision} onChange={(e) => setGuiaRemision(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #9ca3af', backgroundColor: '#ffffff', color: '#111827', fontSize: '14px', boxSizing: 'border-box' }} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>AGENCIA</label>
                      <select value={agenciaSeleccionada} onChange={(e) => setAgenciaSeleccionada(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #9ca3af', backgroundColor: '#ffffff', color: '#111827', fontSize: '14px', boxSizing: 'border-box', height: '42px' }}>
                        <option value="AGENCIA SHALOM">AGENCIA SHALOM</option>
                        <option value="MARVISUR">MARVISUR</option>
                        <option value="FLORES">FLORES CHAN CHAN</option>
                        <option value="MANUAL">✏️ OTRA AGENCIA</option>
                      </select>
                    </div>
                  </div>

                  {agenciaSeleccionada === 'MANUAL' && (
                    <input type="text" placeholder="Escribe el nombre de la empresa de transporte" value={agenciaManual} onChange={(e) => setAgenciaManual(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #9ca3af', backgroundColor: '#ffffff', color: '#111827', fontSize: '14px', boxSizing: 'border-box' }} />
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>DESTINO / UBICACIÓN COMPLETA *</label>
                    <input type="text" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #9ca3af', backgroundColor: '#ffffff', color: '#111827', fontSize: '14px', boxSizing: 'border-box' }} required />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>OBSERVACIONES INTERNAS</label>
                    <textarea value={observaciones} onChange={(e) => setObservations(e.target.value)} rows="2" style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #9ca3af', backgroundColor: '#ffffff', color: '#111827', fontSize: '14px', boxSizing: 'border-box', resize: 'none' }} placeholder="Detalles de embalaje, bultos, etc." />
                  </div>

                  {/* NUEVA SECCIÓN: SUBIDA DE IMÁGENES CON ELIMINACIÓN INDIVIDUAL */}
                  <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px dashed #9ca3af' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>📸 ADJUNTAR FOTOGRAFÍAS DEL PAQUETE</label>
                    <input type="file" accept="image/*" multiple onChange={(e) => handleSubirFotos(e, 'ingreso')} style={{ fontSize: '13px', width: '100%' }} />
                    
                    {fotosIngresoForm.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                        {fotosIngresoForm.map((foto, index) => (
                          <div key={index} style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                            <img src={foto} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button type="button" onClick={() => handleEliminarFoto(index, 'ingreso')} style={{ position: 'absolute', top: '2px', right: '2px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>X</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button type="submit" style={{ width: '100%', padding: '13px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', marginTop: '4px' }}>
                    📥 Guardar Envio en Sistema
                  </button>
                </form>
              )}
            </div>

            {/* TARJETAS DE ALMACÉN EN TIEMPO REAL */}
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#4b5563', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>📦 Envíos en Espera de Salida</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {enviosPendientes.map((item, idx) => {
                const inicio = new Date(item.fechaIngreso);
                const dias = Math.floor((tiempoActual - inicio) / (1000 * 60 * 60 * 24));
                return (
                  <div key={idx} style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #d1d5db', borderLeft: dias >= 3 ? '6px solid #ef4444' : '6px solid #0284c7', boxShadow: '0 2px 5px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '800', fontSize: '11px', color: '#9ca3af' }}>{item.id}</span>
                      <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '5px', fontWeight: '700', backgroundColor: dias >= 3 ? '#fee2e2' : '#e0f2fe', color: dias >= 3 ? '#ef4444' : '#0369a1' }}>
                        {dias === 0 ? 'INGRESÓ HOY' : `HACE ${dias} DÍAS`}
                      </span>
                    </div>

                    <div style={{ fontSize: '17px', fontWeight: '800', color: '#111827', marginBottom: '6px' }}>{item.cliente}</div>
                    <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5', marginBottom: '10px' }}>
                      📍 <b>Destino:</b> {item.ubicacion} <br/>
                      🚚 <b>Agencia:</b> {item.agencia} <br/>
                      📑 <b>Guía N°:</b> {item.guiaRemision} <br/>
                      👤 <b>Vendedor:</b> {item.registradoPor}
                    </div>

                    {item.fotosIngreso && item.fotosIngreso.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                        {item.fotosIngreso.map((img, i) => (
                          <img key={i} src={img} alt="evidencia" style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        ))}
                      </div>
                    )}

                    <button onClick={() => setPedidoADespachar(item)} style={{ width: '100%', padding: '11px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                      🚚 Despachar / Confirmar Salida
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODAL / FORMULARIO DE CONFIRMACIÓN DE DESPACHO */}
        {pedidoADespachar && (
          <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
            <h3 style={{ color: '#10b981', margin: '0 0 12px 0', fontSize: '16px', fontWeight: '800' }}>Confirmar Salida: {pedidoADespachar.id}</h3>
            
            <form onSubmit={handleConfirmarDespacho} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>OBSERVACIONES DE LA AGENCIA / CLAVE DE RETIRO</label>
                <input type="text" value={notaClaveDespacho} onChange={(e) => setNotaClaveDespacho(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #9ca3af', backgroundColor: '#fff', color: '#111827', boxSizing: 'border-box' }} placeholder="Ej: Clave 4422 - Conductor Carlos" required />
              </div>

              <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px dashed #9ca3af' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>📸 FOTO DE GUÍA SELLADA / VOUCHER</label>
                <input type="file" accept="image/*" multiple onChange={(e) => handleSubirFotos(e, 'despacho')} style={{ fontSize: '13px' }} />
                
                {fotosDespachoForm.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {fotosDespachoForm.map((foto, index) => (
                      <div key={index} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden' }}>
                        <img src={foto} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={() => handleEliminarFoto(index, 'despacho')} style={{ position: 'absolute', top: '1px', right: '1px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>X</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button type="submit" style={{ flex: 2, padding: '12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '14px' }}>Finalizar Despacho</button>
                <button type="button" onClick={() => setPedidoADespachar(null)} style={{ flex: 1, padding: '12px', backgroundColor: '#6b7280', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '14px' }}>Volver</button>
              </div>
            </form>
          </div>
        )}

        {/* PESTAÑA: HISTORIAL DE ENTREGAS (MUESTRA TODA LA INFORMACIÓN REQUERIDA) */}
        {pestanaActiva === 'Depositos' && (
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#4b5563', marginBottom: '12px', textTransform: 'uppercase' }}>✅ Historial Completo de Cargas</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {entregasRealizadas.map((item, idx) => (
                <div key={idx} style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #d1d5db', borderLeft: '6px solid #10b981', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280', marginBottom: '6px', fontWeight: '600' }}>
                    <span>CÓDIGO: {item.id}</span>
                    <span>🟢 {item.fechaEntrega} - {item.horaEntrega}</span>
                  </div>
                  
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#111827', marginBottom: '6px' }}>{item.cliente}</div>
                  
                  {/* SECCIÓN EXPANDIDA DE INFORMACIÓN COMPLETA PARA CORROBORACIÓN */}
                  <div style={{ fontSize: '13px', color: '#1f2937', backgroundColor: '#f9fafb', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', lineHeight: '1.6', marginBottom: '8px' }}>
                    🪪 <b>RUC / DNI:</b> {item.dni} <br/>
                    📞 <b>Celular Cliente:</b> {item.celular} <br/>
                    📍 <b>Dirección / Destino:</b> {item.ubicacion} <br/>
                    🚚 <b>Agencia Transporte:</b> {item.agencia} <br/>
                    🧾 <b>Guía de Remisión:</b> {item.guiaRemision}
                  </div>

                  <div style={{ fontSize: '12px', color: '#4b5563', marginBottom: '6px' }}>
                    👤 <b>Vendedor:</b> {item.registradoPor} | 🏭 <b>Despachador:</b> {item.despachadoPor}
                  </div>

                  <div style={{ fontSize: '12px', color: '#065f46', backgroundColor: '#d1fae5', padding: '8px', borderRadius: '6px', fontWeight: '600', fontStyle: 'italic' }}>
                    📝 Observación final: "{item.observacionesFinales}"
                  </div>

                  {/* Fotos del Historial */}
                  {((item.fotosIngreso && item.fotosIngreso.length > 0) || (item.fotosDespacho && item.fotosDespacho.length > 0)) && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                      {item.fotosIngreso?.map((img, i) => <img key={i} src={img} alt="ingreso" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }} />)}
                      {item.fotosDespacho?.map((img, i) => <img key={i} src={img} alt="despacho" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #10b981' }} />)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default App