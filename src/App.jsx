import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Sun, Moon, Menu, X, Megaphone, Code2, LineChart, Globe, ArrowUp } from 'lucide-react'
import ReCAPTCHA from 'react-google-recaptcha'
import { T } from './i18n'

const JP = () => <svg viewBox="0 0 20 20" className="h-4 w-4 rounded-[3px] ring-1 ring-black/20"><rect width="20" height="20" fill="#fff" /><circle cx="10" cy="10" r="5" fill="#bc002d" /></svg>
const EN = () => <svg viewBox="0 0 20 20" className="h-4 w-4 rounded-[3px] ring-1 ring-black/20"><rect width="20" height="20" fill="#012169" /><path d="M0 0L20 20M20 0L0 20" stroke="#fff" strokeWidth="4" /><path d="M0 0L20 20M20 0L0 20" stroke="#c8102e" strokeWidth="1.6" /><path d="M10 0V20M0 10H20" stroke="#fff" strokeWidth="6" /><path d="M10 0V20M0 10H20" stroke="#c8102e" strokeWidth="3.4" /></svg>

function Network() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current, x = c.getContext('2d'); let id, w, h
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const resize = () => { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight }
    resize(); addEventListener('resize', resize)
    const P = Array.from({ length: 55 }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 }))
    const draw = () => {
      x.clearRect(0, 0, w, h)
      P.forEach((p, i) => {
        if (!reduce) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1 }
        x.fillStyle = 'rgba(96,165,250,.8)'; x.beginPath(); x.arc(p.x, p.y, 2, 0, 7); x.fill()
        for (let j = i + 1; j < P.length; j++) {
          const d = Math.hypot(p.x - P[j].x, p.y - P[j].y)
          if (d < 140) { x.strokeStyle = `rgba(96,165,250,${.28 * (1 - d / 140)})`; x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(P[j].x, P[j].y); x.stroke() }
        }
      })
      id = requestAnimationFrame(draw)
    }
    draw(); return () => { cancelAnimationFrame(id); removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />
}

const R = ({ children, d = 0, className = '' }) => <motion.div className={className} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: .5, delay: d }}>{children}</motion.div>
const H = ({ children }) => <h2 className="mb-12 text-3xl font-black md:text-4xl">{children}</h2>
const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY
const ids = ['about', 'strengths', 'services', 'company', 'contact']

