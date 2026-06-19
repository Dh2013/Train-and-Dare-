import React, { useRef, useEffect, useCallback } from 'react';
import DOMPurify from 'dompurify';

const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'a', 'img'];
const ALLOWED_ATTR = ['href', 'src', 'alt', 'title'];

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
}

const BUTTONS: Array<{
  label: string;
  title: string;
  onClick: (exec: (command: string, value?: string) => void) => void;
}> = [
  { label: 'B', title: 'Gras', onClick: (exec) => exec('bold') },
  { label: 'I', title: 'Italique', onClick: (exec) => exec('italic') },
  { label: 'U', title: 'Souligne', onClick: (exec) => exec('underline') },
  { label: 'H1', title: 'Titre H1', onClick: (exec) => exec('formatBlock', 'h1') },
  { label: 'H2', title: 'Titre H2', onClick: (exec) => exec('formatBlock', 'h2') },
  { label: 'H3', title: 'Titre H3', onClick: (exec) => exec('formatBlock', 'h3') },
  { label: 'P', title: 'Paragraphe', onClick: (exec) => exec('formatBlock', 'p') },
  { label: 'Bullets', title: 'Liste a puces', onClick: (exec) => exec('insertUnorderedList') },
  { label: 'Numbers', title: 'Liste numerotee', onClick: (exec) => exec('insertOrderedList') },
  { label: 'Quote', title: 'Bloc de citation', onClick: (exec) => exec('formatBlock', 'blockquote') },
];

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Ecrivez votre contenu...',
  minHeight = 320,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const getHtml = useCallback(() => ref.current?.innerHTML || '', []);

  const setHtml = useCallback((html: string) => {
    if (!ref.current) {
      return;
    }
    ref.current.innerHTML = sanitizeHtml(html) || '';
  }, []);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    if (ref.current.innerHTML !== value) {
      setHtml(value || '');
    }
  }, [value, setHtml]);

  const handleInput = () => {
    onChange(sanitizeHtml(getHtml()));
  };

  const exec = (command: string, commandValue?: string) => {
    document.execCommand(command, false, commandValue);
    ref.current?.focus();
    handleInput();
  };

  const insertLink = () => {
    const url = window.prompt('URL du lien :', 'https://');
    if (url) {
      exec('createLink', url);
    }
  };

  const insertImage = () => {
    const url = window.prompt("URL de l'image :", 'https://');
    if (url) {
      exec('insertImage', url);
    }
  };

  return (
    <div className={className}>
      <div className="blog-editor-toolbar">
        {BUTTONS.map((button) => (
          <button key={button.label} type="button" title={button.title} onClick={() => button.onClick(exec)}>
            {button.label}
          </button>
        ))}
        <button type="button" title="Lien" onClick={insertLink}>
          Link
        </button>
        <button type="button" title="Image" onClick={insertImage}>
          Image
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        data-placeholder={placeholder}
        onInput={handleInput}
        className="blog-editor-content blog-rich-content"
        style={{ minHeight }}
        suppressContentEditableWarning
      />
      <style>{`
        [contenteditable][data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
