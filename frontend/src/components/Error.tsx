import React from 'react'
import { Link } from '@mui/material'
import { strings as commonStrings } from '../lang/common'

import '../assets/css/error.css'

function Error({ message, style, homeLink }: { message: string, style?: React.CSSProperties, homeLink?: boolean }) {
  return (
    <div style={style}>
      <div className="error">
        <span className="message">{message}</span>
      </div>
      {homeLink && (
      <p>
        <Link href="/">{commonStrings.GO_TO_HOME}</Link>
      </p>
    )}
    </div>
  )
}

export default Error