export default function App() {
  const [lang, setLang] = useState('ja'), [light, setLight] = useState(() => localStorage.getItem('px-theme') === 'light'), [open, setOpen] = useState(false)
  const t = T[lang], { scrollY } = useScroll()
  const [solid, setSolid] = useState(false), [showTop, setShowTop] = useState(false)
  useEffect(() => scrollY.on('change', v => { setSolid(v > 40); setShowTop(v > 500) }), [scrollY])
  const logoH = useTransform(scrollY, [0, 160], [60, 34]), hdr = useTransform(scrollY, [0, 160], [96, 64])
  useEffect(() => { document.documentElement.classList.toggle('light', light); localStorage.setItem('px-theme', light ? 'light' : 'dark') }, [light])
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  const icons = [Megaphone, Code2, LineChart, Globe]
  const link = 'text-sm font-bold opacity-80 transition hover:opacity-100 hover:text-[var(--accent2)]'
  const logo = light ? '/logo-dark.png' : '/logo-light.png'
  const toggleLang = <button onClick={() => setLang(lang === 'ja' ? 'en' : 'ja')} className={`${link} flex items-center gap-2`}>{lang === 'ja' ? <EN /> : <JP />}{t.other}</button>

  return <>
    <motion.header style={{ height: hdr, backgroundColor: solid ? 'color-mix(in srgb, var(--bg) 85%, transparent)' : 'transparent', borderColor: solid ? 'var(--line)' : 'transparent' }} className={`fixed inset-x-0 top-0 z-50 flex items-center border-b transition-colors ${solid ? 'text-[var(--fg)] backdrop-blur-md' : 'text-white'}`}>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5">
        <a href="#top"><motion.img style={{ height: logoH }} src={solid && light ? '/logo-dark.png' : '/logo-light.png'} alt="PX Solutions" /></a>
        <nav className="hidden items-center gap-7 lg:flex">
          {t.nav.map((n, i) => <a key={n} href={`#${ids[i]}`} className={link}>{n}</a>)}
          {toggleLang}
          <button onClick={() => setLight(!light)} aria-label={t.theme} style={{ borderColor: 'color-mix(in srgb, currentColor 30%, transparent)' }} className="rounded-full border p-2 hover:border-[var(--accent2)]">{light ? <Moon size={16} /> : <Sun size={16} />}</button>
        </nav>
        <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="menu">{open ? <X /> : <Menu />}</button>
      </div>
      {open && <div className="absolute inset-x-0 top-full flex flex-col gap-4 border-b border-[var(--line)] bg-[var(--bg)] p-6 text-[var(--fg)] lg:hidden">
        {t.nav.map((n, i) => <a key={n} href={`#${ids[i]}`} onClick={() => setOpen(false)} className={link}>{n}</a>)}
        {toggleLang}
        <button onClick={() => setLight(!light)} className={`${link} flex items-center gap-2`}>{light ? <Moon size={16} /> : <Sun size={16} />}{t.theme}</button>
      </div>}
    </motion.header>

    <main id="top">
      <section className="relative flex min-h-screen items-center overflow-hidden bg-[radial-gradient(ellipse_at_30%_20%,#12306e,#050d24_65%)]">
        <Network />
        <img src="/images/hero.png" alt="" onError={e => e.currentTarget.remove()} className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-screen" />
        <div className="relative mx-auto w-full max-w-6xl px-5 pt-24 text-white">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8 }} className="text-5xl font-black md:text-8xl">{t.hero[0]}</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .5, duration: .8 }} className="mt-6 text-lg font-bold text-blue-100 md:text-2xl">{t.hero[1]}</motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .9 }} className="mt-10 flex flex-wrap gap-4">
            <a href="#contact" className="rounded-full bg-blue-500 px-8 py-3 font-bold transition hover:bg-blue-400">{t.cta}</a>
            <a href="#services" className="rounded-full border border-white/40 px-8 py-3 font-bold transition hover:bg-white/10">{t.cta2}</a>
          </motion.div>
        </div>
      </section>

      <section id="about" className="py-28"><div className="mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-2">
        <R><H>{t.aboutT}</H>{t.aboutP.map(p => <p key={p} className="mb-4 max-w-prose text-[var(--muted)]">{p}</p>)}</R>
        <R d={.15}><div className="aspect-[4/3] overflow-hidden rounded-3xl border border-[var(--line)] bg-gradient-to-br from-blue-600/40 to-cyan-400/10">
          <img src="/images/about.png" alt="" onError={e => e.currentTarget.remove()} className="h-full w-full object-cover" /></div></R>
      </div></section>

      <section id="strengths" className="bg-[var(--bg2)] py-28"><div className="mx-auto max-w-6xl px-5">
        <R><H>{t.strT}</H></R>
        <div className="grid gap-10 md:grid-cols-3">{t.str.map(([a, b], i) => <R key={a} d={i * .1}><h3 className="mb-3 border-l-4 border-[var(--accent2)] pl-4 text-xl font-bold">{a}</h3><p className="text-[var(--muted)]">{b}</p></R>)}</div>
      </div></section>

      <section id="services" className="py-28"><div className="mx-auto max-w-6xl px-5">
        <R><H>{t.svcT}</H></R>
        <div className="grid gap-6 md:grid-cols-2">{t.svc.map(([a, b], i) => {
          const I = icons[i]; return <R key={a} d={i * .08}>
            <motion.div whileHover={{ y: -6 }} className="h-full rounded-2xl border border-[var(--line)] bg-[var(--card)] p-8 transition-colors hover:border-[var(--accent)]">
              <I className="mb-5 text-[var(--accent2)]" size={32} /><h3 className="mb-3 text-xl font-bold">{a}</h3><p className="text-[var(--muted)]">{b}</p></motion.div></R>
        })}</div>
      </div></section>

      <section id="company" className="bg-[var(--bg2)] py-28"><div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-2">
        <R><H>{t.coT}</H><dl>{t.co.map(([k, v]) => <div key={k} className="grid grid-cols-3 gap-4 border-b border-[var(--line)] py-4"><dt className="font-bold">{k}</dt><dd className="col-span-2 text-[var(--muted)]">{v}</dd></div>)}</dl></R>
        <R d={.15}><iframe title="map" loading="lazy" className="h-full min-h-[360px] w-full rounded-2xl border border-[var(--line)]" src="https://www.google.com/maps?q=%E7%A5%9E%E5%A5%88%E5%B7%9D%E7%9C%8C%E6%A8%AA%E6%B5%9C%E5%B8%82%E6%B8%AF%E5%8C%97%E5%8C%BA%E9%8C%A6%E3%81%8C%E4%B8%98%EF%BC%94-%EF%BC%91%EF%BC%92&output=embed" /></R>
      </div></section>

      <Contact t={t} />
    </main>

    <footer>
      <div className="bg-[var(--ft)] px-5 py-14 text-center text-[var(--ftfg)]">
        <img src={logo} alt="PX Solutions" className="mx-auto h-14" />
        <p className="mx-auto mt-8 max-w-3xl text-sm leading-8">{t.aboutP[0]}<br className="hidden md:block" />{t.aboutP[1]}</p>
      </div>
      <div className="bg-[var(--ft2)] py-4 text-center text-sm text-[var(--ftfg)]">Copyright © {new Date().getFullYear()} PX Solutions.</div>
    </footer>

    <AnimatePresence>{showTop && <motion.button key="top" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label={t.top}
      className="fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-full bg-[var(--accent)] text-white shadow-lg transition hover:brightness-110"><ArrowUp size={20} /></motion.button>}</AnimatePresence>
  </>
}

