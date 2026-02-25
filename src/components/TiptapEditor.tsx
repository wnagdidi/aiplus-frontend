'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Plugin } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import Placeholder from '@tiptap/extension-placeholder'
import { Extension } from '@tiptap/core'
import { wordsPattern } from '@/util/humanize'
import {useTranslations} from '@/hooks/useTranslations'
import { useEffect, useCallback, useMemo } from 'react'
import { isMobile } from '@/util/browser'
import './tiptapEditor.css'

interface TiptapEditorProps {
  defaultContent?: string
  onChange: (text: string) => void
  onInit: () => void
  maxWords: number
  clearFlag: number
}
export default function TiptapEditor({ defaultContent, onChange, onInit, maxWords, clearFlag }: TiptapEditorProps) {
  const t = useTranslations('Humanize')
  // const getMaxWordsInternal = () => maxWords
  // const getMaxWords = () => getMaxWordsInternal()

  // console.log(getMaxWords)
  const options = useMemo(
    () => ({
      extensions: [
        StarterKit,
        Extension.create({
          name: 'WordLimit',
          addProseMirrorPlugins() {
            return [WordLimitPlugin(maxWords)]
          },
        }),
        Placeholder.configure({
          emptyEditorClass: 'is-editor-empty',
          placeholder: t('mobile_imput_placeholder')
        })],
      content: defaultContent,
      immediatelyRender: false,
      onUpdate({ editor }) {
        onChange(editor.getText())
      },
      onCreate() {
        onInit && onInit()
      },
    }),
    [maxWords],
  )

  const editor = useEditor(options)

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(defaultContent)
    }
  }, [defaultContent, editor])

  useEffect(() => {
    // FIXME not working
    if (editor) {
      editor.setOptions(options)
    }
  }, [options])

  useEffect(() => {
    if (clearFlag > 0 && editor) {
      editor.commands.setContent('')
    }
  }, [clearFlag])

  return editor && <EditorContent editor={editor} style={{ height: '100%', overflowY: 'auto' }} />
}

const getDecorations = (doc, maxWords: number) => {
  const decorations = []
  let wordLeftCount = maxWords
  let match

  doc.descendants((node, pos) => {
    if (node.isText) {
      const pattern = wordsPattern(node.text)
      if (wordLeftCount <= 0) {
        decorations.push(Decoration.inline(pos, pos + node.text.length, { class: 'gray-out' }))
        return
      }

      while ((match = pattern.exec(node.text)) !== null) {
        if (wordLeftCount <= 0) {
          decorations.push(Decoration.inline(pos + match.index, pos + node.text.length, { class: 'gray-out' }))
          return
        } else {
          --wordLeftCount
        }
      }
    }
  })

  return DecorationSet.create(doc, decorations)
}

const WordLimitPlugin = (maxWords: number) => {
  return new Plugin({
    state: {
      init() {
        return DecorationSet.empty
      },
      apply(tr, oldState) {
        if (!tr.docChanged) return oldState
        return getDecorations(tr.doc, maxWords)
      },
    },
    props: {
      decorations(state) {
        return this.getState(state)
      },
    },
  })
}
