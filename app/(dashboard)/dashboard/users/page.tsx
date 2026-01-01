'use client'

import Link from "next/link"

const users =[
    {
        name:"ramsukh",
        age:27,
        address:"bikaner"
    },
    {
        name:"AMar",
        age:25,
        address:"patna"
    },
    {
        name:"bablu",
        age:23,
        address:"Jaipur"
    }
]
const Users = () => {
  return (
    <div className="flex items-center justify-center gap-2 mt-1">
        
       {users?.map((item:any)=>{
      return  <ul key={item.name}>
            <Link href={`/dashboard/users/${item.age}`}>
            <li className="bg-blue-400 rounded p-3">{item.name}</li>
            </Link>
            
        </ul>
       })}
       <br />
    <Link href="/">Go Back</Link>
  
    </div>
  )
}

export default Users