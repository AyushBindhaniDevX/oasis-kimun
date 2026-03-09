'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ref, onValue, push, set, get } from 'firebase/database'
import { getDatabase } from '@/lib/firebase'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface Message {
  id: string
  sender: string
  senderName: string
  text: string
  timestamp: string
}

interface MessagingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationUid: string
  candidateName: string
  currentUserName: string
  currentUserId: string
}

export function MessagingDialog({
  open,
  onOpenChange,
  applicationUid,
  candidateName,
  currentUserName,
  currentUserId,
}: MessagingDialogProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!open) return

    setLoading(true)
    const db = getDatabase()
    const messagesRef = ref(db, `messages/${applicationUid}`)

    const unsubscribe = onValue(
      messagesRef,
      snapshot => {
        const data: Message[] = []
        snapshot.forEach(childSnapshot => {
          data.push({
            id: childSnapshot.key || '',
            ...childSnapshot.val(),
          })
        })
        // Sort by timestamp
        data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        setMessages(data)
        setLoading(false)
      },
      error => {
        console.error('Error loading messages:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [open, applicationUid])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setSending(true)
    try {
      const db = getDatabase()
      const messagesRef = ref(db, `messages/${applicationUid}`)
      const newMsgRef = push(messagesRef)

      await set(newMsgRef, {
        sender: currentUserId,
        senderName: currentUserName,
        text: newMessage.trim(),
        timestamp: new Date().toISOString(),
      })

      setNewMessage('')
      toast.success('Message sent')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Messages with {candidateName}</DialogTitle>
          <DialogDescription>
            Direct communication about the application
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No messages yet. Start the conversation!
              </p>
            ) : (
              messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === currentUserId ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs rounded-lg p-3 ${
                      message.sender === currentUserId
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-200 text-slate-900'
                    }`}
                  >
                    <p className="text-xs font-semibold mb-1">{message.senderName}</p>
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="border-t pt-4 space-y-2">
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            disabled={sending}
            rows={3}
            className="resize-none"
            onKeyDown={e => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleSendMessage()
              }
            }}
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={sending}
            >
              Close
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="gap-2"
            >
              {sending && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Message
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
