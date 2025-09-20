import { useState, useImperativeHandle, forwardRef } from 'react'

const Togglable = forwardRef(({ buttonLabel, children, onOpen, onClose }, ref) => {
  const [visible, setVisible] = useState(false)

  const toggleVisibility = () => {
    setVisible(v => {
      const newVisible = !v
      if (newVisible && onOpen) onOpen()
      if (!newVisible && onClose) onClose()
      return newVisible
    })
  }

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
