import { useEffect, useMemo, useState } from 'react'
import './App.css'

const money = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 })
const emptyAuth = { name: '', email: '', phone: '', password: '' }
const emptyProduct = { name: '', sku: '', description: '', price: '', stock: '', category: '', brand: '', size: '', material: '', color: '', images: '', isFeatured: false, isActive: true }

function ProductCard({ product, addToCart }) {
  const image = product.images?.[0]
  return <article className="product-card">
    <div className="product-image">{image ? <img src={image} alt={product.name} /> : <span aria-hidden="true">🧸</span>}{product.isFeatured && <b>แนะนำ</b>}</div>
    <div className="product-copy"><small>{product.category?.name || 'ตุ๊กตาน่ารัก'}</small><h3>{product.name}</h3><p>{product.description}</p><div className="product-bottom"><strong>{money.format(product.price)}</strong><button onClick={() => addToCart(product)} disabled={product.stock === 0}>{product.stock === 0 ? 'สินค้าหมด' : 'ใส่ตะกร้า +'}</button></div></div>
  </article>
}

function AdminDashboard({ token, onClose }) {
  const [items, setItems] = useState([]); const [form, setForm] = useState(emptyProduct); const [editing, setEditing] = useState(null); const [message, setMessage] = useState(''); const [uploading, setUploading] = useState(false)
  const load = async () => { const response = await fetch('/api/products'); if (response.ok) setItems(await response.json()) }
  useEffect(() => { load() }, [])
  const change = event => setForm({ ...form, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value })
  async function uploadImage(event) { const image = event.target.files?.[0]; if (!image) return; setUploading(true); setMessage(''); const data = new FormData(); data.append('image', image); try { const response = await fetch('/api/uploads/products', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: data }); const result = await response.json(); if (!response.ok) throw new Error(result.message || 'อัปโหลดรูปไม่สำเร็จ'); setForm(current => ({ ...current, images: current.images ? `${current.images}\n${result.url}` : result.url })); setMessage('อัปโหลดรูปเรียบร้อย'); } catch (error) { setMessage(error.message) } finally { setUploading(false); event.target.value = '' } }
  async function save(event) { event.preventDefault(); setMessage(''); const payload = { ...form, price: Number(form.price), stock: Number(form.stock), images: form.images.split('\n').map(url => url.trim()).filter(Boolean) }; const response = await fetch(editing ? `/api/products/${editing}` : '/api/products', { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) }); const data = await response.json(); if (!response.ok) return setMessage(data.message || 'บันทึกไม่สำเร็จ'); setForm(emptyProduct); setEditing(null); setMessage('บันทึกสินค้าเรียบร้อย'); load() }
  function edit(item) { setEditing(item._id); setForm({ ...emptyProduct, ...item, category: item.category?.name || item.category || '', images: (item.images || []).join('\n') }); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  async function remove(id) { if (!window.confirm('ต้องการลบสินค้านี้ใช่หรือไม่?')) return; const response = await fetch(`/api/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); if (!response.ok) return setMessage('ลบสินค้าไม่สำเร็จ'); setMessage('ลบสินค้าเรียบร้อย'); load() }
  return <main className="admin-page"><header className="admin-header"><div><p className="eyebrow">MIMI ADMIN</p><h1>จัดการสินค้า</h1></div><button onClick={onClose}>← กลับหน้าร้าน</button></header><section className="admin-form"><h2>{editing ? 'แก้ไขตุ๊กตา' : 'เพิ่มตุ๊กตาใหม่'}</h2><form onSubmit={save}><input required name="name" placeholder="ชื่อสินค้า" value={form.name} onChange={change}/><input name="sku" placeholder="SKU" value={form.sku} onChange={change}/><input required type="number" min="0" name="price" placeholder="ราคา" value={form.price} onChange={change}/><input required type="number" min="0" name="stock" placeholder="สต็อก" value={form.stock} onChange={change}/><input required name="category" placeholder="ชื่อหมวดหมู่ เช่น ตุ๊กตาหมี" value={form.category} onChange={change}/><input name="brand" placeholder="แบรนด์" value={form.brand} onChange={change}/><input name="size" placeholder="ขนาด" value={form.size} onChange={change}/><input name="material" placeholder="วัสดุ" value={form.material} onChange={change}/><textarea required name="description" placeholder="รายละเอียด" value={form.description} onChange={change}/><label className="image-upload">อัปโหลดรูปจากเครื่อง<input type="file" accept="image/*" onChange={uploadImage}/><span>{uploading ? 'กำลังอัปโหลด...' : 'เลือกไฟล์รูปภาพ (ไม่เกิน 5 MB)'}</span></label><textarea name="images" placeholder="URL รูปภาพ (หนึ่ง URL ต่อบรรทัด)" value={form.images} onChange={change}/><label><input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={change}/> สินค้าแนะนำ</label><label><input type="checkbox" name="isActive" checked={form.isActive} onChange={change}/> เปิดขาย</label><div><button className="admin-primary" disabled={uploading}>{editing ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}</button>{editing && <button type="button" onClick={() => { setEditing(null); setForm(emptyProduct) }}>ยกเลิก</button>}</div></form>{message && <p className="admin-message">{message}</p>}</section><section className="admin-list"><h2>สินค้าทั้งหมด ({items.length})</h2>{items.map(item => <article key={item._id}><div>{item.images?.[0] ? <img src={item.images[0]} alt=""/> : '🧸'}</div><span><b>{item.name}</b><small>{item.sku || 'ไม่มี SKU'} · {money.format(item.price)} · สต็อก {item.stock}</small></span><em>{item.isActive ? 'เปิดขาย' : 'ปิดขาย'}</em><button onClick={() => edit(item)}>แก้ไข</button><button className="delete" onClick={() => remove(item._id)}>ลบ</button></article>)}</section></main>
}

export default function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด')
  const [account, setAccount] = useState(() => JSON.parse(localStorage.getItem('auth') || 'null'))
  const [authMode, setAuthMode] = useState('login')
  const [auth, setAuth] = useState(emptyAuth)
  const [authError, setAuthError] = useState('')
  const [showAuth, setShowAuth] = useState(false)
  const [adminView, setAdminView] = useState(false)

  useEffect(() => {
    fetch('/api/products/storefront')
      .then(async response => { if (!response.ok) throw new Error('ไม่สามารถโหลดสินค้าได้'); return response.json() })
      .then(setProducts).catch(error => setError(error.message)).finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => ['ทั้งหมด', ...new Set(products.map(p => p.category?.name).filter(Boolean))], [products])
  const visibleProducts = selectedCategory === 'ทั้งหมด' ? products : products.filter(p => p.category?.name === selectedCategory)
  const addToCart = product => setCart(current => {
    const existing = current.find(item => item._id === product._id)
    if (existing) return current.map(item => item._id === product._id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item)
    return [...current, { ...product, quantity: 1 }]
  })
  const changeQuantity = (id, amount) => setCart(current => current.flatMap(item => {
    if (item._id !== id) return [item]
    const quantity = item.quantity + amount
    return quantity > 0 ? [{ ...item, quantity: Math.min(quantity, item.stock) }] : []
  }))
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const scrollToProducts = () => document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' })
  const closeAuth = () => { setShowAuth(false); setAuthError('') }
  async function submitAuth(event) {
    event.preventDefault(); setAuthError('')
    const payload = authMode === 'login' ? { email: auth.email, password: auth.password } : auth
    try {
      const response = await fetch(`/api/auth/${authMode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'ไม่สามารถดำเนินการได้')
      localStorage.setItem('auth', JSON.stringify(data)); setAccount(data); setAuth(emptyAuth); closeAuth()
    } catch (error) { setAuthError(error.message) }
  }

  if (adminView && account?.user?.role === 'admin') return <AdminDashboard token={account.token} onClose={() => setAdminView(false)} />

  return <main>
    <header className="nav"><a className="brand" href="#top">mimi <span>🧸</span></a><nav><a href="#products">เลือกตุ๊กตา</a><a href="#story">เรื่องของเรา</a><a href="#footer">ติดต่อ</a></nav><div className="nav-actions">{account ? <><span className="welcome">สวัสดี, {account.user.name}</span>{account.user.role === 'admin' && <button className="login-button" onClick={() => setAdminView(true)}>จัดการร้าน</button>}<button className="login-button" onClick={() => { localStorage.removeItem('auth'); setAccount(null) }}>ออกจากระบบ</button></> : <button className="login-button" onClick={() => setShowAuth(true)}>เข้าสู่ระบบ</button>}<button className="cart" onClick={() => setShowCart(true)}>ตะกร้า <span>{cartCount}</span></button></div></header>
    <section id="top" className="hero"><div className="hero-copy"><p className="eyebrow">SOFT FRIENDS, BIG SMILES</p><h1>เพื่อนกอดนุ่ม<br/><em>สำหรับทุกวัน</em></h1><p>เลือกตุ๊กตาตัวโปรดที่ออกแบบมาเพื่อรอยยิ้ม อ้อมกอด และช่วงเวลาสบายใจของคุณ</p><button className="cta" onClick={scrollToProducts}>เลือกเพื่อนของคุณ <span>→</span></button></div><div className="hero-art" aria-label="ตุ๊กตาหมีนุ่มนิ่ม"><div className="sun"/><div className="bear"><i>●</i><i>●</i><b>ᴗ</b></div><span className="star one">✦</span><span className="star two">✦</span><span className="cloud">☁</span></div></section>
    <section className="trust"><span>🚚 ส่งฟรีเมื่อสั่งซื้อ 1,200 บาทขึ้นไป</span><span>♡ คัดสรรอย่างใส่ใจทุกตัว</span><span>↺ เปลี่ยนสินค้าได้ภายใน 7 วัน</span></section>
    <section id="products" className="catalog"><div className="section-heading"><div><p className="eyebrow">MEET THE COLLECTION</p><h2>เลือกเพื่อนที่ใช่สำหรับคุณ</h2></div><p>{products.length} ตัวนุ่มนิ่มกำลังรอให้พากลับบ้าน</p></div><div className="filters">{categories.map(category => <button key={category} className={selectedCategory === category ? 'active' : ''} onClick={() => setSelectedCategory(category)}>{category}</button>)}</div>{loading ? <p className="state">กำลังโหลดคอลเลกชัน...</p> : error ? <p className="state error">{error}</p> : visibleProducts.length ? <div className="product-grid">{visibleProducts.map(product => <ProductCard key={product._id} product={product} addToCart={addToCart}/>)}</div> : <div className="state">ยังไม่มีสินค้าพร้อมขายในขณะนี้</div>}</section>
    <section id="story" className="story"><div className="story-art">♡<span>✦</span></div><div><p className="eyebrow">MADE FOR THE LITTLE MOMENTS</p><h2>ตุ๊กตาที่ไม่ได้มีไว้แค่น่ารัก</h2><p>เราเชื่อว่าเพื่อนตัวเล็ก ๆ ช่วยเติมความอบอุ่นให้วันธรรมดาได้ ทุกชิ้นจึงถูกเลือกจากสัมผัสที่นุ่ม ปลอดภัย และรายละเอียดที่ทำให้คุณอยากกอดซ้ำอีกครั้ง</p><a href="#products">ดูคอลเลกชันทั้งหมด →</a></div></section>
    <p id="cart-message" className="cart-message">{cartCount ? `เลือกเพื่อนแล้ว ${cartCount} ตัว` : 'ยังไม่มีเพื่อนในตะกร้า'}</p>
    <footer id="footer"><a className="brand" href="#top">mimi 🧸</a><p>Made with softness in Bangkok.</p><div><a href="mailto:hello@mimi.local">อีเมล</a><a href="#top">Instagram</a></div></footer>
    {showAuth && <div className="modal-backdrop" onMouseDown={closeAuth}><section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title" onMouseDown={event => event.stopPropagation()}><button className="close-modal" aria-label="ปิด" onClick={closeAuth}>×</button><p className="eyebrow">WELCOME TO MIMI</p><h2 id="auth-title">{authMode === 'login' ? 'ยินดีต้อนรับกลับมา' : 'มาสร้างรอยยิ้มกัน'}</h2><p className="auth-description">{authMode === 'login' ? 'เข้าสู่ระบบเพื่อจัดการบัญชีและคำสั่งซื้อ' : 'สมัครสมาชิกง่าย ๆ แล้วเลือกเพื่อนตัวโปรดได้เลย'}</p><div className="auth-tabs"><button className={authMode === 'login' ? 'selected' : ''} onClick={() => { setAuthMode('login'); setAuthError('') }}>เข้าสู่ระบบ</button><button className={authMode === 'register' ? 'selected' : ''} onClick={() => { setAuthMode('register'); setAuthError('') }}>สมัครสมาชิก</button></div><form className="auth-form" onSubmit={submitAuth}>{authMode === 'register' && <><label>ชื่อ<input required value={auth.name} onChange={e => setAuth({ ...auth, name: e.target.value })} /></label><label>เบอร์โทรศัพท์ <small>(ไม่บังคับ)</small><input value={auth.phone} onChange={e => setAuth({ ...auth, phone: e.target.value })} /></label></>}<label>อีเมล<input required type="email" value={auth.email} onChange={e => setAuth({ ...auth, email: e.target.value })} /></label><label>รหัสผ่าน<input required type="password" minLength="8" value={auth.password} onChange={e => setAuth({ ...auth, password: e.target.value })} /></label>{authError && <p className="auth-error">{authError}</p>}<button className="auth-submit">{authMode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชี'}</button></form></section></div>}
    {showAuth && <div className="modal-backdrop" onMouseDown={closeAuth}><section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title" onMouseDown={event => event.stopPropagation()}><button className="close-modal" aria-label="ปิด" onClick={closeAuth}>×</button><p className="eyebrow">WELCOME TO MIMI</p><h2 id="auth-title">{authMode === 'login' ? 'ยินดีต้อนรับกลับมา' : 'มาสร้างรอยยิ้มกัน'}</h2><p className="auth-description">{authMode === 'login' ? 'เข้าสู่ระบบเพื่อจัดการบัญชีและคำสั่งซื้อ' : 'สมัครสมาชิกง่าย ๆ แล้วเลือกเพื่อนตัวโปรดได้เลย'}</p><div className="auth-tabs"><button className={authMode === 'login' ? 'selected' : ''} onClick={() => { setAuthMode('login'); setAuthError('') }}>เข้าสู่ระบบ</button><button className={authMode === 'register' ? 'selected' : ''} onClick={() => { setAuthMode('register'); setAuthError('') }}>สมัครสมาชิก</button></div><form className="auth-form" onSubmit={submitAuth}>{authMode === 'register' && <><label>ชื่อ<input required value={auth.name} onChange={e => setAuth({ ...auth, name: e.target.value })} /></label><label>เบอร์โทรศัพท์ <small>(ไม่บังคับ)</small><input value={auth.phone} onChange={e => setAuth({ ...auth, phone: e.target.value })} /></label></>}<label>อีเมล<input required type="email" value={auth.email} onChange={e => setAuth({ ...auth, email: e.target.value })} /></label><label>รหัสผ่าน<input required type="password" minLength="8" value={auth.password} onChange={e => setAuth({ ...auth, password: e.target.value })} /></label>{authError && <p className="auth-error">{authError}</p>}<button className="auth-submit">{authMode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชี'}</button></form></section></div>}
    {showCart && <div className="modal-backdrop" onMouseDown={() => setShowCart(false)}><section className="cart-modal" role="dialog" aria-modal="true" aria-labelledby="cart-title" onMouseDown={event => event.stopPropagation()}><button className="close-modal" aria-label="ปิด" onClick={() => setShowCart(false)}>×</button><p className="eyebrow">YOUR SOFT FRIENDS</p><h2 id="cart-title">ตะกร้าของคุณ</h2>{cart.length ? <><div className="cart-items">{cart.map(item => <article key={item._id}><div className="cart-image">{item.images?.[0] ? <img src={item.images[0]} alt={item.name}/> : '🧸'}</div><div><h3>{item.name}</h3><strong>{money.format(item.price)}</strong><div className="quantity"><button aria-label="ลดจำนวน" onClick={() => changeQuantity(item._id, -1)}>−</button><span>{item.quantity}</span><button aria-label="เพิ่มจำนวน" disabled={item.quantity >= item.stock} onClick={() => changeQuantity(item._id, 1)}>+</button></div></div><strong>{money.format(item.price * item.quantity)}</strong></article>)}</div><div className="cart-total"><span>ยอดรวม</span><strong>{money.format(cartTotal)}</strong></div><button className="auth-submit" onClick={() => setShowCart(false)}>ดำเนินการสั่งซื้อ</button></> : <p className="empty-cart">ยังไม่มีเพื่อนในตะกร้า<br/><button onClick={() => setShowCart(false)}>เลือกสินค้าต่อ</button></p>}</section></div>}
  </main>
}
