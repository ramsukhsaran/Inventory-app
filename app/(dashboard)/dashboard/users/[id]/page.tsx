import Link from "next/link";

const page = async ({params}:{params:Promise<{id:string}>}) => {
    const {id}= await params;
  return (
    <div>
     <h1>This user Age : {id}</h1>
     <Link href="/dashboard/users">Go Back</Link>
    </div>
  )
}

export default page