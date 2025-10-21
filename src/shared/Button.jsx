export default function Button({ children, onClick, type="button", kind="default", ...rest }) {
  const cls = ['btn']
  if (kind === 'primary') cls.push('primary')
  if (kind === 'ghost') cls.push('ghost')
  if (kind === 'danger') cls.push('danger')
  return (
    <button type={type} className={cls.join(' ')} onClick={onClick} {...rest}>
      {children}
    </button>
  )
}
