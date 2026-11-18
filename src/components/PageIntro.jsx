export default function PageIntro({ label, title, description, children }) {
  return (
    <section className="page-intro">
      <div className="container page-intro-inner">
        <div className="eyebrow eyebrow-light"><span />{label}</div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
        {children}
      </div>
      <div className="intro-orbit orbit-one" />
      <div className="intro-orbit orbit-two" />
    </section>
  )
}
