import { useState, useImperativeHandle, forwardRef } from 'react'

const Togglable = forwardRef(({ buttonLabel, children }, ref) => {
  const [visible, setVisible] = useState(false)
  const toggleVisibility = () => setVisible(v => !v)

  useImperativeHandle(ref, () => ({ toggleVisibility }))

  return (
    <div className="togglable">
      {!visible && (
        <div>
          <button onClick={toggleVisibility}>{buttonLabel}</button>
        </div>
      )}

      {visible && (
        <div className="togglableContent">
          {typeof children === 'function'
            ? children(toggleVisibility)
            : children}
        </div>
      )}
    </div>
  )
})

export default Togglable
