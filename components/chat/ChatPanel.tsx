'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Loader2, Menu, Paperclip, Smile, 
  SendHorizontal, PhoneCall, Video as VideoIcon, 
  MoreVertical, Search, CheckCheck 
} from 'lucide-react'
import { ref, onValue, push, set, update } from 'firebase/database'
import { toast } from 'sonner'
import { getDatabase } from '@/lib/firebase'
import { cn } from '@/lib/utils'

// ... Types remain the same as your input ...

export default function ChatPanel({ mode = 'room', id, rooms, currentUserId, currentUserName, showSidebar = true, onSelectRoom }: Props) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(() => rooms ?? [])
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(() => (rooms && rooms[0]) ?? null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // ... Logic for getPath, useEffects for loading/sending remains identical to your core logic ...

  return (
    <div className="flex h-[calc(100vh-140px)] w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-950/50 backdrop-blur-xl shadow-2xl">
      
      {/* --- Sidebar: Modern Glass Design --- */}
      {showSidebar && mode === 'room' && (
        <aside className="hidden w-80 flex-col border-r border-white/5 bg-white/[0.02] md:flex">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight text-white">Messages</h2>
              <Button variant="ghost" size="icon" className="rounded-full bg-white/5 hover:bg-white/10">
                <Search className="w-4 h-4 text-slate-400" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 px-3">
            <div className="space-y-2 pb-4">
              {chatRooms.map((room) => {
                const isActive = activeRoom?.id === room.id
                return (
                  <button
                    key={room.id}
                    onClick={() => { setActiveRoom(room); onSelectRoom?.(room) }}
                    className={cn(
                      "group relative w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300",
                      isActive 
                        ? "bg-indigo-500/10 ring-1 ring-indigo-500/30" 
                        : "hover:bg-white/5"
                    )}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="active-chat" 
                        className="absolute inset-0 rounded-2xl bg-indigo-500/5 -z-10" 
                      />
                    )}
                    <div className="relative">
                      <Avatar className="h-12 w-12 ring-2 ring-white/5">
                        <AvatarImage src={room.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
                          {room.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-500" />
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className={cn("font-bold text-sm truncate", isActive ? "text-white" : "text-slate-200")}>
                          {room.name}
                        </p>
                        {room.unreadCount! > 0 && (
                          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-black text-white shadow-lg shadow-rose-500/20">
                            {room.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate font-medium">
                        {room.lastMessage || 'Start a conversation...'}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </aside>
      )}

      {/* --- Main Chat Area --- */}
      <main className="flex-1 flex flex-col bg-gradient-to-b from-transparent to-white/[0.01]">
        
        {/* Header */}
        <header className="flex items-center justify-between p-4 px-6 border-b border-white/5 bg-white/[0.01] backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10 ring-1 ring-white/10">
              <AvatarImage src={activeRoom?.avatar} />
              <AvatarFallback className="bg-indigo-500 text-white font-bold">
                {activeRoom?.name?.charAt(0) ?? 'A'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-white text-sm">
                {mode === 'application' ? 'Applicant Portal' : activeRoom?.name}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Active Now</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5 text-slate-400"><PhoneCall className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5 text-slate-400"><VideoIcon className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5 text-slate-400"><MoreVertical className="w-4 h-4" /></Button>
          </div>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((message, idx) => {
                const isMe = message.senderId === currentUserId
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    key={message.id || idx} 
                    className={cn("flex group", isMe ? "justify-end" : "justify-start")}
                  >
                    <div className={cn("flex max-w-[75%] gap-3", isMe ? "flex-row-reverse" : "flex-row")}>
                      {!isMe && (
                        <Avatar className="h-8 w-8 mt-auto shrink-0 border border-white/10">
                          <AvatarFallback className="bg-slate-800 text-[10px] font-bold text-slate-400">
                            {message.senderName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className="space-y-1">
                        <div className={cn(
                          "relative p-4 shadow-xl",
                          isMe 
                            ? "rounded-3xl rounded-br-lg bg-indigo-600 text-white" 
                            : "rounded-3xl rounded-bl-lg bg-white/5 border border-white/10 text-slate-200"
                        )}>
                          <p className="text-sm leading-relaxed">{message.text}</p>
                          {message.imageUrl && <img src={message.imageUrl} alt="" className="mt-2 rounded-xl border border-white/10" />}
                        </div>
                        
                        <div className={cn("flex items-center gap-2 px-1", isMe ? "justify-end" : "justify-start")}>
                          <p className="text-[9px] font-bold uppercase tracking-tighter text-slate-500">
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {isMe && <CheckCheck className="w-3 h-3 text-indigo-400" />}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} className="h-2" />
          </div>
        </ScrollArea>

        {/* Footer Input */}
        <footer className="p-6 pt-2">
          <div className="relative glass-panel rounded-2xl border border-white/10 bg-white/[0.03] p-2 flex items-center gap-2 transition-all focus-within:ring-2 ring-indigo-500/50">
            <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:bg-white/5"><Paperclip className="w-5 h-5" /></Button>
            <Input 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)} 
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder="Write a message..." 
              className="border-0 bg-transparent text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0" 
            />
            <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:bg-white/5"><Smile className="w-5 h-5" /></Button>
            <Button 
              onClick={handleSend} 
              disabled={!chatInput.trim() || sending} 
              className="rounded-xl bg-indigo-600 px-5 shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 active:scale-95 transition-all"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizontal className="w-4 h-4" />}
            </Button>
          </div>
        </footer>
      </main>
    </div>
  )
}