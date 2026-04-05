'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import type { Product, Catalog, Order, SizeType, SizePreset } from '@/lib/types';
import { formatCOP } from '@/lib/utils';
import styles from './admin.module.css';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<'products' | 'catalogs' | 'orders' | 'sizes'>('products');
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  // Product form
  const [showProdForm, setShowProdForm] = useState(false);
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [prodForm, setProdForm] = useState({ name: '', description: '', price: '', imageUrl: '', catalogId: '', featured: false, stock: '0', sizeType: 'none' as SizeType });
  const [prodError, setProdError] = useState('');
  const [prodSaving, setProdSaving] = useState(false);

  // Size presets management
  const [sizePresets, setSizePresets] = useState<SizePreset[]>([]);
  const [presetsTab, setPresetsTab] = useState<'shoes' | 'curtains'>('shoes');
  const [presetForm, setPresetForm] = useState({ label: '', value: '', order: '99' });
  const [presetSaving, setPresetSaving] = useState(false);

  // Catalog form
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCat, setEditingCat] = useState<Catalog | null>(null);
  const [catForm, setCatForm] = useState({ name: '', description: '', imageUrl: '', order: '1' });
  const [catError, setCatError] = useState('');
  const [catSaving, setCatSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [prods, cats, ords, presets] = await Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/catalogs').then((r) => r.json()),
      fetch('/api/orders').then((r) => r.json()),
      fetch('/api/size-presets').then((r) => r.json()),
    ]);
    setProducts(prods);
    setCatalogs(cats);
    setOrders(ords);
    setSizePresets(presets);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const changeOrderStatus = async (orderId: string, status: Order['status']) => {
    setUpdatingOrder(orderId);
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setUpdatingOrder(null);
    loadData();
  };

  const addSizePreset = async (e: React.FormEvent) => {
    e.preventDefault();
    setPresetSaving(true);
    await fetch('/api/size-presets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sizeType: presetsTab, label: presetForm.label, value: presetForm.value, order: Number(presetForm.order) }),
    });
    setPresetForm({ label: '', value: '', order: '99' });
    setPresetSaving(false);
    loadData();
  };

  const deletePreset = async (id: string) => {
    if (!confirm('¿Eliminar esta talla/medida?')) return;
    await fetch(`/api/size-presets/${id}`, { method: 'DELETE' });
    loadData();
  };

  // ── Product handlers ──
  const openNewProd = () => {
    setEditingProd(null);
    setProdForm({ name: '', description: '', price: '', imageUrl: '', catalogId: catalogs[0]?.id || '', featured: false, stock: '0', sizeType: 'none' });
    setProdError('');
    setShowProdForm(true);
  };

  const openEditProd = (p: Product) => {
    setEditingProd(p);
    setProdForm({ name: p.name, description: p.description, price: String(p.price), imageUrl: p.imageUrl, catalogId: p.catalogId, featured: p.featured, stock: String(p.stock), sizeType: p.sizeType || 'none' });
    setProdError('');
    setShowProdForm(true);
  };

  const saveProd = async (e: React.FormEvent) => {
    e.preventDefault();
    setProdError('');
    if (!prodForm.name || !prodForm.price || !prodForm.catalogId || !prodForm.imageUrl) {
      setProdError('Todos los campos marcados con * son requeridos'); return;
    }
    setProdSaving(true);
    const method = editingProd ? 'PUT' : 'POST';
    const url = editingProd ? `/api/products/${editingProd.id}` : '/api/products';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...prodForm, price: Number(prodForm.price), stock: Number(prodForm.stock), sizeType: prodForm.sizeType, customSizeOptions: [] }) });
    const data = await res.json();
    setProdSaving(false);
    if (!res.ok) { setProdError(data.error); return; }
    setShowProdForm(false);
    loadData();
  };

  const deleteProd = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    loadData();
  };

  // ── Catalog handlers ──
  const openNewCat = () => {
    setEditingCat(null);
    setCatForm({ name: '', description: '', imageUrl: '', order: String(catalogs.length + 1) });
    setCatError('');
    setShowCatForm(true);
  };

  const openEditCat = (c: Catalog) => {
    setEditingCat(c);
    setCatForm({ name: c.name, description: c.description, imageUrl: c.imageUrl, order: String(c.order) });
    setCatError('');
    setShowCatForm(true);
  };

  const saveCat = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError('');
    if (!catForm.name) { setCatError('El nombre es requerido'); return; }
    setCatSaving(true);
    const method = editingCat ? 'PUT' : 'POST';
    const url = editingCat ? `/api/catalogs/${editingCat.id}` : '/api/catalogs';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...catForm, order: Number(catForm.order) }) });
    const data = await res.json();
    setCatSaving(false);
    if (!res.ok) { setCatError(data.error); return; }
    setShowCatForm(false);
    loadData();
  };

  const deleteCat = async (id: string) => {
    if (!confirm('¿Eliminar este catálogo?')) return;
    await fetch(`/api/catalogs/${id}`, { method: 'DELETE' });
    loadData();
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>🏠 Livende</div>
        <p className={styles.sidebarSub}>Panel de Administración</p>
        <nav className={styles.nav}>
          <button className={`${styles.navItem} ${tab === 'products' ? styles.active : ''}`} onClick={() => setTab('products')}>
            📦 Productos <span className={styles.navCount}>{products.length}</span>
          </button>
          <button className={`${styles.navItem} ${tab === 'catalogs' ? styles.active : ''}`} onClick={() => setTab('catalogs')}>
            📂 Catálogos <span className={styles.navCount}>{catalogs.length}</span>
          </button>
          <button className={`${styles.navItem} ${tab === 'orders' ? styles.active : ''}`} onClick={() => setTab('orders')}>
            🧾 Pedidos <span className={styles.navCount}>{orders.length}</span>
          </button>
          <button className={`${styles.navItem} ${tab === 'sizes' ? styles.active : ''}`} onClick={() => setTab('sizes' as 'products')}>
            📏 Tallas/Medidas <span className={styles.navCount}>{sizePresets.length}</span>
          </button>
        </nav>
        <div className={styles.sidebarFooter}>
          <p className={styles.adminInfo}>👤 {user?.name}</p>
          <Link href="/" className={styles.storeLink}>🏪 Ver tienda</Link>
          <button onClick={logout} className={styles.logoutBtn}>Cerrar sesión</button>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        {/* ── Products Tab ── */}
        {tab === 'products' && (
          <div className={styles.tabContent}>
            <div className={styles.tabHeader}>
              <div>
                <h1 className={styles.pageTitle}>Productos</h1>
                <p className={styles.pageSub}>{products.length} productos en la tienda</p>
              </div>
              <button className="btn btn-primary" onClick={openNewProd} id="new-product-button">+ Nuevo Producto</button>
            </div>

            {loading ? (
              <div className={styles.loadingGrid}>
                {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 12 }} />)}
              </div>
            ) : (
              <div className={styles.table}>
                <div className={styles.tableHead}>
                  <span>Producto</span>
                  <span>Catálogo</span>
                  <span>Precio</span>
                  <span>Stock</span>
                  <span style={{ textAlign: 'right' }}>Acciones</span>
                </div>
                {products.map((p) => {
                  const cat = catalogs.find((c) => c.id === p.catalogId);
                  return (
                    <div key={p.id} className={styles.tableRow} id={`admin-prod-${p.id}`}>
                      <div className={styles.prodName}>
                        <div className={styles.prodImg} style={{ backgroundImage: `url(${p.imageUrl})` }} />
                        <div>
                          <p className={styles.prodTitle}>{p.name}</p>
                          {p.featured && <span className="badge badge-primary">Destacado</span>}
                        </div>
                      </div>
                      <span className={styles.colMuted}>{cat?.name || '-'}</span>
                      <span className={styles.colPrice}>{formatCOP(p.price)}</span>
                      <span className={styles.colMuted}>{p.stock}</span>
                      <div className={styles.rowActions}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditProd(p)} id={`edit-prod-${p.id}`}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteProd(p.id)} id={`delete-prod-${p.id}`}>Eliminar</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Catalogs Tab ── */}
        {tab === 'catalogs' && (
          <div className={styles.tabContent}>
            <div className={styles.tabHeader}>
              <div>
                <h1 className={styles.pageTitle}>Catálogos</h1>
                <p className={styles.pageSub}>{catalogs.length} categorías activas</p>
              </div>
              <button className="btn btn-primary" onClick={openNewCat} id="new-catalog-button">+ Nuevo Catálogo</button>
            </div>
            <div className={styles.table}>
              <div className={styles.tableHead}>
                <span>Catálogo</span>
                <span>Slug</span>
                <span>Orden</span>
                <span style={{ textAlign: 'right' }}>Acciones</span>
              </div>
              {catalogs.map((c) => (
                <div key={c.id} className={styles.tableRow} id={`admin-cat-${c.id}`}>
                  <div className={styles.prodName}>
                    <div className={styles.prodImg} style={{ backgroundImage: `url(${c.imageUrl})` }} />
                    <div>
                      <p className={styles.prodTitle}>{c.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{c.description.slice(0, 50)}…</p>
                    </div>
                  </div>
                  <span className={styles.colMuted}>{c.slug}</span>
                  <span className={styles.colMuted}>{c.order}</span>
                  <div className={styles.rowActions}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEditCat(c)} id={`edit-cat-${c.id}`}>Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteCat(c.id)} id={`delete-cat-${c.id}`}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Orders Tab ── */}
        {tab === 'orders' && (
          <div className={styles.tabContent}>
            <div className={styles.tabHeader}>
              <div>
                <h1 className={styles.pageTitle}>Historial de Pedidos</h1>
                <p className={styles.pageSub}>{orders.length} pedidos totales</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={loadData}>🔄 Actualizar</button>
            </div>

            {loading ? (
              <div className={styles.loadingGrid}>
                {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
              </div>
            ) : orders.length === 0 ? (
              <div className={styles.emptyOrders}>
                <span>📭</span>
                <p>No hay pedidos aún. Cuando los clientes hagan pedidos, aparecerán aquí.</p>
              </div>
            ) : (
              <div className={styles.table}>
                <div className={styles.orderHead}>
                  <span>Pedido</span>
                  <span>Cliente</span>
                  <span>Productos</span>
                  <span>Total</span>
                  <span>Estado</span>
                </div>
                {orders.map((order) => (
                  <div key={order.id} className={styles.orderRow} id={`admin-order-${order.id}`}>
                    <div>
                      <span className={styles.prodTitle}>#{order.id.slice(0, 8).toUpperCase()}</span>
                      <span className={styles.colMuted} style={{ fontSize: '0.76rem', display: 'block' }}>
                        {new Date(order.createdAt).toLocaleDateString('es-CO')}
                      </span>
                    </div>
                    <div>
                      <span className={styles.prodTitle}>{order.customerName}</span>
                      <span className={styles.colMuted} style={{ fontSize: '0.76rem', display: 'block' }}>📱 {order.phone}</span>
                      <span className={styles.colMuted} style={{ fontSize: '0.76rem', display: 'block' }}>📍 {order.address}</span>
                    </div>
                    <div className={styles.orderItems}>
                      {order.items.map((item) => (
                        <span key={`${item.productId}::${item.selectedSize}`} className={styles.orderItem}>
                          {item.name} ×{item.quantity}
                          {item.selectedSize && <em style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}> [{item.selectedSize}]</em>}
                        </span>
                      ))}
                    </div>
                    <span className={styles.colPrice}>{formatCOP(order.total)}</span>
                    <div className={styles.statusCell}>
                      <select
                        className={styles.statusSelect}
                        value={order.status}
                        onChange={(e) => changeOrderStatus(order.id, e.target.value as Order['status'])}
                        disabled={updatingOrder === order.id}
                        id={`status-${order.id}`}
                        data-status={order.status}
                      >
                        <option value="pending">⏳ Pendiente</option>
                        <option value="confirmed">✅ Confirmado</option>
                        <option value="shipped">🚚 En camino</option>
                        <option value="delivered">📦 Entregado</option>
                        <option value="cancelled">❌ Cancelado</option>
                      </select>
                      {order.notes && (
                        <span className={styles.orderNote} title={order.notes}>📝 Nota</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Size Presets Tab ── */}
        {(tab as string) === 'sizes' && (
          <div className={styles.tabContent}>
            <div className={styles.tabHeader}>
              <div>
                <h1 className={styles.pageTitle}>Tallas y Medidas</h1>
                <p className={styles.pageSub}>Gestiona las opciones predefinidas para zapatos y cortinas</p>
              </div>
            </div>

            {/* Sub-tabs: Shoes | Curtains */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              <button
                className={`btn ${presetsTab === 'shoes' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setPresetsTab('shoes')}
              >👟 Zapatos</button>
              <button
                className={`btn ${presetsTab === 'curtains' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setPresetsTab('curtains')}
              >📐 Cortinas</button>
            </div>

            {/* Add new preset form */}
            <form onSubmit={addSizePreset} className={styles.presetForm}>
              <div className={styles.presetInputs}>
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">Nombre visible *</label>
                  <input className="form-input" value={presetForm.label}
                    onChange={(e) => setPresetForm({...presetForm, label: e.target.value})}
                    placeholder={presetsTab === 'shoes' ? 'Ej: Talla 38 — Mediano' : 'Ej: Mediano — 2m × 2m'}
                    required id="preset-label" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Valor *</label>
                  <input className="form-input" value={presetForm.value}
                    onChange={(e) => setPresetForm({...presetForm, value: e.target.value})}
                    placeholder={presetsTab === 'shoes' ? 'Ej: 38' : 'Ej: 2x2'}
                    required id="preset-value" />
                </div>
                <div className="form-group" style={{ flex: '0 0 80px' }}>
                  <label className="form-label">Orden</label>
                  <input className="form-input" type="number" value={presetForm.order}
                    onChange={(e) => setPresetForm({...presetForm, order: e.target.value})}
                    min="1" id="preset-order" />
                </div>
                <button type="submit" className="btn btn-primary" disabled={presetSaving} id="add-preset-button" style={{ alignSelf: 'flex-end', marginBottom: 0 }}>
                  {presetSaving ? '…' : '+ Agregar'}
                </button>
              </div>
            </form>

            {/* Presets list */}
            <div className={styles.table}>
              <div className={styles.presetHead}>
                <span>Nombre visible</span>
                <span>Valor</span>
                <span>Orden</span>
                <span style={{ textAlign: 'right' }}>Acciones</span>
              </div>
              {sizePresets
                .filter((p) => p.sizeType === presetsTab)
                .map((preset) => (
                  <div key={preset.id} className={styles.tableRow} id={`preset-${preset.id}`}>
                    <span className={styles.prodTitle}>{preset.label}</span>
                    <span className={styles.colMuted}>{preset.value}</span>
                    <span className={styles.colMuted}>{preset.order}</span>
                    <div className={styles.rowActions}>
                      <button className="btn btn-danger btn-sm" onClick={() => deletePreset(preset.id)} id={`delete-preset-${preset.id}`}>Eliminar</button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Product Form Modal ── */}
      {showProdForm && (
        <>
          <div className="overlay" onClick={() => setShowProdForm(false)} />
          <div className={styles.modal} id="product-form-modal">
            <div className={styles.modalHeader}>
              <h2>{editingProd ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button className={styles.closeBtn} onClick={() => setShowProdForm(false)}>✕</button>
            </div>
            <form onSubmit={saveProd} className={styles.modalForm} noValidate>
              {prodError && <div className="form-error">{prodError}</div>}
              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input className="form-input" value={prodForm.name} onChange={(e) => setProdForm({...prodForm, name: e.target.value})} placeholder="Nombre del producto" id="prod-name" required />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción *</label>
                <textarea className="form-input" value={prodForm.description} onChange={(e) => setProdForm({...prodForm, description: e.target.value})} rows={3} placeholder="Descripción detallada" id="prod-description" />
              </div>
              <div className={styles.formRow}>
                <div className="form-group">
                  <label className="form-label">Precio COP *</label>
                  <input className="form-input" type="number" value={prodForm.price} onChange={(e) => setProdForm({...prodForm, price: e.target.value})} placeholder="150000" min="0" id="prod-price" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock</label>
                  <input className="form-input" type="number" value={prodForm.stock} onChange={(e) => setProdForm({...prodForm, stock: e.target.value})} min="0" id="prod-stock" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">URL Imagen *</label>
                <input className="form-input" value={prodForm.imageUrl} onChange={(e) => setProdForm({...prodForm, imageUrl: e.target.value})} placeholder="https://images.unsplash.com/..." id="prod-image" required />
              </div>
              <div className="form-group">
                <label className="form-label">Catálogo *</label>
                <select className="form-input" value={prodForm.catalogId} onChange={(e) => setProdForm({...prodForm, catalogId: e.target.value})} id="prod-catalog" required>
                  <option value="">Seleccionar catálogo</option>
                  {catalogs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tipo de Talla / Medida</label>
                <select className="form-input" value={prodForm.sizeType} onChange={(e) => setProdForm({...prodForm, sizeType: e.target.value as SizeType})} id="prod-size-type">
                  <option value="none">Sin talla (ej: sábanas, decoración)</option>
                  <option value="shoes">👟 Zapatos / Sandalias (talla de pie)</option>
                  <option value="curtains">📐 Cortinas (medida en metros)</option>
                  <option value="accessories">💍 Accesorios (collares, aretes)</option>
                </select>
                {prodForm.sizeType !== 'none' && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                    {prodForm.sizeType === 'shoes' && '🔎 Las tallas predefinidas se gestionan en la pestaña «Tallas/Medidas»'}
                    {prodForm.sizeType === 'curtains' && '🔎 Las medidas predefinidas se gestionan en la pestaña «Tallas/Medidas»'}
                    {prodForm.sizeType === 'accessories' && '💍 El cliente podrá ingresar su referencia al agregar al carrito'}
                  </p>
                )}
              </div>
              <label className={styles.checkLabel}>
                <input type="checkbox" checked={prodForm.featured} onChange={(e) => setProdForm({...prodForm, featured: e.target.checked})} id="prod-featured" />
                <span>Marcar como destacado</span>
              </label>
              <div className={styles.modalActions}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowProdForm(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={prodSaving} id="save-product-button">
                  {prodSaving ? 'Guardando…' : editingProd ? 'Guardar cambios' : 'Crear producto'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ── Catalog Form Modal ── */}
      {showCatForm && (
        <>
          <div className="overlay" onClick={() => setShowCatForm(false)} />
          <div className={styles.modal} id="catalog-form-modal">
            <div className={styles.modalHeader}>
              <h2>{editingCat ? 'Editar Catálogo' : 'Nuevo Catálogo'}</h2>
              <button className={styles.closeBtn} onClick={() => setShowCatForm(false)}>✕</button>
            </div>
            <form onSubmit={saveCat} className={styles.modalForm} noValidate>
              {catError && <div className="form-error">{catError}</div>}
              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input className="form-input" value={catForm.name} onChange={(e) => setCatForm({...catForm, name: e.target.value})} placeholder="Ej: Ropa de Cama" id="cat-name" required />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <input className="form-input" value={catForm.description} onChange={(e) => setCatForm({...catForm, description: e.target.value})} placeholder="Descripción del catálogo" id="cat-description" />
              </div>
              <div className="form-group">
                <label className="form-label">URL Imagen</label>
                <input className="form-input" value={catForm.imageUrl} onChange={(e) => setCatForm({...catForm, imageUrl: e.target.value})} placeholder="https://..." id="cat-image" />
              </div>
              <div className="form-group">
                <label className="form-label">Orden</label>
                <input className="form-input" type="number" value={catForm.order} onChange={(e) => setCatForm({...catForm, order: e.target.value})} min="1" id="cat-order" />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCatForm(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={catSaving} id="save-catalog-button">
                  {catSaving ? 'Guardando…' : editingCat ? 'Guardar cambios' : 'Crear catálogo'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
