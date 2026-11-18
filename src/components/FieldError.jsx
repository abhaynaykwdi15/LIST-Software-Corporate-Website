export default function FieldError({ id, error }) {
  if (!error) return null
  return <span id={id} role="alert" className="text-xs leading-5 text-red-700">{error.message}</span>
}
