import React, { CSSProperties } from 'react'
import { Link } from '@mui/material'
import { strings as commonStrings } from '../lang/common'
import { strings } from '../lang/unauthorized'

function Unauthorized({ style }: { style?: CSSProperties }) {
  return (
    <div className="msg" style={style}>
      <h2>{strings.UNAUTHORIZED}</h2>
      <p>
        <Link href="/">{commonStrings.GO_TO_HOME}</Link>
      </p>
    </div>
  )
}

export default Unauthorized
