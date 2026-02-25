"use client"
import { createContext, useEffect, useRef, useState } from "react"
import { cloneDeep } from "lodash"
export interface MessageType {
  isSelf?: Boolean
  content?: string
  time?: String | Number
  isLoading?: Boolean
  useHumanizeTool?: Boolean
}
export interface ChatType {
  chatId: string
  messages: MessageType[]
  chatName?: string
  needContinueLoadMessage?: boolean
}
export const AvoidaiProChatContext = createContext<{
  chats: Array<ChatType>
  addMessages: (id?: string, messages?: MessageType[]) => void
  addLoadingMessage: (id?: string) => void
  removeLoadingMessage: (id?: string) => void
  resetChat: (chats?: ChatType) => void
  updateChatName: (id: string, name: string) => void
  openSetChatNameDialog: () => void
  closeSetChatNameDialog: () => void
  setChatNameDialogOpen: boolean
  removeChat?: (chatId?: string) => void
}>({
  chats: [],
  addMessages: () => {},
  addLoadingMessage: () => {},
  removeLoadingMessage: () => {},
  resetChat: () => {},
  openSetChatNameDialog: () => {},
  closeSetChatNameDialog: () => {},
  updateChatName: () => {},
  setChatNameDialogOpen: false,
})

export const AvoidaiProChatContextProvider = ({ children }: any) => {
  const [chats, setChats] = useState<ChatType[]>([])

  const [open, setOpen] = useState(false)

  const getNeedContinueLoadMessage = (chat: ChatType) => {
    let lastMessage = chat.messages[chat.messages.length - 1]
    if (lastMessage.isLoading) {
      lastMessage = chat.messages[chat.messages.length - 2]
    }
    const isLoad = !(chat.messages && !lastMessage.isSelf)
    return isLoad
  }

  const addMessages = (id?: string, messages?: MessageType[]) => {
    if (!messages?.length || !id) return
    setChats((prevChats) => {
      // 创建一个副本以避免直接修改原状态
      const newChats = cloneDeep(prevChats)
      for (const item of newChats) {
        if (item.chatId === id) {
          item.messages = [...item.messages, ...messages]
          return newChats
        }
      }
      // 如果未找到对应 chatId，添加新的 chat
      newChats.push({
        chatId: id,
        chatName: "Untitled Session Name",
        messages: [...messages],
      })
      return newChats
    })
  }
  const addLoadingMessage = (id?: string) => {
    if (!id) return
    const currentChat = chats.find((i) => i.chatId === id)
    if (currentChat?.messages.find((i) => i.isLoading)) return
    addMessages(id, [
      {
        isLoading: true,
      },
    ])
  }
  const removeLoadingMessage = (id?: string) => {
    if (!id) return
    setChats((prevChats) => {
      // 创建一个副本以避免直接修改原状态
      const newChats = cloneDeep(prevChats)
      for (const item of newChats) {
        if (item.chatId === id) {
          item.messages = item.messages.filter((i) => !i.isLoading)
          return newChats
        }
      }
      return newChats
    })
  }
  const resetChat = (chat?: ChatType) => {
    if (!chat?.chatId) return
    setChats((prevChats) => {
      // 创建一个副本以避免直接修改原状态
      const newChats = cloneDeep(prevChats)
      for (const item of newChats) {
        if (item.chatId === chat.chatId) {
          item.needContinueLoadMessage = getNeedContinueLoadMessage(chat)
          // const addLoadingMessageFlag = item.needContinueLoadMessage
          // const hasLoadingMessage =
          //   item.messages.findIndex((i) => i.isLoading) > -1
          item.chatName = chat.chatName
          item.messages = [...chat.messages].concat(
            item.needContinueLoadMessage ? [{ isLoading: true }] : []
          )
          return newChats
        }
      }
      const newChat = {
        ...chat,
        needContinueLoadMessage: getNeedContinueLoadMessage(chat),
      }
      newChats.push(newChat)
      return newChats
    })
  }
  const updateChatName = (id: string, name: string) => {
    setChats((prevChats) => {
      // 创建一个副本以避免直接修改原状态
      const newChats = cloneDeep(prevChats)
      for (const item of newChats) {
        if (item.chatId === id) {
          item.chatName = name
          return newChats
        }
      }
      return newChats
    })
  }

  // useEffect(()=>{

  // },[chats])
  // useEffect(() => {
  //   if (chats?.length) {
  //     localStorage.setItem("chats", JSON.stringify(chats))
  //   }
  // }, [chats])
  // useEffect(() => {
  //   const storageChats = localStorage.getItem("chats")
  //   if (storageChats) {
  //     setChats(JSON.parse(storageChats));
  //   }
  // }, [])
  const handleClose = () => {
    setOpen(false)
  }
  const openSetChatNameDialog = () => {
    setOpen(true)
  }
  return (
    <AvoidaiProChatContext.Provider
      value={{
        chats,
        addMessages,
        addLoadingMessage,
        removeLoadingMessage,
        resetChat,
        openSetChatNameDialog: openSetChatNameDialog,
        closeSetChatNameDialog: handleClose,
        setChatNameDialogOpen: open,
        updateChatName,
      }}
    >
      {children}
    </AvoidaiProChatContext.Provider>
  )
}
