import Chatroom from '@/app/_components/Chatroom'
import React from 'react'

const Page = ({params}) => {
  return (
    <Chatroom roomId={params.roomId} />
  )
}

export default Page