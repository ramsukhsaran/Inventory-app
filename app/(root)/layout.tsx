import React from 'react'

const layout = ({children}:{children:React.ReactNode}) => {
  return (
    <div className="">
        <p>Root Navbar from Home</p>
        {children}
        <p>Home Footer Footer</p>
    </div>
  )
}

export default layout