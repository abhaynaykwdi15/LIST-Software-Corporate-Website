import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import Logo from '../components/Logo'

function Header() {
  const [open, setOpen] = useState(false)
  const nav = [
    ['About', '/about'],
    ['Solutions', '/solutions'],
    ['Banking technology', '/banking-technology'],
    ['Careers', '/careers'],
  ]

  return (
    <>
      <div className="demo-strip"><span>Independent website demo</span><i /> Not an official LIST Software website</div>
      <header className="site-header">
        <div className="container nav-wrap">
          <Logo />
          <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'}>
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
          <nav className={`main-nav ${open ? 'nav-open' : ''}`} aria-label="Main navigation">
            {nav.map(([label, path]) => <NavLink key={path} to={path} onClick={() => setOpen(false)}>{label}</NavLink>)}
            <Link to="/contact" className="nav-cta" onClick={() => setOpen(false)}>Talk to our team <ArrowUpRight size={15} /></Link>
          </nav>
        </div>
      </header>
    </>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-about">
          <Logo light />
          <p>Banking technology for cooperative banks and credit societies.</p>
          <span className="footer-disclaimer">Independent demo. Not affiliated with or endorsed by LIST Software Pvt. Ltd.</span>
        </div>
        <div><h4>Explore</h4><Link to="/about">About LIST</Link><Link to="/solutions">Our solutions</Link><Link to="/banking-technology">Banking technology</Link><Link to="/careers">Careers</Link></div>
        <div><h4>Contact</h4><p>6th Floor, Elixa Park, Old Pune–Bangalore Highway, Shahupuri, Kolhapur, Maharashtra 416001</p><a href="tel:+912312669164">+91 231 266 9164</a><a href="mailto:bankingsales@listspl.co.in">bankingsales@listspl.co.in</a></div>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} LIST Software · Independent demo project</span><Link to="/admin/login">Admin portal <ArrowUpRight size={13} /></Link></div>
    </footer>
  )
}

export default function SiteLayout({ children }) {
  return <><Header /><main>{children}</main><Footer /></>
}
