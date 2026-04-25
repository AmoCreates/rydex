import React from 'react'

type Props = {
  open: boolean,
  onClose: () => void
}

const AuthModel = ({open, onClose}: Props) => {
  return (
    <div>
      Auth Section
    </div>
  )
}

export default AuthModel