function Contact({ t }) {
  const [s, setS] = useState('idle'), [msg, setMsg] = useState(''), cap = useRef(null)
  const submit = async e => {
    e.preventDefault(); const form = e.target, token = cap.current?.getValue()
    if (!token) return setMsg(t.cap)
    setS('sending'); setMsg('')
    const d = Object.fromEntries(new FormData(form))
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...d, token }) })
      if (!r.ok) throw 0
      setS('idle'); setMsg(t.ok); form.reset(); cap.current.reset()
    } catch { setS('idle'); setMsg(t.ng); cap.current?.reset() }
  }
  const inp = 'w-full rounded-xl border border-[var(--line)] bg-[var(--card)] px-4 py-3 outline-none focus:border-[var(--accent2)]'
  return <section id="contact" className="py-28"><div className="mx-auto max-w-2xl px-5">
    <R><h2 className="text-3xl font-black md:text-4xl">{t.ctT}</h2><p className="mb-10 mt-3 text-[var(--muted)]">{t.ctP}</p></R>
    <form onSubmit={submit} className="space-y-5">
      {[['name', 'text', 0], ['email', 'email', 1], ['phone', 'tel', 2]].map(([n, ty, i]) => <label key={n} className="block text-sm font-bold">{t.f[i]}{n !== 'phone' && <span className="ml-2 text-xs text-[var(--accent2)]">{t.req}</span>}
        <input name={n} type={ty} required={n !== 'phone'} placeholder={t.ph[i]} className={`${inp} mt-2 font-normal`} /></label>)}
      <label className="block text-sm font-bold">{t.f[3]}<span className="ml-2 text-xs text-[var(--accent2)]">{t.req}</span>
        <textarea name="message" required rows={6} className={`${inp} mt-2 font-normal`} /></label>
      {SITE_KEY ? <ReCAPTCHA ref={cap} sitekey={SITE_KEY} /> : <p className="text-sm text-amber-400">reCAPTCHA key missing: set VITE_RECAPTCHA_SITE_KEY in .env</p>}
      <button disabled={s === 'sending'} className="rounded-full bg-[var(--accent)] px-10 py-3 font-bold text-white transition hover:brightness-110 disabled:opacity-60">{s === 'sending' ? t.sending : t.send}</button>
      {msg && <p role="status" className="text-sm text-[var(--accent2)]">{msg}</p>}
    </form></div></section>
}
