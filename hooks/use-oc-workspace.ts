'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { User } from 'firebase/auth'
import { ref, get, update, push, set, remove, onValue } from 'firebase/database'
import { getDatabase } from '@/lib/firebase'
import { toast } from 'sonner'
import type { ChatMessage, ChatRoom, OcStatistics } from '@/lib/dashboard/types'

const emptyStats: OcStatistics = {
  teamStats: { totalMembers: 0, activeMembers: 0, pendingInvites: 0, onLeave: 0, taskCompletion: 0 },
  taskStats: { total: 0, completed: 0, inProgress: 0, overdue: 0 },
  eventStats: { total: 0, upcoming: 0, past: 0 },
}

export function useOcWorkspace(user: User | null, enabled: boolean, displayName: string) {
  const [tasks, setTasks] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [statistics, setStatistics] = useState<OcStatistics>(emptyStats)

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [activeChatRoom, setActiveChatRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [showChatSidebar, setShowChatSidebar] = useState(true)
  const [typingUsers, setTypingUsers] = useState<{ userId: string; name: string }[]>([])

  const [taskData, setTaskData] = useState<Record<string, unknown>>({ priority: 'medium', status: 'todo' })
  const [eventData, setEventData] = useState<Record<string, unknown>>({ type: 'meeting', allDay: false, mandatory: false })
  const [inviteData, setInviteData] = useState({
    email: '',
    fullName: '',
    role: 'member',
    committee: '',
    message: '',
  })

  const buildChatRooms = useCallback(
    async (memberList: any[]) => {
      if (!user || memberList.length === 0) return
      const db = getDatabase()
      const rooms: ChatRoom[] = []

      const generalRoomRef = ref(db, 'chat/rooms/general')
      try {
        const generalSnapshot = await get(generalRoomRef)
        if (!generalSnapshot.exists()) {
          try {
            await set(generalRoomRef, {
              id: 'general',
              name: 'General',
              type: 'group',
              participants: memberList.map((m) => m.uid),
              createdAt: new Date().toISOString(),
              createdBy: user.uid,
            })
          } catch (e) {
            console.warn('Could not write general room (permission?):', e)
          }
        }
      } catch (e) {
        console.warn('Could not read general room (permission?):', e)
      }

      rooms.push({
        id: 'general',
        name: 'General',
        type: 'group',
        participants: memberList.map((m) => m.uid),
        unreadCount: 0,
      })

      for (const member of memberList) {
        if (member.uid !== user.uid) {
          const roomId = [user.uid, member.uid].sort().join('-')
          rooms.push({
            id: roomId,
            name: member.fullName,
            type: 'direct',
            participants: [user.uid, member.uid],
            unreadCount: 0,
            avatar: member.avatar,
          })
        }
      }
      setChatRooms(rooms)
    },
    [user]
  )

  useEffect(() => {
    if (!enabled || !user) return
    void buildChatRooms(members)
  }, [enabled, user, members, buildChatRooms])

  useEffect(() => {
    if (!enabled || !user) return

    const db = getDatabase()
    const unsubMembers = onValue(ref(db, 'oc/members'), (snapshot) => {
      if (snapshot.exists()) {
        setMembers(Object.values(snapshot.val()))
      } else {
        setMembers([])
      }
    })

    const unsubInvites = onValue(ref(db, 'oc/invitations'), (snapshot) => {
      if (snapshot.exists()) {
        setInvitations(Object.values(snapshot.val()))
      } else {
        setInvitations([])
      }
    })

    const unsubTasks = onValue(ref(db, 'oc/tasks'), (snapshot) => {
      if (snapshot.exists()) {
        const tasksData = Object.values(snapshot.val()) as any[]
        setTasks(tasksData)
        const completed = tasksData.filter((t) => t.status === 'completed').length
        setStatistics((prev) => ({
          ...prev,
          taskStats: {
            total: tasksData.length,
            completed,
            inProgress: tasksData.filter((t) => t.status === 'in_progress').length,
            overdue: tasksData.filter(
              (t) => t.status !== 'completed' && new Date(t.dueDate) < new Date()
            ).length,
          },
          teamStats: {
            ...prev.teamStats,
            taskCompletion: tasksData.length ? (completed / tasksData.length) * 100 : 0,
          },
        }))
      } else {
        setTasks([])
      }
    })

    const unsubEvents = onValue(ref(db, 'oc/events'), (snapshot) => {
      if (snapshot.exists()) {
        const eventsData = Object.values(snapshot.val()) as any[]
        setEvents(eventsData)
        setStatistics((prev) => ({
          ...prev,
          eventStats: {
            total: eventsData.length,
            upcoming: eventsData.filter((e) => new Date(e.startDate) > new Date()).length,
            past: eventsData.filter((e) => new Date(e.endDate) < new Date()).length,
          },
        }))
      } else {
        setEvents([])
      }
    })

    const unsubNotif = onValue(ref(db, `oc/notifications/${user.uid}`), (snapshot) => {
      if (snapshot.exists()) {
        const notifData: any[] = []
        snapshot.forEach((child) => {
          notifData.push({ id: child.key, ...child.val() })
        })
        setNotifications(notifData)
      } else {
        setNotifications([])
      }
    })

    return () => {
      unsubMembers()
      unsubInvites()
      unsubTasks()
      unsubEvents()
      unsubNotif()
    }
  }, [enabled, user])

  useEffect(() => {
    if (!enabled) return
    setStatistics((prev) => ({
      ...prev,
      teamStats: {
        ...prev.teamStats,
        totalMembers: members.length,
        activeMembers: members.filter((m) => m.status === 'active').length,
        pendingInvites: invitations.filter((i) => i.status === 'pending').length,
        onLeave: members.filter((m) => m.status === 'on_leave').length,
      },
    }))
  }, [enabled, members, invitations])

  useEffect(() => {
    if (!activeChatRoom || !user) {
      setMessages([])
      return
    }
    const db = getDatabase()
    const messagesRef = ref(db, `chat/messages/${activeChatRoom.id}`)
    const unsub = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const list: ChatMessage[] = []
        snapshot.forEach((childSnapshot) => {
          list.push({ id: childSnapshot.key || '', ...childSnapshot.val() })
        })
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        setMessages(list)
        const unread = list.filter(
          (m) => !m.readBy.includes(user.uid) && m.senderId !== user.uid
        )
        unread.forEach((msg) => {
          void update(ref(db, `chat/messages/${activeChatRoom.id}/${msg.id}`), {
            readBy: [...(msg.readBy || []), user.uid],
          })
        })
      } else {
        setMessages([])
      }
    })
    return () => unsub()
  }, [activeChatRoom, user])

  useEffect(() => {
    if (!activeChatRoom || !user) return
    const db = getDatabase()
    const typingRef = ref(db, `chat/typing/${activeChatRoom.id}`)
    const unsub = onValue(typingRef, (snapshot) => {
      if (snapshot.exists()) {
        const typingData = snapshot.val() as Record<string, { userId: string; name: string; timestamp: number }>
        const typing = Object.entries(typingData)
          .filter(([key, value]) => key !== user.uid && Date.now() - value.timestamp < 3000)
          .map(([, value]) => ({ userId: value.userId, name: value.name }))
        setTypingUsers(typing)
      } else {
        setTypingUsers([])
      }
    })
    return () => unsub()
  }, [activeChatRoom, user])

  const sendMessage = useCallback(async () => {
    if (!user || !chatInput.trim() || !activeChatRoom) return
    setSendingMessage(true)
    try {
      const db = getDatabase()
      const messageRef = push(ref(db, `chat/messages/${activeChatRoom.id}`))
      const message: ChatMessage = {
        id: messageRef.key!,
        senderId: user.uid,
        senderName: user.displayName || displayName || 'User',
        senderAvatar: user.photoURL || undefined,
        text: chatInput.trim(),
        createdAt: new Date().toISOString(),
        readBy: [user.uid],
      }
      await set(messageRef, message)
      await update(ref(db, `chat/rooms/${activeChatRoom.id}`), {
        lastMessage: chatInput.trim(),
        lastMessageTime: message.createdAt,
      })
      setChatInput('')
    } catch {
      toast.error('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }, [user, chatInput, activeChatRoom, displayName])

  const sendTypingIndicator = useCallback(async () => {
    if (!user || !activeChatRoom) return
    const db = getDatabase()
    const typingRef = ref(db, `chat/typing/${activeChatRoom.id}/${user.uid}`)
    await set(typingRef, {
      userId: user.uid,
      name: user.displayName || displayName,
      timestamp: Date.now(),
    })
    setTimeout(() => {
      void remove(typingRef)
    }, 2000)
  }, [user, activeChatRoom, displayName])

  const createTask = useCallback(async () => {
    if (!taskData.title) {
      toast.error('Please enter a task title')
      return false
    }
    try {
      const db = getDatabase()
      const taskRef = push(ref(db, 'oc/tasks'))
      const assignedTo = (taskData.assignedTo as string[]) || []
      const newTask = {
        id: taskRef.key!,
        title: taskData.title,
        description: (taskData.description as string) || '',
        assignedTo,
        assignedToNames: assignedTo.map((id: string) => {
          const member = members.find((m) => m.uid === id)
          return member?.fullName || id
        }),
        dueDate: (taskData.dueDate as string) || new Date().toISOString(),
        priority: taskData.priority,
        status: taskData.status,
        createdBy: user?.uid || '',
        createdByName: user?.displayName || 'Admin',
        createdAt: new Date().toISOString(),
        progress: 0,
      }
      await set(taskRef, newTask)
      toast.success('Task created successfully')
      setTaskData({ priority: 'medium', status: 'todo' })
      return true
    } catch {
      toast.error('Failed to create task')
      return false
    }
  }, [taskData, members, user])

  const updateTaskStatus = useCallback(
    async (taskId: string, status: string) => {
      try {
        const db = getDatabase()
        const updates: Record<string, unknown> = { status }
        if (status === 'completed') {
          updates.completedAt = new Date().toISOString()
          updates.completedBy = user?.uid
          updates.progress = 100
        }
        await update(ref(db, `oc/tasks/${taskId}`), updates)
        toast.success(`Task marked as ${status.replace('_', ' ')}`)
      } catch {
        toast.error('Failed to update task')
      }
    },
    [user]
  )

  const createEvent = useCallback(async () => {
    if (!eventData.title || !eventData.startDate || !eventData.endDate) {
      toast.error('Please fill in all required fields')
      return false
    }
    try {
      const db = getDatabase()
      const eventRef = push(ref(db, 'oc/events'))
      const attendees = (eventData.attendees as string[]) || []
      const newEvent = {
        id: eventRef.key!,
        title: eventData.title,
        description: (eventData.description as string) || '',
        type: eventData.type,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        allDay: Boolean(eventData.allDay),
        location: eventData.location,
        onlineLink: eventData.onlineLink,
        attendees,
        attendeeNames: attendees.map((id: string) => {
          const member = members.find((m) => m.uid === id)
          return member?.fullName || id
        }),
        createdBy: user?.uid || '',
        createdByName: user?.displayName || 'Admin',
        createdAt: new Date().toISOString(),
        mandatory: Boolean(eventData.mandatory),
      }
      await set(eventRef, newEvent)
      toast.success('Event created successfully')
      setEventData({ type: 'meeting', allDay: false, mandatory: false })
      return true
    } catch {
      toast.error('Failed to create event')
      return false
    }
  }, [eventData, members, user])

  const attendEvent = useCallback(
    async (eventId: string) => {
      try {
        const db = getDatabase()
        const event = events.find((e) => e.id === eventId)
        if (!event) return
        const updatedAttendees = [...(event.attendees || []), user?.uid]
        await update(ref(db, `oc/events/${eventId}`), { attendees: updatedAttendees })
        toast.success('Attendance confirmed')
      } catch {
        toast.error('Failed to confirm attendance')
      }
    },
    [events, user]
  )

  const handleInviteMember = useCallback(async () => {
    if (!inviteData.email || !inviteData.fullName || !inviteData.role || !inviteData.committee) {
      toast.error('Please fill in all required fields')
      return false
    }
    try {
      const db = getDatabase()
      const invitesRef = ref(db, 'oc/invitations')
      const newInviteRef = push(invitesRef)
      const token = Math.random().toString(36).substring(2, 15)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)
      const invitation = {
        id: newInviteRef.key!,
        email: inviteData.email,
        fullName: inviteData.fullName,
        role: inviteData.role,
        committee: inviteData.committee,
        invitedBy: user?.uid || '',
        invitedByName: user?.displayName || 'Admin',
        invitedAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        status: 'pending',
        token,
        message: inviteData.message,
      }
      await set(newInviteRef, invitation)
      toast.success('Invitation sent successfully')
      setInviteData({ email: '', fullName: '', role: 'member', committee: '', message: '' })
      return true
    } catch {
      toast.error('Failed to send invitation')
      return false
    }
  }, [inviteData, user])

  const resetTaskForm = useCallback(() => setTaskData({ priority: 'medium', status: 'todo' }), [])
  const resetEventForm = useCallback(() => setEventData({ type: 'meeting', allDay: false, mandatory: false }), [])

  const workspace = useMemo(
    () => ({
      tasks,
      events,
      members,
      invitations,
      notifications,
      statistics,
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
      taskData,
      setTaskData,
      eventData,
      setEventData,
      inviteData,
      setInviteData,
      sendMessage,
      sendTypingIndicator,
      createTask,
      updateTaskStatus,
      createEvent,
      attendEvent,
      handleInviteMember,
      resetTaskForm,
      resetEventForm,
    }),
    [
      tasks,
      events,
      members,
      invitations,
      notifications,
      statistics,
      chatRooms,
      activeChatRoom,
      messages,
      chatInput,
      sendingMessage,
      showChatSidebar,
      typingUsers,
      taskData,
      eventData,
      inviteData,
      sendMessage,
      sendTypingIndicator,
      createTask,
      updateTaskStatus,
      createEvent,
      attendEvent,
      handleInviteMember,
      resetTaskForm,
      resetEventForm,
    ]
  )

  return workspace
}
