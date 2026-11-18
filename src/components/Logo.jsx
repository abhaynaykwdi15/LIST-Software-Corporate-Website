import { Link } from 'react-router-dom'

export default function Logo({ light = false }) {
  return (
    <Link to="/" className={`brand ${light ? 'brand-light' : ''}`} aria-label="LIST Software home">
      <img className="brand-image" src="/assets/list-software-logo.png" alt="" />
    </Link>
  )
}
