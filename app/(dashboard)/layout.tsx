import React from 'react'

const layout = ({children}:{children:React.ReactNode}) => {
  return (
    <div className="">
        <p>Dashboard NavBar</p>
        {children}
        <p>Dashboard Footer</p>
    </div>
  )
}

export default layout