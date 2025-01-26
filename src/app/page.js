"use client"
import Image from 'next/image'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

const Page = () => {
  const router = useRouter()
 const [roomId, setroomId] = useState("")
  const handleCreateRoom = () => {
    const newRoom = `room-${Math.random().toString(36).substring(7)}`;
    router.push(`/room/${newRoom}`);
  };
  return (
   <div className=' w-full h-full bg-black overflow-hidden'>
     <div className=' flex items-center justify-center max-w-screen-xl flex-col space-y-6 mx-auto h-screen'>
      <div className=' max-w-screen-xl mx-auto flex items-center flex-col justify-center relative z-20'>
        <h1 className='lg:text-[130px]  font-bold text-transparent bg-clip-text bg-gradient-to-r font-serif from-red-500 to-red-400 z-20'>Vibe Talk</h1>
        <p className='lg:text-2xl text-sm font-bold text-white text-center'>Chat with your loved ones with emotion</p>
        <Image src="/love.jpg" alt="music" width={100} height={100} className='absolute -top-8 -right-20 animate-pulse' />
        <div className='absolute -bottom-8 -left-20  bg-gradient-to-r from-orange-100 to-yellow-100 w-[700px] 
        h-[700px] rounded-full blur-3xl opacity-30 '></div>
        <div className='absolute -top-8 -right-40  bg-gradient-to-r from-pink-100 to-red-100 w-[500px] 
        h-[500px] rounded-full blur-3xl opacity-30 '></div>
      </div>
      
     <div className='flex items-center flex-col space-y-6' >
     <button className='bg-gradient-to-r px-10 w-full from-red-500 z-30 to-red-700
      text-white  py-3 rounded' onClick={handleCreateRoom}>Create a room</button>
    <div className='flex items-center flex-col space-y-4 z-30'>
    <input  type="text" onChange={(e) => setroomId(e.target.value)} value={roomId} placeholder='Enter room code' className='border border-gray-300 rounded px-3 py-2 ml-4 w-full' />
    <button className='bg-gradient-to-r px-10 from-red-500 to-red-700
      text-white  py-3 rounded' onClick={() => router.push(`/room/${roomId}`)} >Join a room</button>
    </div>
     </div>
    </div>
   </div>
  )
}

export default Page