export default function FormField({ label, name, type = 'text', value, onChange, ...props }) {
  return (
    <label className="form-field">
      <span>{label} {props.required && <i>*</i>}</span>
      <input name={name} type={type} value={value} onChange={onChange} {...props} />
    </label>
  )
}
