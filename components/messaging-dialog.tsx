'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import ChatPanel from '@/components/chat/ChatPanel'

interface MessagingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationUid: string
  candidateName: string
  currentUserName: string
  currentUserId: string
}

export function MessagingDialog({ open, onOpenChange, applicationUid, candidateName, currentUserName, currentUserId }: MessagingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[600px] p-0">
        <ChatPanel mode="application" id={applicationUid} currentUserId={currentUserId} currentUserName={currentUserName} showSidebar={false} />
      </DialogContent>
    </Dialog>
  )
}
