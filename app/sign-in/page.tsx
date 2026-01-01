import { SignIn } from '@stackframe/stack';
import Link from 'next/link';

const SignInPage = () => {
    return (
        <div className='min-h-screen flex items-center justify-center bg-black text-white'>
            <div className='max-w-md w-full space-y-8'>
                <SignIn
                />
                <Link href="/" className="">Go to Home</Link>
            </div>
        </div>
    )
}

export default SignInPage;