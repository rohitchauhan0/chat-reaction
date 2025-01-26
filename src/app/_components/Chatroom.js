"use client"
import Image from 'next/image';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from "uuid";
import { motion } from 'framer-motion';
import { Emoji } from '@/data/Emoji';

const Chatroom = ({roomId}) => {
    const socket = useMemo(() => io("http://localhost:3002"), []);
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [userId, setUserId] = useState("");
    const [roomUsers, setRoomUsers] = useState([]);
    const scroll = useRef()
    const notificationTone = useRef(null);
    const [reactionCode, setreactionCode] = useState("")
    const [showEmojiPallete, setshowEmojiPallete] = useState(false)
    const soundEffect = useRef(null);

    const audioCache = {};

    Emoji.forEach((emoji) => {
      if (emoji.music) {
        const audio = new Audio(emoji.music);
        audioCache[emoji.name] = audio; // Cache the audio object
      }
    });
    

    useEffect(() => {
        const id = uuidv4();
        setUserId(id);
    }, []);


    useEffect(() => {
        if (!socket) return;

        socket.on("connect", () => {
            console.log("Connected to server");
        });
        socket.on("receive-message", (data) => {
            console.log("Received message:", data);
            setChat((prev) => [...prev, data]);
            if (notificationTone.current) {
                notificationTone.current.play().catch((err) => {
                    console.error("Error playing notification tone:", err);
                });
            } 
        });


        socket.on("room-users", (users) => {
            setRoomUsers(users);
        });

        socket.emit("join-room", roomId);

        socket.on("receive-reaction", (data) => {
            setreactionCode(data.code);  // Update the reactionCode state with the received code
            const selectedEmoji = Emoji.find((item) => item.name === data.code);
            console.log("Received reaction code:", selectedEmoji);
          
            if (selectedEmoji && audioCache[selectedEmoji.name]) {  // Use selectedEmoji.name here instead of reactionCode
              console.log("Playing sound effect:", selectedEmoji.name);
              const soundEffect = audioCache[selectedEmoji.name];
              soundEffect.currentTime = 0; // Reset audio to start
              soundEffect
                .play()
                .then(() => {
                  console.log("Sound played successfully");
                })
                .catch((err) => {
                  console.error("Error playing sound effect:", err);
                });
            }
          });
          

        return () => {
            socket.off("connect");
            socket.off("receive-message");
            socket.off("room-users");
        };
    }, [socket, roomId]);



    const sendMessage = (type = "text", content = "") => {
        console.log("Sending message:", type, message, content);
        if (type === "text" && message.trim()) {
            const data = { roomId, type, message, senderId: userId };
            socket.emit("send-message", data);
            setMessage(""); 
        } else if (type === "media" && content) {
            const data = { roomId, type, content, senderId: userId };
            socket.emit("send-message", data);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
          sendReaction(""); // Hide the emoji after a certain time
        }, 2000); // 2 seconds before disappearing
    
        return () => clearTimeout(timer); // Clean up the timer
      }, [reactionCode]);




    useEffect(() => {
        if (scroll.current) {
            scroll.current.scrollTop = scroll.current.scrollHeight;
        }
    }, [chat]);


 
const sendReaction = (reactionCode) => {
    // Find the selected emoji and play audio
   
  
    // Emit reaction data to the server
    const data = { roomId, code: reactionCode, senderId: userId }; 
    socket.emit("send-reaction", data);
  };
  
    const selectedEmoji = Emoji.find((item) => item.name === reactionCode);


  return (
    <>
     <div className="flex flex-col h-screen w-screen bg-black text-white py-2 relative overflow-hidden overflow-y-hidden">
    <div className="h-[800px] w-[800px] bg-red-800 rounded-full blur-3xl opacity-25 absolute bottom-0 -left-32"></div>
    <audio ref={notificationTone} src="/tone.mp3" preload="auto" />
    <audio ref={soundEffect} preload="auto" />
    <div className="h-[400px] w-[400px] bg-red-800 rounded-full blur-3xl opacity-25 absolute top-0 -right-32"></div>
    <div className="text-white font-semibold text-center py-2 text-sm">
        <p>{roomUsers.length} users</p>
        <p>Share code: {roomId}</p>
    </div>

    <div className="max-w-screen-lg w-full mx-auto rounded-xl relative z-10 lg:px-0 px-5">

        

        {/* Chat */}
        <div className="lg:h-[620px] h-[500px] overflow-y-scroll flex  flex-col gap-4 py-10 lg:px-8 px-2 rounded-xl z-10" ref={scroll}>
        {reactionCode && (
            
       <motion.div
       initial={{ opacity: 0, scale: 0.5 }}
       animate={{ opacity: 1, scale: 1 }}
       exit={{ opacity: 0, scale: 0.5 }}
       transition={{ duration: 0.5 }}
       style={{ fontSize: '50px', marginTop: '20px' }}
       className="absolute top-0 left-1/3  -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
     >
       <Image src={selectedEmoji.emoji} alt="emoji" className='animate-bounce lg:h-72 lg:w-72 h-40 w-40' width={300} height={300} />
     </motion.div>
     
      )}
         
          
            {chat.map((msg, index) => (
                <div
                    key={index}
                    className={`flex items-center ${msg.senderId === userId ? "justify-end" : "justify-start"}`}
                >
                    {msg.senderId !== userId && (
                        <Image
                        src="/love.jpg"
                        alt="User"
                            width={40}
                            height={40}
                            className="mr-2 rounded-full bg-red-500 p-2"
                        />
                    )}
                    <div
                        className={`py-2 px-4 max-w-xs rounded-lg ${msg.senderId === userId ? "bg-red-400 text-white" : "bg-red-600"}`}
                    >
                        {msg.type === "text" && msg.message}
                      
                    </div>
                </div>
            ))}
        </div>

        {/* Message input */}
        <div className="flex flex-row items-center space-x-2 relative">
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full p-3 border border-gray-300 bg-transparent rounded-lg text-white  sm:mb-0"
            />
          {
            showEmojiPallete && (
                <div className="absolute bottom-14 w-full lg:w-fit left-1/2 transform -translate-x-1/2 grid grid-cols-5 gap-2">
                {
                    Emoji.map((emoji) => (
                        <button key={emoji.id} onClick={() => {
                            sendReaction(emoji.name)
                            setshowEmojiPallete(false)
                        }}>
                            <Image src={emoji.emoji} alt="emoji" className=' lg:h-12 lg:w-12 w-10 h-10' width={40} height={40} />
                        </button>
                    ))
                }
            </div>
            )
          }
            <button onClick={() => setshowEmojiPallete(!showEmojiPallete)}>

                <Image src="/love.jpg" alt="emoji" width={70} height={70} className=' rounded-full lg:h-10 lg:w-12 h-6 w-10 object-cover' />
            </button>
            <button
                onClick={() => sendMessage("text")}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
                Send
            </button>
        </div>

    </div>
</div>
    </>
  )
}

export default Chatroom