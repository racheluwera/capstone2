'use client'

import { useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content
    }
  }, [content])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 p-2 border border-border rounded-t bg-card">
        <ToolbarButton onClick={() => execCommand('bold')} title="Bold">
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('italic')} title="Italic">
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('underline')} title="Underline">
          <u>U</u>
        </ToolbarButton>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <ToolbarButton onClick={() => execCommand('formatBlock', '<h1>')} title="Heading 1">
          H1
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('formatBlock', '<h2>')} title="Heading 2">
          H2
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('formatBlock', '<h3>')} title="Heading 3">
          H3
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('formatBlock', '<p>')} title="Paragraph">
          P
        </ToolbarButton>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <ToolbarButton onClick={() => execCommand('insertUnorderedList')} title="Bullet List">
          •
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('insertOrderedList')} title="Numbered List">
          1.
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('formatBlock', '<blockquote>')} title="Quote">
          "
        </ToolbarButton>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <ToolbarButton onClick={() => {
          const url = prompt('Enter URL:')
          if (url) execCommand('createLink', url)
        }} title="Insert Link">
          Link
        </ToolbarButton>
        <ToolbarButton onClick={() => {
          const url = prompt('Enter image URL:')
          if (url) execCommand('insertImage', url)
        }} title="Insert Image">
          Img
        </ToolbarButton>
      </div>

      <Card className="min-h-[400px] p-6 rounded-t-none border-t-0">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="outline-none prose prose-stone max-w-none"
          data-placeholder={placeholder}
          suppressContentEditableWarning
        />
      </Card>

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
        .prose h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 1.5rem 0 1rem;
          line-height: 1.2;
          font-family: Georgia, serif;
        }
        .prose h2 {
          font-size: 2rem;
          font-weight: 700;
          margin: 1.5rem 0 1rem;
          line-height: 1.3;
          font-family: Georgia, serif;
        }
        .prose h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1.25rem 0 0.75rem;
          line-height: 1.4;
          font-family: Georgia, serif;
        }
        .prose p {
          font-size: 1.125rem;
          line-height: 1.8;
          margin: 1rem 0;
          color: #1c1917;
        }
        .prose blockquote {
          border-left: 3px solid #e2e8f0;
          padding-left: 1.5rem;
          font-style: italic;
          color: #64748b;
          margin: 1.5rem 0;
        }
        .prose ul, .prose ol {
          margin: 1rem 0;
          padding-left: 2rem;
        }
        .prose li {
          margin: 0.5rem 0;
          line-height: 1.6;
        }
        .prose a {
          color: #0f172a;
          text-decoration: underline;
        }
        .prose img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
        }
      `}</style>
    </div>
  )
}

function ToolbarButton({ onClick, title, children }: { 
  onClick: () => void
  title: string
  children: React.ReactNode 
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="px-3 py-1 text-sm font-medium rounded hover:bg-accent transition-colors"
    >
      {children}
    </button>
  )
}
