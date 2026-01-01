import Link from 'next/link'
import React from 'react'

const About = () => {
  // throw new Error('Error in About Page');
  // Error in next js bubble up to neartest error boundary
  return (
    <div className='text-3xl'>
        
    <h1>This is About Page</h1>
    <br />
    <Link href="/">Go Back</Link>
    </div>
  )
}

export default About