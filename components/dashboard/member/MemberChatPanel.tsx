'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Loader2, Menu, MessageCircle, Paperclip, 
  SendHorizontal, Smile, Search, MoreHorizontal,
  CheckCheck
} from 'lucide-react'
import type { User } from 'firebase/auth'
import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Surface } from '@/components/dashboard/ui/Surface'
import { cn } from '@/lib/utils'
import type { ChatMessage, ChatRoom } from '@/lib/dashboard/types'

interface Props {
  user: User
  chatRooms: ChatRoom[]
  activeChatRoom: ChatRoom | null
  setActiveChatRoom: (r: ChatRoom | null) => void
  messages: ChatMessage[]
  chatInput: string
  setChatInput: (v: string) => void
  sendingMessage: boolean
  showChatSidebar: boolean
  setShowChatSidebar: (v: boolean) => void
  typingUsers: { userId: string; name: string }[]
  onSend: () => void
  onTyping: () => void
}

export function MemberChatPanel({
  user,
  chatRooms,
  activeChatRoom,
  setActiveChatRoom,
  messages,
  chatInput,
  setChatInput,
  sendingMessage,
  showChatSidebar,
  setShowChatSidebar,
  typingUsers,
  onSend,
  onTyping,
}: Props) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUsers.length])

  return (
    <div className="mx-auto flex h-[calc(100vh-10rem)] max-w-5xl gap-4 px-4 py-4 pb-8">
      {/* 1. SIDEBAR: CHAT LIST */}
      <AnimatePresence mode="wait">
        {showChatSidebar && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="hidden w-full max-w-[300px] flex-col md:flex"
          >
            <Surface className="glass-panel flex h-full flex-col overflow-hidden border-none ring-1 ring-white/10">
              <div className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Messages</h2>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white/5 text-white/40 hover:text-white">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <Input 
                  placeholder="Find a conversation..." 
                  className="h-10 border-none bg-white/5 text-xs placeholder:text-white/20 focus-visible:ring-primary/30" 
                />
              </div>

              <ScrollArea className="flex-1 px-3">
                <div className="space-y-1 pb-6">
                  {chatRooms.map((room) => {
                    const isActive = activeChatRoom?.id === room.id
                    return (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => setActiveChatRoom(room)}
                        className={cn(
                          "group relative flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all duration-300",
                          isActive 
                            ? "bg-primary/10 ring-1 ring-primary/20" 
                            : "hover:bg-white/5"
                        )}
                      >
                        <Avatar className="h-11 w-11 ring-2 ring-white/5 transition-transform group-hover:scale-105">
                          <AvatarImage src={room.avatar} alt="" />
                          <AvatarFallback className={cn(
                            "font-bold",
                            room.type === 'group' ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-white/40'
                          )}>
                            {room.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className={cn("truncate text-sm font-bold", isActive ? "text-white" : "text-white/60")}>
                              {room.name}
                            </p>
                            <span className="text-[10px] font-medium text-white/20">12:45 PM</span>
                          </div>
                          <p className="truncate text-xs font-medium text-white/30">{room.lastMessage ?? 'No messages yet'}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            </Surface>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. CHAT VIEWPORT */}
      <Surface className="glass-panel relative flex min-w-0 flex-1 flex-col overflow-hidden border-none ring-1 ring-white/10">
        {activeChatRoom ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-white/40"
                  onClick={() => setShowChatSidebar(!showChatSidebar)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                  <AvatarImage src={activeChatRoom.avatar} alt="" />
                  <AvatarFallback className="bg-primary text-primary-foreground font-black">
                    {activeChatRoom.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">{activeChatRoom.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                      {activeChatRoom.type === 'group' ? 'Multi-user channel' : 'Direct secure line'}
                    </p>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-white/20 hover:text-white">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>

            {/* Message Area */}
            <ScrollArea className="flex-1 bg-gradient-to-b from-transparent to-primary/5 p-6">
              <div className="space-y-6">
                {messages.map((message, idx) => {
                  const isMe = message.senderId === user.uid
                  const showAvatar = !isMe && (idx === 0 || messages[idx - 1].senderId !== message.senderId)
                  
                  return (
                    <motion.div 
                      key={message.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn("flex group", isMe ? 'justify-end' : 'justify-start')}
                    >
                      <div className={cn("flex max-w-[80%] gap-3", isMe ? 'flex-row-reverse' : 'flex-row')}>
                        <div className="flex flex-col">
                          {!isMe && (
                            <p className="mb-1.5 ml-1 text-[10px] font-bold text-white/20">{message.senderName}</p>
                          )}
                          <div className={cn(
                            "relative rounded-2xl px-4 py-3 shadow-xl transition-all group-hover:shadow-primary/5",
                            isMe
                              ? 'rounded-br-sm bg-primary text-primary-foreground'
                              : 'rounded-bl-sm border border-white/10 bg-white/5 text-white/80'
                          )}>
                            {message.imageUrl && (
                              <img src={message.imageUrl} alt="" className="mb-2 max-h-60 w-full rounded-xl object-cover ring-1 ring-white/10" />
                            )}
                            <p className="whitespace-pre-wrap break-words text-sm font-medium leading-relaxed">{message.text}</p>
                            <div className={cn(
                              "mt-2 flex items-center gap-1.5",
                              isMe ? 'justify-end' : 'justify-start'
                            )}>
                              <p className="text-[9px] font-bold uppercase opacity-40">
                                {format(new Date(message.createdAt), 'h:mm a')}
                              </p>
                              {isMe && <CheckCheck className="h-3 w-3 opacity-40" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
                
                {typingUsers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 rounded-full bg-white/5 px-3 py-2 ring-1 ring-white/10">
                      <span className="h-1 w-1 animate-bounce rounded-full bg-white/40" />
                      <span className="h-1 w-1 animate-bounce rounded-full bg-white/40 [animation-delay:0.2s]" />
                      <span className="h-1 w-1 animate-bounce rounded-full bg-white/40 [animation-delay:0.4s]" />
                    </div>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">
                      {typingUsers[0].name} typing...
                    </p>
                  </div>
                )}
                <div ref={endRef} className="h-2" />
              </div>
            </ScrollArea>

            {/* Input Footer */}
            <div className="p-6">
              <div className="glass-panel flex items-center gap-2 rounded-2xl border-none bg-white/[0.03] p-2 ring-1 ring-white/10 focus-within:ring-primary/40">
                <Button variant="ghost" size="icon" className="hidden shrink-0 text-white/20 hover:text-white sm:flex">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  value={chatInput}
                  onChange={(e) => {
                    setChatInput(e.target.value)
                    onTyping()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      onSend()
                    }
                  }}
                  placeholder="Securely message Kalinga International..."
                  className="h-10 flex-1 border-none bg-transparent text-sm font-medium placeholder:text-white/20 focus-visible:ring-0"
                />
                <Button
                  onClick={onSend}
                  disabled={!chatInput.trim() || sendingMessage}
                  className="h-10 w-10 shrink-0 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  {sendingMessage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SendHorizontal className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center space-y-4 p-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/5 text-primary ring-1 ring-primary/10">
              <MessageCircle className="h-10 w-10 opacity-40" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-white/20">Private Communications</p>
              <p className="mt-1 text-xs font-medium text-white/10">Select a secure channel to begin</p>
            </div>
          </div>
        )}
      </Surface>
    </div>
  )
}