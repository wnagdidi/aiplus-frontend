import { useEffect, useRef } from "react"
import EditorJS from "@editorjs/editorjs"
import Header from "@editorjs/header"
import List from "@editorjs/list"
import "./messageWrapper.css"
interface MessageWrapperProps {
  content: string
}
export const MessageWrapper: React.FC<MessageWrapperProps> = () => {
  const wrapperRef = useRef<HTMLDivElement>(null)

  const ejInstance = useRef<EditorJS>()

  useEffect(() => {
    if (!ejInstance.current) {
      initEditor()
    }
    return () => {
      ejInstance?.current?.destroy()
      ejInstance.current = undefined
    }
  }, [])
  const initEditor = () => {
    const editor = new EditorJS({
      holder: wrapperRef.current!,
      readOnly: true,
      onReady() {
        ejInstance.current = editor
        console.log("editor", editor)
      },
      minHeight: 26,
      tools: {
        header: {
          //@ts-ignore
          class: Header,
          config: {
            levels: [2, 3, 4],
            defaultLevel: 3,
          },
        },
        list: List,
      },
    })
  }
  return <div ref={wrapperRef}></div>
}

export default MessageWrapper
