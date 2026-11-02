import React, { useEffect, useId, useRef, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import {
  ArrowUp,
  ArrowUpDown,
  Bot,
  Check,
  ChevronRight,
  Copy,
  FileText,
  Globe,
  LoaderCircle,
  Minimize2,
  Paperclip,
  Play,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Square,
  X,
  Pencil,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Select } from './select';
import { PillGroup } from './pill';
import './controls.css';
import './ai.css';

type AgentState = 'idle' | 'running' | 'waiting' | 'completed' | 'failed' | 'cancelled';
const states: AgentState[] = ['idle', 'running', 'waiting', 'completed', 'failed', 'cancelled'];
const labels: Record<AgentState, string> = {
  idle: 'Idle',
  running: 'Running',
  waiting: 'Awaiting approval',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
};
const tones: Record<AgentState, string> = {
  idle: '',
  running: 'badge-info',
  waiting: 'badge-warning',
  completed: 'badge-success',
  failed: 'badge-danger',
  cancelled: '',
};
const answer = `### A quieter, more focused workspace\n\nHere’s a small plan for the next iteration. Everything below is **sample content**, generated locally for this demo.\n\n| Priority | Improvement | Effort |\n| :--- | :--- | :--- |\n| 01 | Simplify the navigation | Small |\n| 02 | Make progress visible | Medium |\n| 03 | Keep actions close to content | Small |\n\n\`\`\`tsx\nconst workspace = {\n  theme: 'soft-dark',\n  focus: true,\n};\n\`\`\`\n\nStart with navigation, then validate the flow with your team.`;
const snippet = `export const workspace = {\n  name: 'Palace',\n  theme: 'soft-dark',\n  autosave: true,\n  collaborators: 4,\n};`;

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [feedback, setFeedback] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setFeedback('Copied');
    } catch {
      setFeedback('Copy unavailable');
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setFeedback(''), 2200);
  }
  return (
    <button className="btn btn-ghost ai-copy" aria-label={feedback || label} onClick={copy}>
      {feedback === 'Copied' ? <Check size={14} /> : <Copy size={14} />}
      <span aria-live="polite">{feedback || label}</span>
    </button>
  );
}

function Highlight({ text }: { text: string }) {
  // Token text is escaped by React; no HTML injection.
  return (
    <>
      {text
        .split(/((?:'[^'\n]*'|"[^"\n]*")|\b(?:export|const|let|return|true|false|null)\b|\b\d+(?:\.\d+)?\b)/g)
        .map((token, i) => (
          <span
            key={i}
            className={
              /^['"]/.test(token)
                ? 'ai-token-string'
                : /^(export|const|let|return|true|false|null)$/.test(token)
                  ? 'ai-token-keyword'
                  : /^\d/.test(token)
                    ? 'ai-token-number'
                    : undefined
            }
          >
            {token}
          </span>
        ))}
    </>
  );
}

export function Markdown({ children }: { children: string }) {
  return (
    <div className="ai-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          pre: ({ children: content }) => (
            <div className="ai-code-scroll">
              <pre className="code-block">{content}</pre>
            </div>
          ),
          code: ({ className, children: content }) => {
            const text = String(content).replace(/\n$/, '');
            return className || text.includes('\n') ? (
              <span className="ai-code-content">
                <span className="ai-code-heading">
                  <span>{className?.replace('language-', '') || 'code'}</span>
                  <CopyButton text={text} label="Copy code" />
                </span>
                <code className={className}>
                  <Highlight text={String(content)} />
                </code>
              </span>
            ) : (
              <code className="ai-inline-code">{content}</code>
            );
          },
          table: ({ children: content }) => (
            <div className="ai-table-scroll" tabIndex={0} role="region" aria-label="Markdown table">
              <table>{content}</table>
            </div>
          ),
          img: ({ alt }) => <span className="muted">[Image omitted: {alt || 'external image'}]</span>,
          a: ({ children: content }) => <span className="ai-link-text">{content}</span>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

type PreviewContent = { title: string; text?: string; image?: string };
function PreviewDialog({ content, close }: { content: PreviewContent | null; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (!content || !dialog.current) return;
    const trigger = document.activeElement as HTMLElement | null;
    dialog.current.showModal();
    return () => {
      dialog.current?.close();
      if (trigger?.isConnected) trigger.focus();
    };
  }, [content]);
  return (
    <dialog
      ref={dialog}
      className="ai-dialog"
      aria-labelledby={titleId}
      onCancel={close}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const r = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < r.left ||
            event.clientX > r.right ||
            event.clientY < r.top ||
            event.clientY > r.bottom
          )
            close();
        }
      }}
    >
      <div className="ai-dialog-head">
        <div>
          <span className="section-label">LOCAL PREVIEW</span>
          <h3 id={titleId}>{content?.title}</h3>
        </div>
        <button className="icon-btn" aria-label="Close preview" onClick={close}>
          <X size={18} />
        </button>
      </div>
      {content?.image ? (
        <img className="ai-image-preview" src={content.image} alt={content.title} />
      ) : (
        <Markdown>{content?.text || 'No content to preview.'}</Markdown>
      )}
      <p className="muted ai-footnote">Preview only · no file is uploaded, executed, or verified.</p>
    </dialog>
  );
}

