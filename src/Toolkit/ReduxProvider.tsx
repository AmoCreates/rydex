'use client'
import { store } from '@/Toolkit/store'
import React from 'react'
import { Provider } from 'react-redux'

const ReduxProvider = ({children}: Readonly<{children: React.ReactNode}>) => {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  )
}

export default ReduxProvider