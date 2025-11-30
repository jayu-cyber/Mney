import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

const NotFound = () => {
  return (
    <div className='flex flex-col  bg-indigo-100  items-center justify-center min-h-[100vh] px-4 text-center '>
      <h1 className='text-8xl font-bold gradient-title mb-4 '>404</h1>
      <h2 className='text-2xl font-semibold mb-4 '>Page not found </h2>
      <p className='text-gray-600 mb-8'>OOPs! The page you&apos;re looking for dosen&apos;t exit or has been moved.</p>
      <Link href="/">
      <Button className=" hover:animate-bounce">Return Home</Button>
      </Link>
    </div>
  )
}

export default NotFound