export function AgentTimeline() {
  const [state, setState] = useState<AgentState>('waiting');
  const [step, setStep] = useState(1);
  const [expanded, setExpanded] = useState(true);
  const timelineId = useId();
  useEffect(() => {
    if (state !== 'running') return;
    const timer = setTimeout(() => {
      if (step < 2) {
        setStep(2);
        setState('waiting');
      } else {
        setStep(3);
        setState('completed');
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [state, step]);
  const detail: Record<AgentState, string> = {
    idle: 'Ready to start the local example. No tools or network requests will run.',
    running: step < 2 ? 'Organizing the sample plan…' : 'Preparing the local preview…',
    waiting: 'Allow the demo to prepare a local Markdown preview? No files will be changed.',
    completed: 'Local sample prepared. This does not indicate real tool execution or verification.',
    failed: 'Simulated preparation error. Retry resets the example.',
    cancelled: 'The demo has stopped. No pending operations remain.',
  };
  return (
    <section className="card ai-agent">
      <div className="ai-panel-head">
        <div className="row">
          <Sparkles size={17} />
          <h3>Agent activity</h3>
        </div>
        <span className={`badge ${tones[state]}`}>{labels[state]}</span>
      </div>
      <div className="ai-state-tabs">
        <PillGroup
          label="Agent state samples"
          value={state}
          onChange={(v) => {
            const s = v as AgentState;
            setState(s);
            setStep(s === 'completed' ? 3 : s === 'waiting' ? 2 : 0);
          }}
          options={states.map((s) => ({ value: s, label: labels[s] }))}
        />
      </div>
      <button
        className="btn btn-ghost ai-timeline-toggle"
        aria-expanded={expanded}
        aria-controls={timelineId}
        onClick={() => setExpanded(!expanded)}
      >
        <ChevronRight size={14} className={expanded ? 'ai-chevron-open' : ''} />
        {expanded ? 'Hide steps' : 'Show steps'}
      </button>
      <ol id={timelineId} hidden={!expanded} className="ai-timeline">
        {['Understand the request', 'Plan the changes', 'Prepare preview'].map((title, i) => (
          <li key={title} className={i < step ? 'ai-step-done' : i === step ? 'ai-step-current' : ''}>
            <span className="ai-step-dot">{i < step ? <Check size={12} /> : i + 1}</span>
            <span>{title}</span>
            <span className="muted">{i < step ? 'Done' : i === step ? labels[state] : 'Pending'}</span>
          </li>
        ))}
      </ol>
      <p className="ai-agent-detail" role="status">
        {detail[state]}
      </p>
      <div className="row ai-wrap">
        {state === 'waiting' ? (
          <>
            <button
              className="btn btn-primary"
              onClick={() => {
                setStep(2);
                setState('running');
              }}
            >
              <ShieldCheck size={15} />
              Approve demo
            </button>
            <button className="btn btn-secondary" onClick={() => setState('cancelled')}>
              Refuse
            </button>
          </>
        ) : state === 'running' ? (
          <button className="btn btn-secondary" onClick={() => setState('cancelled')}>
            <Square size={14} />
            Stop
          </button>
        ) : (
          <button
            className="btn btn-secondary"
            onClick={() => {
              setStep(0);
              setState('running');
            }}
          >
            {state === 'idle' ? <Play size={14} /> : <RotateCcw size={14} />}
            {state === 'idle' ? 'Start demo' : 'Run again'}
          </button>
        )}
        <span className="muted ai-footnote">DEMO · simulated activity</span>
      </div>
    </section>
  );
}

type Message = { role: 'user' | 'assistant'; text: string };
type Attachment = { name: string; file: File };
export function AIPreview() {
  const [draft, setDraft] = useState('');
  const [model, setModel] = useState('Palace balanced');
  const [reasoning, setReasoning] = useState(true);
  const [web, setWeb] = useState(false);
  const [compressed, setCompressed] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const [sample, setSample] = useState('ready');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'user', text: 'Help me make this workspace feel a little more focused.' },
    { role: 'assistant', text: answer },
  ]);
  const [streaming, setStreaming] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [notice, setNotice] = useState('');
  const [preview, setPreview] = useState<PreviewContent | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const streamPosition = useRef(0);
  const messageList = useRef<HTMLDivElement>(null);
  const followBottom = useRef(true);
  const [atBottom, setAtBottom] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);
  const olderOffset = useRef<{ height: number; top: number } | null>(null);
  const firstVisible = Math.max(0, messages.length - visibleCount);
  useEffect(() => {
    const list = messageList.current;
    if (!list) return;
    if (olderOffset.current) {
      list.scrollTop = olderOffset.current.top + list.scrollHeight - olderOffset.current.height;
      olderOffset.current = null;
    } else if (followBottom.current) list.scrollTop = list.scrollHeight;
  }, [messages, visibleCount, sample]);
  function jumpToBottom() {
    followBottom.current = true;
    setAtBottom(true);
    if (messageList.current) messageList.current.scrollTop = messageList.current.scrollHeight;
  }
  function loadOlder() {
    const list = messageList.current;
    if (list) olderOffset.current = { height: list.scrollHeight, top: list.scrollTop };
    setVisibleCount((count) => count + 10);
  }
  const urls = useRef<string[]>([]);
  useEffect(() => () => urls.current.forEach((url) => URL.revokeObjectURL(url)), []);
  useEffect(() => {
    if (textarea.current) {
      textarea.current.style.height = 'auto';
      textarea.current.style.height = `${Math.min(textarea.current.scrollHeight, 180)}px`;
    }
  }, [draft]);
  useEffect(() => {
    if (!streaming) return;
    const timer = setInterval(() => {
      streamPosition.current += 24;
      const text = answer.slice(0, streamPosition.current);
      setMessages((previous) => [...previous.slice(0, -1), { role: 'assistant', text }]);
      if (streamPosition.current >= answer.length) setStreaming(false);
    }, 45);
    return () => clearInterval(timer);
  }, [streaming]);
  function begin(text = draft) {
    if (!text.trim() || streaming || sample === 'offline') return;
    setMessages((previous) => [
      ...previous,
      { role: 'user', text: text.trim() },
      { role: 'assistant', text: '' },
    ]);
    setDraft('');
    setAttachments([]);
    setSample('ready');
    streamPosition.current = 0;
    setStreaming(true);
    setNotice('Local demo started. Attachments are not processed.');
  }
  function retry() {
    if (streaming || sample === 'offline') return;
    setSample('ready');
    setMessages((previous) => [
      ...(previous.at(-1)?.role === 'assistant' ? previous.slice(0, -1) : previous),
      { role: 'assistant', text: '' },
    ]);
    streamPosition.current = 0;
    setStreaming(true);
  }
  async function choose(files: FileList | null) {
    if (!files) return;
    const accepted: Attachment[] = [];
    const errors: string[] = [];
    for (const file of Array.from(files)) {
      const safeImage = /^image\/(png|jpeg|webp|gif)$/.test(file.type);
      const safeText =
        /^(text\/(plain|markdown|csv)|application\/json)$/.test(file.type) ||
        (!file.type && /\.(txt|md|csv|json|log)$/i.test(file.name));
      if (file.size > 5 * 1024 * 1024) errors.push(`${file.name}: exceeds 5 MB.`);
      else if (!safeImage && !safeText)
        errors.push(`${file.name}: only plain text, Markdown, CSV, JSON, PNG, JPEG, WebP, or GIF allowed.`);
      else accepted.push({ name: file.name, file });
    }
    setAttachments((previous) => [...previous, ...accepted]);
    setNotice(errors.join(' ') || `${accepted.length} local attachment(s) added. Nothing is uploaded.`);
    if (input.current) input.current.value = '';
  }
  async function previewAttachment(item: Attachment) {
    try {
      if (item.file.type.startsWith('image/')) {
        const image = URL.createObjectURL(item.file);
        urls.current.push(image);
        setPreview({ title: item.name, image });
      } else setPreview({ title: item.name, text: (await item.file.text()).slice(0, 50000) });
    } catch {
      setNotice('Unable to read this local file. Please choose it again.');
    }
  }
  return (
    <div className="ai-root stack">
      <header className="ai-titlebar">
        <div>
          <span className="section-label">INTELLIGENCE, IN CONTEXT</span>
          <h2>Make room for your next idea.</h2>
          <p className="muted">A thoughtful assistant, right where you work.</p>
        </div>
        <span className="badge badge-info">DEMO · local only</span>
      </header>
      <div className="ai-workspace">
        <section className="card ai-chat">
          <div className="ai-panel-head">
            <div className="row">
              <span className="ai-avatar">
                <Sparkles size={17} />
              </span>
              <div>
                <h3>Palace assistant</h3>
                <span className="muted ai-footnote">No backend connected</span>
              </div>
            </div>
            <Select
              label="Conversation sample"
              hideLabel
              size="sm"
              value={sample}
              onChange={(v) => {
                setStreaming(false);
                setSample(v);
              }}
              options={['ready', 'empty', 'loading', 'error', 'offline'].map((s) => ({
                value: s,
                label: `${s[0].toUpperCase() + s.slice(1)} sample`,
              }))}
            />
          </div>
          <div
            ref={messageList}
            className="ai-messages"
            onScroll={(event) => {
              const list = event.currentTarget;
              const bottom = list.scrollHeight - list.scrollTop - list.clientHeight < 48;
              followBottom.current = bottom;
              setAtBottom(bottom);
            }}
            aria-busy={streaming || sample === 'loading'}
          >
            {sample === 'ready' && firstVisible > 0 && (
              <button className="btn btn-secondary ai-load-older" onClick={loadOlder}>
                Load older messages ({firstVisible})
              </button>
            )}
            {sample === 'empty' ? (
              <div className="ai-empty">
                <Sparkles size={30} />
                <h3>A fresh starting point</h3>
                <p className="muted">Choose an idea or write your own.</p>
                <button
                  className="btn btn-secondary"
                  onClick={() => setDraft('Help me plan a calmer workspace.')}
                >
                  Plan a calmer workspace
                  <ChevronRight size={15} />
                </button>
              </div>
            ) : sample === 'loading' ? (
              <div className="ai-empty" role="status">
                <LoaderCircle className="ai-spin" size={26} />
                <p>Loading sample conversation…</p>
                <button className="btn btn-secondary" onClick={() => setSample('ready')}>
                  Finish loading demo
                </button>
              </div>
            ) : sample === 'error' || sample === 'offline' ? (
              <div className="ai-empty" role="status">
                <Bot size={30} />
                <h3>{sample === 'error' ? 'Something interrupted the demo' : 'You’re offline'}</h3>
                <p className="muted">
                  {sample === 'error'
                    ? 'This is a simulated error, not a failed backend request.'
                    : 'Offline sample: your draft stays here. No connection is checked.'}
                </p>
                <button className="btn btn-secondary" onClick={() => setSample('ready')}>
                  <RotateCcw size={15} />
                  Return to local demo
                </button>
              </div>
            ) : (
              messages.slice(firstVisible).map((message, index) => {
                const i = firstVisible + index;
                return (
                  <article className={`ai-message ai-message-${message.role}`} key={i}>
                    <div className="ai-message-meta">
                      <span className={`ai-avatar ${message.role === 'user' ? 'ai-avatar-user' : ''}`}>
                        {message.role === 'user' ? 'Y' : <Sparkles size={14} />}
                      </span>
                      <strong>{message.role === 'user' ? 'You' : 'Palace'}</strong>
                      <span className="muted ai-footnote">
                        {message.role === 'assistant' ? 'Demo response' : 'Just now'}
                      </span>
                    </div>
                    <div className="ai-message-body">
                      <Markdown>{message.text || 'Preparing local sample…'}</Markdown>
                      {message.role === 'assistant' && !(streaming && i === messages.length - 1) && (
                        <div className="row ai-message-actions">
                          <CopyButton text={message.text} />
                          <button className="btn btn-ghost" disabled={streaming} onClick={retry}>
                            <RotateCcw size={14} />
                            Retry
                          </button>
                        </div>
                      )}
                      {message.role === 'user' && (
                        <button
                          className="btn btn-ghost"
                          disabled={streaming}
                          onClick={() => {
                            setDraft(message.text);
                            textarea.current?.focus();
                          }}
                        >
                          <Pencil size={13} />
                          Edit in composer
                        </button>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
          {!atBottom && sample === 'ready' && (
            <button className="btn btn-secondary ai-jump" onClick={jumpToBottom}>
              Jump to latest
              <ArrowUp size={14} className="ai-arrow-down" />
            </button>
          )}
          <form
            className="ai-composer"
            onSubmit={(e) => {
              e.preventDefault();
              begin();
            }}
          >
            <textarea
              ref={textarea}
              className="field ai-textarea"
              aria-label="Message Palace assistant"
              placeholder="Ask anything, or start with a small idea…"
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  begin();
                }
              }}
            />
            {attachments.length > 0 && (
              <div className="ai-attachments">
                {attachments.map((item, i) => (
                  <span className="ai-attachment" key={`${item.name}-${i}`}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => void previewAttachment(item)}
                    >
                      <FileText size={14} />
                      {item.name}
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => setAttachments((previous) => previous.filter((_, n) => n !== i))}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="ai-composer-tools">
              <input
                type="file"
                multiple
                accept=".txt,.md,.csv,.json,.log,image/png,image/jpeg,image/webp,image/gif"
                ref={input}
                className="ai-hidden"
                onChange={(e) => void choose(e.target.files)}
              />
              <Popover.Root open={plusOpen} onOpenChange={setPlusOpen}>
                <Popover.Trigger asChild>
                  <button
                    type="button"
                    className="icon-btn ai-plus"
                    aria-label="更多选项：附件、模型与模式"
                    aria-haspopup="menu"
                    aria-expanded={plusOpen}
                  >
                    <Plus size={18} />
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content className="ai-plus-menu" side="top" align="start" sideOffset={8} collisionPadding={12}>
                    <button
                      type="button"
                      role="menuitem"
                      className="ai-menu-item"
                      onClick={() => {
                        setPlusOpen(false);
                        input.current?.click();
                      }}
                    >
                      <Paperclip size={15} />
                      <span>添加附件</span>
                      <span className="ai-menu-hint">≤ 5 MB</span>
                    </button>
                    <div className="ai-menu-group" role="group" aria-label="模型">
                      <span className="ai-menu-label">模型</span>
                      <Select
                        label="AI model"
                        hideLabel
                        size="sm"
                        className="ai-model"
                        value={model}
                        onChange={setModel}
                        options={[
                          { value: 'Palace balanced', label: 'Palace balanced' },
                          { value: 'Palace fast', label: 'Palace fast' },
                          { value: 'Palace deep', label: 'Palace deep' },
                        ]}
                      />
                    </div>
                    <div className="ai-menu-toggles" role="group" aria-label="模式">
                      <button
                        type="button"
                        role="menuitemcheckbox"
                        aria-checked={reasoning}
                        className="ai-menu-toggle"
                        onClick={() => setReasoning(!reasoning)}
                      >
                        <Sparkles size={15} />
                        <span>深度思考</span>
                        <span className="ai-menu-switch" data-on={reasoning || undefined} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        role="menuitemcheckbox"
                        aria-checked={web}
                        className="ai-menu-toggle"
                        onClick={() => setWeb(!web)}
                      >
                        <Globe size={15} />
                        <span>联网搜索</span>
                        <span className="ai-menu-switch" data-on={web || undefined} aria-hidden="true" />
                      </button>
                    </div>
                    <button
                      type="button"
                      role="menuitemcheckbox"
                      aria-checked={compressed}
                      className="ai-menu-item"
                      onClick={() => {
                        setCompressed(!compressed);
                        setNotice(compressed ? '已恢复完整上下文。' : '已压缩较早的上下文，保留关键结论。');
                      }}
                    >
                      <Minimize2 size={15} />
                      <span>压缩上下文</span>
                      <span className="ai-menu-hint">{compressed ? '已压缩' : '未压缩'}</span>
                    </button>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
              <p className="ai-composer-state muted" aria-live="off">
                <span>{model}</span>
                {reasoning && <span>深度思考</span>}
                {web && <span>联网</span>}
                {compressed && <span>已压缩</span>}
              </p>
              {streaming ? (
                <button
                  type="button"
                  className="icon-btn ai-send"
                  aria-label="Stop demo response"
                  onClick={() => {
                    setStreaming(false);
                    setNotice('Demo response stopped. Use Retry to restart.');
                  }}
                >
                  <Square size={17} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="icon-btn ai-send"
                  aria-label="Send message to local demo"
                  disabled={!draft.trim() || sample === 'offline'}
                >
                  <ArrowUp size={19} />
                </button>
              )}
            </div>
            <p className="muted ai-footnote">
              Enter 发送 · Shift + Enter 换行{web ? ' · 联网为模拟，不发送请求' : ''}
            </p>
            <p className="ai-notice" role="status">
              {notice}
            </p>
          </form>
        </section>
        <aside className="stack ai-side">
          <AgentTimeline />
          <section className="card ai-artifact">
            <div className="ai-panel-head">
              <h3>Artifacts</h3>
              <span className="badge">1 sample</span>
            </div>
            <button
              className="ai-artifact-button"
              onClick={() => setPreview({ title: 'Workspace improvement plan', text: answer })}
            >
              <span className="ai-file-icon">
                <FileText size={22} />
              </span>
              <span>
                <strong>Workspace improvement plan</strong>
                <span className="muted">Markdown · local sample</span>
              </span>
              <ChevronRight size={17} />
            </button>
            <p className="muted ai-footnote">
              Open an actual preview. No generated file or verification is implied.
            </p>
          </section>
          <div className="ai-demo-note">
            <ShieldCheck size={17} />
            <p>
              Designed for exploration.
              <br />
              <span className="muted">
                Messages, models, reasoning, and web access are simulated. Attachments stay in your browser.
              </span>
            </p>
          </div>
        </aside>
      </div>
      <PreviewDialog content={preview} close={() => setPreview(null)} />
    </div>
  );
}

const records: { name: string; type: string; size: number; state: AgentState; text: string }[] = [
  {
    name: 'workspace.config.ts',
    type: 'TypeScript',
    size: 218,
    state: 'completed',
    text: `\`\`\`ts\n${snippet}\n\`\`\``,
  },
  {
    name: 'design-notes.md',
    type: 'Markdown',
    size: 1420,
    state: 'waiting',
    text: '# Design notes\n\nKeep the interface quiet.\n\n- Lead with content\n- Use clear, reversible actions\n- Prefer visible progress',
  },
  {
    name: 'navigation-audit.csv',
    type: 'CSV',
    size: 864,
    state: 'running',
    text: '```csv\nsection,items,priority\nWorkspace,4,high\nProjects,8,medium\nArchive,2,low\n```',
  },
  {
    name: 'release-checklist.md',
    type: 'Markdown',
    size: 620,
    state: 'idle',
    text: '# Release checklist\n\n- [ ] Review navigation\n- [ ] Check keyboard access\n- [ ] Test responsive layout',
  },
  {
    name: 'import-example.json',
    type: 'JSON',
    size: 316,
    state: 'failed',
    text: '```json\n{ "sample": true, "reason": "Simulated import error" }\n```',
  },
  {
    name: 'previous-session.txt',
    type: 'Text',
    size: 105,
    state: 'cancelled',
    text: 'This local example was stopped by the user. No real operation took place.',
  },
];
export function DataPreview() {
  const [sort, setSort] = useState<'name' | 'size' | 'state'>('name');
  const [asc, setAsc] = useState(true);
  const [preview, setPreview] = useState<PreviewContent | null>(null);
  const [filter, setFilter] = useState('');
  const [sample, setSample] = useState('ready');
  const sorted = records
    .filter((r) => r.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => (sort === 'size' ? a.size - b.size : a[sort].localeCompare(b[sort])) * (asc ? 1 : -1));
  function changeSort(key: typeof sort) {
    if (sort === key) setAsc(!asc);
    else {
      setSort(key);
      setAsc(true);
    }
  }
  return (
    <div className="ai-root stack">
      <header className="ai-titlebar">
        <div>
          <span className="section-label">STRUCTURE, WITHOUT THE NOISE</span>
          <h2>A clear view of the details.</h2>
          <p className="muted">Tables, files, and code that feel at home.</p>
        </div>
        <span className="badge">LOCAL SAMPLE DATA</span>
      </header>
      <section className="card ai-data">
        <div className="ai-panel-head">
          <div>
            <h3>Workspace files</h3>
            <span className="muted ai-footnote">Six sample files · nothing read from disk</span>
          </div>
          <div className="row ai-wrap">
            <input
              className="field"
              aria-label="Filter sample files"
              placeholder="Filter files…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <Select
              label="Data sample state"
              hideLabel
              size="sm"
              value={sample}
              onChange={setSample}
              options={['ready', 'empty', 'loading', 'error', 'offline'].map((s) => ({ value: s, label: s }))}
            />
          </div>
        </div>
        {sample !== 'ready' ? (
          <div className="ai-empty" role="status">
            {sample === 'loading' && <LoaderCircle className="ai-spin" size={24} />}
            <h3>
              {sample === 'empty'
                ? 'No files yet'
                : sample === 'loading'
                  ? 'Loading sample files…'
                  : sample === 'error'
                    ? 'Could not load this example'
                    : 'Offline sample'}
            </h3>
            <p className="muted">
              {sample === 'empty'
                ? 'Add files in your real workspace to see them here.'
                : 'This state is simulated. No network request was made.'}
            </p>
            <button className="btn btn-secondary" onClick={() => setSample('ready')}>
              Show local sample
            </button>
          </div>
        ) : (
          <div className="ai-table-scroll" tabIndex={0} role="region" aria-label="Sample file table">
            <table className="ai-data-table">
              <thead>
                <tr>
                  {(['name', 'size', 'state'] as const).map((key) => (
                    <th key={key} aria-sort={sort === key ? (asc ? 'ascending' : 'descending') : 'none'}>
                      <button className="btn btn-ghost" onClick={() => changeSort(key)}>
                        {key === 'name' ? 'Name' : key === 'size' ? 'Size' : 'Status'}
                        <ArrowUpDown size={13} />
                      </button>
                    </th>
                  ))}
                  <th>
                    <span className="ai-sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((file) => (
                  <tr key={file.name}>
                    <td>
                      <span className="row">
                        <FileText size={16} />
                        <span>
                          <strong>{file.name}</strong>
                          <small className="muted">{file.type}</small>
                        </span>
                      </span>
                    </td>
                    <td className="mono muted">
                      {file.size < 1024 ? `${file.size} B` : `${(file.size / 1024).toFixed(1)} KB`}
                    </td>
                    <td>
                      <span className={`badge ${tones[file.state]}`}>{labels[file.state]}</span>
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost"
                        aria-label={`Preview ${file.name}`}
                        onClick={() => setPreview({ title: file.name, text: file.text })}
                      >
                        Preview
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!sorted.length && <p className="ai-empty">No files match “{filter}”.</p>}
          </div>
        )}
      </section>
      <div className="ai-data-bottom">
        <section className="card ai-data-code">
          <div className="ai-panel-head">
            <div className="row">
              <FileText size={16} />
              <h3>workspace.config.ts</h3>
            </div>
            <span className="badge badge-info">TypeScript</span>
          </div>
          <Markdown>{`\`\`\`tsx\n${snippet}\n\`\`\``}</Markdown>
          <p className="muted ai-footnote">Static sample · displayed as text, never executed</p>
        </section>
        <section className="card ai-file-list">
          <div className="ai-panel-head">
            <h3>Recent attachments</h3>
            <span className="badge">3 files</span>
          </div>
          {records.slice(0, 3).map((file) => (
            <button
              className="ai-artifact-button"
              key={file.name}
              onClick={() => setPreview({ title: file.name, text: file.text })}
            >
              <span className="ai-file-icon">
                <FileText size={19} />
              </span>
              <span>
                <strong>{file.name}</strong>
                <span className="muted">{file.type} · preview available</span>
              </span>
              <ChevronRight size={16} />
            </button>
          ))}
        </section>
      </div>
      <PreviewDialog content={preview} close={() => setPreview(null)} />
    </div>
  );
}
