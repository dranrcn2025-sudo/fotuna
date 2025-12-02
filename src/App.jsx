import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

const STORAGE_KEY = 'inspiration-vault-data';
const saveToStorage = (data) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { console.error('保存失败:', e); } };
const loadFromStorage = () => { try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) : null; } catch (e) { return null; } };

const initialData = {
  books: [
    {
      id: 'guide', title: '先从这个小故事开始', author: '一页穹顶', tags: ['教程'],
      cover: '✨', coverImage: null, color: '#4A3D6A', showStats: true,
      gallery: { enabled: false, images: [] },
      entries: [
        {
          id: 'welcome', title: '欢迎来到一页穹顶', summary: '你的创作伙伴', linkable: true, isFolder: false,
          content: '<p>　　欢迎！🎉</p><p>　　<b>一页穹顶</b>是一款专为创作者设计的灵感管理工具。无论你是小说作者、剧本创作者还是世界观构建爱好者，这里都能帮你把散落的灵感碎片编织成完整的星空。</p><p>　　在这本引导书里，你将学会如何使用一页穹顶的全部功能。点击下方的【基础操作】开始探索吧！</p>',
          children: []
        },
        {
          id: 'basics', title: '基础操作', summary: '从这里开始', content: '', isFolder: true, linkable: true,
          children: [
            { id: 'create-entry', title: '创建词条', summary: '记录你的灵感', linkable: true, isFolder: false, content: '<p>　　<b>创建词条很简单：</b></p><p>　　1. 进入任意书籍或分类</p><p>　　2. 点击右下角的 <b>+</b> 按钮</p><p>　　3. 选择「新建词条」或「新建分类」</p><p>　　4. 输入标题和简介</p><p>　　<b>小提示：</b>分类可以包含子词条，适合整理复杂的世界观。</p>', children: [] },
            { id: 'edit-content', title: '编辑内容', summary: '让文字更精彩', linkable: true, isFolder: false, content: '<p>　　<b>进入编辑模式：</b></p><p>　　点击右上角的「编辑」按钮，即可开始书写。</p><p>　　<b>底部工具栏功能：</b></p><p>　　• <b>↵</b> 首行缩进（给每段加两个空格）</p><p>　　• <b>A</b> 文字格式（加粗、斜体、下划线、删除线、字号）</p><p>　　• <b>对齐</b> 左对齐/居中/右对齐</p><p>　　• <b>T</b> 切换字体</p><p>　　• <b>🖼</b> 插入图片</p>', children: [] },
            { id: 'link-system', title: '跳转链接', summary: '连接你的世界', linkable: true, isFolder: false, content: '<p>　　这是一页穹顶最强大的功能！</p><p>　　<b>使用方法：</b></p><p>　　在正文中用【】包裹词条名，如【创建词条】，就会自动变成可点击的链接。</p><p>　　点击链接会跳转到对应词条，用左上角的返回按钮可以回来。</p><p>　　<b>开启跳转：</b></p><p>　　长按词条 → 选择「开启跳转」，该词条就可以被链接了。</p>', children: [] }
          ]
        },
        {
          id: 'advanced', title: '进阶功能', summary: '更多强大工具', content: '', isFolder: true, linkable: true,
          children: [
            { id: 'merged-view', title: '合并视图', summary: '一览无余', linkable: true, isFolder: false, content: '<p>　　<b>什么是合并视图？</b></p><p>　　当你有一个分类包含多个词条时，可以用合并视图一次性阅读所有内容。</p><p>　　<b>使用方法：</b></p><p>　　在分类列表中，<b>向左滑动</b>任意分类或词条，即可进入该项的合并视图。</p><p>　　合并视图中可以直接编辑所有子词条的内容，甚至添加新词条！</p>', children: [] },
            { id: 'search-func', title: '全局搜索', summary: '星星指引方向', linkable: true, isFolder: false, content: '<p>　　<b>书架页面的金色星星 ⭐</b></p><p>　　点击它会打开搜索界面，可以搜索所有书籍中的词条。</p><p>　　支持搜索：标题、简介、正文内容。</p><p>　　点击搜索结果会直接跳转到对应位置。</p>', children: [] },
            { id: 'reorder', title: '调整排序', summary: '自由安排顺序', linkable: true, isFolder: false, content: '<p>　　<b>如何调整词条顺序？</b></p><p>　　1. 点击右下角 <b>+</b> 按钮</p><p>　　2. 选择「调整排序」</p><p>　　3. 长按词条并拖动到目标位置</p><p>　　4. 点击「完成」保存</p>', children: [] },
            { id: 'export-image', title: '导出长图', summary: '分享你的创作', linkable: true, isFolder: false, content: '<p>　　<b>在只读模式下</b>，长按正文内容可以唤出功能菜单。</p><p>　　选择「导出长图」，会将当前词条生成为一张精美的长图，方便分享到社交媒体。</p><p>　　导出的图片不包含顶部导航栏，只有纯净的内容。</p>', children: [] }
          ]
        },
        {
          id: 'tips', title: '小贴士', summary: '让使用更顺手', linkable: true, isFolder: false,
          content: '<p>　　<b>一些实用技巧：</b></p><p>　　• 长按书籍或词条可以编辑/删除</p><p>　　• 切换编辑/阅读模式时会自动保存</p><p>　　• 词条底部会显示实时字数统计</p><p>　　• 在书籍设置中可以选择是否显示字数</p><p>　　<b>现在，创建你的第一本书吧！</b></p><p>　　返回书架，点击「新建世界」开始你的创作之旅~ 🚀</p>',
          children: []
        }
      ]
    }
  ]
};

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
const collectAllLinkableTitles = (books) => { const m = new Map(); const c = (es, bid, bt) => es.forEach(e => { if (e.linkable) { if (!m.has(e.title)) m.set(e.title, []); m.get(e.title).push({ bookId: bid, bookTitle: bt, entry: e }); } if (e.children?.length) c(e.children, bid, bt); }); books.forEach(b => c(b.entries, b.id, b.title)); return m; };
const findEntryPath = (es, tid, p = []) => { for (const e of es) { const cp = [...p, e]; if (e.id === tid) return cp; if (e.children?.length) { const f = findEntryPath(e.children, tid, cp); if (f) return f; } } return null; };
const findEntryById = (es, id) => { for (const e of es) { if (e.id === id) return e; if (e.children?.length) { const f = findEntryById(e.children, id); if (f) return f; } } return null; };
const getAllChildContent = (e, all) => { let r = []; const c = (x) => { if (!x) return; if (x.content || !x.isFolder) r.push(x); if (x.children?.length) x.children.forEach(ch => c(findEntryById(all, ch.id) || ch)); }; if (e?.children?.length) e.children.forEach(ch => c(findEntryById(all, ch.id) || ch)); return r; };
const updateEntryInTree = (es, eid, u) => es.map(e => e.id === eid ? { ...e, ...u } : e.children?.length ? { ...e, children: updateEntryInTree(e.children, eid, u) } : e);
const addEntryToParent = (es, pid, ne) => { if (!pid) return [...es, ne]; return es.map(e => e.id === pid ? { ...e, children: [...(e.children || []), ne] } : e.children?.length ? { ...e, children: addEntryToParent(e.children, pid, ne) } : e); };
const deleteEntryFromTree = (es, eid) => es.filter(e => e.id !== eid).map(e => e.children?.length ? { ...e, children: deleteEntryFromTree(e.children, eid) } : e);
const reorderEntriesInParent = (es, pid, fi, ti) => { if (pid === null) { const a = [...es]; const [m] = a.splice(fi, 1); a.splice(ti, 0, m); return a; } return es.map(e => e.id === pid && e.children ? (() => { const a = [...e.children]; const [m] = a.splice(fi, 1); a.splice(ti, 0, m); return { ...e, children: a }; })() : e.children?.length ? { ...e, children: reorderEntriesInParent(e.children, pid, fi, ti) } : e); };
const countWords = (es) => { let c = 0; const t = (is) => is.forEach(i => { if (i.content) c += i.content.replace(/<[^>]+>/g, '').replace(/\s/g, '').length; if (i.children?.length) t(i.children); }); t(es); return c; };
const countSingleEntryWords = (content) => content ? content.replace(/<[^>]+>/g, '').replace(/\s/g, '').length : 0;
const countEntries = (es) => { let c = 0; const t = (is) => is.forEach(i => { if (!i.isFolder) c++; if (i.children?.length) t(i.children); }); t(es); return c; };
const compressImage = (file, maxW = 600) => new Promise(r => { const rd = new FileReader(); rd.onload = (e) => { const img = new Image(); img.onload = () => { const cv = document.createElement('canvas'); let { width: w, height: h } = img; if (w > maxW) { h = (h * maxW) / w; w = maxW; } cv.width = w; cv.height = h; cv.getContext('2d').drawImage(img, 0, 0, w, h); r(cv.toDataURL('image/jpeg', 0.6)); }; img.src = e.target.result; }; rd.readAsDataURL(file); });

const ContentRenderer = ({ content, allTitlesMap, currentBookId, onLinkClick, fontFamily }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !content) return;
    ref.current.innerHTML = content.replace(/【([^】]+)】/g, (m, kw) => {
      const t = allTitlesMap.get(kw);
      return t?.length ? `<span class="keyword linked" data-kw="${kw}">【${kw}】</span>` : `<span class="keyword">【${kw}】</span>`;
    });
    ref.current.querySelectorAll('.keyword.linked').forEach(el => {
      el.onclick = () => {
        const t = allTitlesMap.get(el.dataset.kw);
        if (t?.length) { const tg = t.find(x => x.bookId === currentBookId) || t[0]; onLinkClick(el.dataset.kw, tg.bookId, tg.entry.id); }
      };
    });
  }, [content, allTitlesMap, currentBookId, onLinkClick]);
  return <div ref={ref} className="content-body" style={{ fontFamily }} />;
};

const RichEditor = ({ content, onSave, fontFamily, activeFormats, onImageClick }) => {
  const ref = useRef(null);
  const timer = useRef(null);
  const onImageClickRef = useRef(onImageClick);
  
  // 保持 onImageClick 的最新引用
  useEffect(() => {
    onImageClickRef.current = onImageClick;
  }, [onImageClick]);

  // 初始化内容，只执行一次
  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = content || '<p><br></p>';
    }
  }, []);
  
  // 图片点击事件，只绑定一次
  useEffect(() => {
    if (!ref.current) return;
    
    const handleImgClick = (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
        e.stopPropagation();
        if (onImageClickRef.current) {
          onImageClickRef.current(e.target);
        }
      }
    };
    
    ref.current.addEventListener('click', handleImgClick);
    return () => {
      ref.current?.removeEventListener('click', handleImgClick);
    };
  }, []);

  const save = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (ref.current) {
        onSave(ref.current.innerHTML);
      }
    }, 300);
  }, [onSave]);

  const forceSave = () => { 
    if (ref.current) { 
      onSave(ref.current.innerHTML); 
    } 
  };

  // 让光标位置滚动到屏幕中央
  const scrollToCursor = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const targetY = viewportHeight * 0.4; // 屏幕 40% 位置
      
      if (rect.top > viewportHeight * 0.6 || rect.top < viewportHeight * 0.2) {
        const scrollContainer = ref.current?.closest('.content-area');
        if (scrollContainer) {
          const scrollBy = rect.top - targetY;
          scrollContainer.scrollBy({ top: scrollBy, behavior: 'smooth' });
        }
      }
    }
  };

  // 检查是否有任何格式被激活
  const hasActiveFormats = () => {
    return activeFormats.bold || activeFormats.italic || activeFormats.underline || activeFormats.strike || activeFormats.size !== 'medium';
  };

  // 根据当前格式状态构建带格式的 HTML
  const wrapWithFormats = (text) => {
    let result = text;
    if (activeFormats.size === 'small') result = `<font size="2">${result}</font>`;
    if (activeFormats.size === 'big') result = `<font size="5">${result}</font>`;
    if (activeFormats.size === 'huge') result = `<font size="7">${result}</font>`;
    if (activeFormats.strike) result = `<span style="text-decoration:line-through">${result}</span>`;
    if (activeFormats.underline) result = `<u>${result}</u>`;
    if (activeFormats.italic) result = `<i>${result}</i>`;
    if (activeFormats.bold) result = `<b>${result}</b>`;
    return result;
  };

  // 插入带格式文字的通用函数
  const insertFormattedText = (text) => {
    if (hasActiveFormats()) {
      document.execCommand('insertHTML', false, wrapWithFormats(text));
    } else {
      const plainText = `<span style="font-weight:normal;font-style:normal;text-decoration:none;font-size:16px">${text}</span>`;
      document.execCommand('insertHTML', false, plainText);
    }
    save();
    setTimeout(scrollToCursor, 50);
  };

  // 电脑端键盘输入
  const handleKeyDown = (e) => {
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      insertFormattedText(e.key);
    }
    if (e.key === 'Enter') {
      setTimeout(scrollToCursor, 50);
    }
  };

  // 手机端输入法输入
  const handleBeforeInput = (e) => {
    if (e.inputType === 'insertText' && e.data) {
      e.preventDefault();
      insertFormattedText(e.data);
    }
  };

  useEffect(() => { 
    return () => { 
      if (timer.current) clearTimeout(timer.current); 
    }; 
  }, []);

  useEffect(() => { 
    if (ref.current) { 
      ref.current.forceSave = forceSave; 
    } 
  });

  return (
    <div 
      ref={ref} 
      className="rich-editor" 
      contentEditable 
      onInput={(e) => {
        save();
        setTimeout(scrollToCursor, 50);
      }}
      onBeforeInput={handleBeforeInput}
      onKeyDown={handleKeyDown}
      onFocus={scrollToCursor}
      onPaste={(e) => { 
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        if (hasActiveFormats()) {
          document.execCommand('insertHTML', false, wrapWithFormats(text));
        } else {
          document.execCommand('insertText', false, text);
        }
        save();
        setTimeout(scrollToCursor, 50);
      }} 
      onBlur={forceSave} 
      style={{ fontFamily }} 
      suppressContentEditableWarning 
    />
  );
};

const SidebarItem = ({ entry, depth = 0, onSelect, currentId, expandedIds, onToggle }) => {
  const hasC = entry.children?.length > 0;
  const isExp = expandedIds.has(entry.id);
  return (<div className="sidebar-item-wrapper"><div className={`sidebar-item ${currentId === entry.id ? 'active' : ''}`} style={{ paddingLeft: `${12 + depth * 16}px` }} onClick={() => onSelect(entry)}>{hasC && <span className={`expand-icon ${isExp ? 'expanded' : ''}`} onClick={(e) => { e.stopPropagation(); onToggle(entry.id); }}>›</span>}<span className="sidebar-icon">{entry.isFolder ? '📁' : '📄'}</span><span className="sidebar-title">{entry.title}</span>{entry.linkable && <span className="link-star">⭐</span>}</div>{hasC && isExp && entry.children.map(c => <SidebarItem key={c.id} entry={c} depth={depth + 1} onSelect={onSelect} currentId={currentId} expandedIds={expandedIds} onToggle={onToggle} />)}</div>);
};

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => isOpen ? (<div className="modal-overlay" onClick={onCancel}><div className="modal-content confirm-modal" onClick={e => e.stopPropagation()}><h3>{title}</h3><p>{message}</p><div className="modal-actions"><button className="btn-cancel" onClick={onCancel}>取消</button><button className="btn-danger" onClick={onConfirm}>确认删除</button></div></div></div>) : null;
const ContextMenu = ({ isOpen, position, onClose, options }) => isOpen ? (<><div className="context-overlay" onClick={onClose} /><div className="context-menu" style={{ top: position.y, left: Math.min(position.x, window.innerWidth - 180) }}>{options.map((o, i) => (<div key={i} className={`context-item ${o.danger ? 'danger' : ''}`} onClick={() => { o.action(); onClose(); }}><span className="context-icon">{o.icon}</span>{o.label}</div>))}</div></>) : null;

const EntryModal = ({ isOpen, onClose, onSave, editingEntry, parentTitle, isFolder }) => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [createAsFolder, setCreateAsFolder] = useState(false);
  useEffect(() => { if (editingEntry) { setTitle(editingEntry.title || ''); setSummary(editingEntry.summary || ''); } else { setTitle(''); setSummary(''); setCreateAsFolder(isFolder || false); } }, [editingEntry, isOpen, isFolder]);
  if (!isOpen) return null;
  return (<div className="modal-overlay" onClick={onClose}><div className="modal-content" onClick={e => e.stopPropagation()}><h3>{editingEntry ? '编辑词条' : (createAsFolder ? '新建分类' : '新建词条')}</h3>{parentTitle && <p className="modal-hint">添加到: {parentTitle}</p>}<input type="text" placeholder="标题" value={title} onChange={e => setTitle(e.target.value)} autoFocus /><input type="text" placeholder="简介（可选）" value={summary} onChange={e => setSummary(e.target.value)} />{!editingEntry && <label className="checkbox-label"><input type="checkbox" checked={createAsFolder} onChange={e => setCreateAsFolder(e.target.checked)} /><span>创建为分类文件夹</span></label>}<div className="modal-actions"><button className="btn-cancel" onClick={onClose}>取消</button><button className="btn-save" onClick={() => { if (title.trim()) { onSave({ title: title.trim(), summary: summary.trim(), isFolder: createAsFolder }); onClose(); } }} disabled={!title.trim()}>{editingEntry ? '保存' : '创建'}</button></div></div></div>);
};

const BookModal = ({ isOpen, onClose, onSave, editingBook }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [tags, setTags] = useState('');
  const [emoji, setEmoji] = useState('📖');
  const [coverImage, setCoverImage] = useState(null);
  const [showStats, setShowStats] = useState(true);
  const fileRef = useRef(null);
  const emojis = ['📖', '🌙', '⭐', '🏯', '🗡️', '🌸', '🔮', '🐉', '🦋', '🌊', '🔥', '💎'];
  useEffect(() => { if (editingBook) { setTitle(editingBook.title); setAuthor(editingBook.author || ''); setTags(editingBook.tags?.join(', ') || ''); setEmoji(editingBook.cover); setCoverImage(editingBook.coverImage); setShowStats(editingBook.showStats !== false); } else { setTitle(''); setAuthor(''); setTags(''); setEmoji('📖'); setCoverImage(null); setShowStats(true); } }, [editingBook, isOpen]);
  if (!isOpen) return null;
  return (<div className="modal-overlay" onClick={onClose}><div className="modal-content book-modal" onClick={e => e.stopPropagation()}><h3>{editingBook ? '编辑书籍' : '新建世界'}</h3><input type="text" placeholder="书名" value={title} onChange={e => setTitle(e.target.value)} autoFocus /><input type="text" placeholder="作者（可选）" value={author} onChange={e => setAuthor(e.target.value)} /><input type="text" placeholder="标签，逗号分隔" value={tags} onChange={e => setTags(e.target.value)} /><label className="checkbox-label"><input type="checkbox" checked={showStats} onChange={e => setShowStats(e.target.checked)} /><span>显示字数统计</span></label><div className="cover-section"><p className="section-label">封面</p>{coverImage ? (<div className="cover-preview"><img src={coverImage} alt="" /><button className="remove-cover" onClick={() => setCoverImage(null)}>×</button></div>) : (<div className="emoji-picker">{emojis.map(e => <span key={e} className={`emoji-option ${emoji === e ? 'selected' : ''}`} onClick={() => setEmoji(e)}>{e}</span>)}</div>)}<button className="upload-cover-btn" onClick={() => fileRef.current?.click()}>📷 上传封面</button><input ref={fileRef} type="file" accept="image/*" onChange={async e => { const f = e.target.files[0]; if (f) setCoverImage(await compressImage(f, 400)); }} style={{ display: 'none' }} /></div><div className="modal-actions"><button className="btn-cancel" onClick={onClose}>取消</button><button className="btn-save" onClick={() => { if (title.trim()) { onSave({ title: title.trim(), author, tags: tags.split(',').map(t => t.trim()).filter(Boolean), emoji, coverImage, showStats }); onClose(); } }} disabled={!title.trim()}>保存</button></div></div></div>);
};

const TextFormatMenu = ({ isOpen, onClose, activeFormats, onToggleFormat }) => isOpen ? (<><div className="format-menu-overlay" onClick={onClose} /><div className="format-menu"><p className="format-hint">点亮后输入即带格式</p><div className="format-row"><button className={activeFormats.bold ? 'active' : ''} onClick={() => onToggleFormat('bold')}><b>B</b></button><button className={activeFormats.italic ? 'active' : ''} onClick={() => onToggleFormat('italic')}><i>I</i></button><button className={activeFormats.underline ? 'active' : ''} onClick={() => onToggleFormat('underline')}><u>U</u></button><button className={activeFormats.strike ? 'active' : ''} onClick={() => onToggleFormat('strike')}><s>S</s></button></div><div className="format-row size-row"><button className={activeFormats.size === 'small' ? 'active' : ''} onClick={() => onToggleFormat('small')}>小</button><button className={activeFormats.size === 'medium' ? 'active' : ''} onClick={() => onToggleFormat('medium')}>中</button><button className={activeFormats.size === 'big' ? 'active' : ''} onClick={() => onToggleFormat('big')}>大</button><button className={activeFormats.size === 'huge' ? 'active' : ''} onClick={() => onToggleFormat('huge')}>特大</button></div></div></>) : null;

const AlignMenu = ({ isOpen, onClose, onAlign }) => isOpen ? (<><div className="format-menu-overlay" onClick={onClose} /><div className="format-menu align-menu"><div className="format-row"><button onClick={() => { onAlign('justifyLeft'); onClose(); }}><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z"/></svg></button><button onClick={() => { onAlign('justifyCenter'); onClose(); }}><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v2H3V3zm3 4h12v2H6V7zm-3 4h18v2H3v-2zm3 4h12v2H6v-2zm-3 4h18v2H3v-2z"/></svg></button><button onClick={() => { onAlign('justifyRight'); onClose(); }}><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v2H3V3zm6 4h12v2H9V7zm-6 4h18v2H3v-2zm6 4h12v2H9v-2zm-6 4h18v2H3v-2z"/></svg></button></div></div></>) : null;

const FontMenu = ({ isOpen, onClose, onSelectFont, currentFont }) => {
  const fonts = [{ n: '默认', v: "'Noto Serif SC', serif" }, { n: '宋体', v: "'Songti SC', serif" }, { n: '黑体', v: "'Heiti SC', sans-serif" }, { n: '楷体', v: "'Kaiti SC', serif" }, { n: '仿宋', v: "'FangSong SC', serif" }];
  return isOpen ? (<><div className="format-menu-overlay" onClick={onClose} /><div className="font-menu">{fonts.map(f => (<div key={f.v} className={`font-item ${currentFont === f.v ? 'active' : ''}`} onClick={() => { onSelectFont(f.v); onClose(); }} style={{ fontFamily: f.v }}>{f.n}</div>))}</div></>) : null;
};

const EditorToolbar = ({ onIndent, onFormat, onFont, onAlign, onImage, hasActive }) => {
  const imgRef = useRef(null);
  return (<div className="editor-toolbar-bottom"><button onClick={onIndent}>↵</button><button onClick={onFormat} className={hasActive ? 'has-active' : ''}>A</button><button onClick={onAlign}><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v2H3V3zm3 4h12v2H6V7zm-3 4h18v2H3v-2zm3 4h12v2H6v-2zm-3 4h18v2H3v-2z"/></svg></button><button onClick={onFont}>T</button><button onClick={() => imgRef.current?.click()}>🖼</button><input ref={imgRef} type="file" accept="image/*" onChange={onImage} style={{ display: 'none' }} /></div>);
};

const AddMenu = ({ isOpen, onClose, onAddEntry, onAddFolder, onReorder, onToggleGallery, galleryEnabled }) => isOpen ? (<><div className="add-menu-overlay" onClick={onClose} /><div className="add-menu"><div className="add-menu-item" onClick={() => { onAddFolder(); onClose(); }}><span>📁</span><span>新建分类</span></div><div className="add-menu-item" onClick={() => { onAddEntry(); onClose(); }}><span>📄</span><span>新建词条</span></div><div className="add-menu-item" onClick={() => { onReorder(); onClose(); }}><span>↕️</span><span>调整排序</span></div><div className="add-menu-item" onClick={() => { onToggleGallery(); onClose(); }}><span>🖼️</span><span>{galleryEnabled ? '关闭画廊' : '开启画廊'}</span></div></div></>) : null;

const ReorderList = ({ entries, onReorder, onExit }) => {
  const [di, setDi] = useState(null); // dragging index (原始位置)
  const [targetIndex, setTargetIndex] = useState(null); // 目标位置
  const [dragY, setDragY] = useState(0);
  const ref = useRef(null);
  const itemHeight = 62; // 每个词条的高度（包含间距）
  
  return (
    <div className="reorder-mode">
      <div className="reorder-header">
        <h3>调整排序</h3>
        <button className="done-btn" onClick={onExit}>完成</button>
      </div>
      <p className="reorder-hint">长按拖动调整顺序</p>
      <div className="reorder-list" ref={ref}>
        {entries.map((e, i) => {
          // 计算这个词条应该偏移多少
          let offsetY = 0;
          if (di !== null && targetIndex !== null && i !== di) {
            if (di < targetIndex) {
              // 向下拖：di和targetIndex之间的项目向上移
              if (i > di && i <= targetIndex) offsetY = -itemHeight;
            } else if (di > targetIndex) {
              // 向上拖：targetIndex和di之间的项目向下移
              if (i >= targetIndex && i < di) offsetY = itemHeight;
            }
          }
          
          const isDragging = i === di;
          
          return (
            <div 
              key={e.id} 
              className={`reorder-item ${isDragging ? 'dragging' : ''}`}
              onTouchStart={(ev) => { 
                const t = ev.touches[0];
                setDragY(t.clientY);
                setDi(i);
                setTargetIndex(i);
                if (navigator.vibrate) navigator.vibrate(30); 
              }}
              onTouchMove={(ev) => {
                if (di === null) return;
                ev.preventDefault();
                const t = ev.touches[0];
                setDragY(t.clientY);
                
                // 根据手指位置计算目标索引
                const listRect = ref.current?.getBoundingClientRect();
                if (listRect) {
                  const relativeY = t.clientY - listRect.top;
                  let newTarget = Math.floor(relativeY / itemHeight);
                  newTarget = Math.max(0, Math.min(entries.length - 1, newTarget));
                  setTargetIndex(newTarget);
                }
              }}
              onTouchEnd={() => { 
                if (di !== null && targetIndex !== null && di !== targetIndex) {
                  onReorder(di, targetIndex); 
                }
                setDi(null); 
                setTargetIndex(null); 
              }}
              style={isDragging ? {
                position: 'fixed',
                left: '5%',
                width: '90%',
                top: dragY - 30,
                zIndex: 1000,
                transform: 'scale(0.95)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.25)',
                pointerEvents: 'none',
                transition: 'none'
              } : {
                transform: `translateY(${offsetY}px)`,
                transition: 'transform 0.2s ease'
              }}
            >
              <div className="reorder-content">
                <span>{e.isFolder ? '📁' : '📄'}</span>
                <span>{e.title}</span>
              </div>
              <div className="bookmark-tab">
                <span>≡</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 全局搜索弹窗
const SearchModal = ({ isOpen, onClose, query, setQuery, results, onSearch, onResultClick }) => {
  const inputRef = useRef(null);
  
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, onSearch]);
  
  if (!isOpen) return null;
  
  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-header">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              ref={inputRef}
              type="text"
              className="search-input"
              placeholder="搜索词条、内容..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button className="search-clear" onClick={() => setQuery('')}>×</button>
            )}
          </div>
          <button className="search-cancel" onClick={onClose}>取消</button>
        </div>
        
        <div className="search-results">
          {query && results.length === 0 && (
            <div className="search-empty">
              <span>✨</span>
              <p>未找到相关内容</p>
            </div>
          )}
          {results.map((r, i) => (
            <div key={i} className="search-result-item" onClick={() => onResultClick(r)}>
              <div className="result-icon">{r.entry.isFolder ? '📁' : '📄'}</div>
              <div className="result-info">
                <h4>{r.entry.title}</h4>
                <p className="result-path">
                  {r.book.title}
                  {r.path.length > 0 && ` / ${r.path.map(p => p.title).join(' / ')}`}
                </p>
                {r.entry.summary && <p className="result-summary">{r.entry.summary}</p>}
              </div>
              <span className="result-arrow">›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [data, setData] = useState(() => loadFromStorage() || initialData);
  const [currentBook, setCurrentBook] = useState(null);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [navigationStack, setNavigationStack] = useState([]);
  const [mergedContents, setMergedContents] = useState([]);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState({ isOpen: false, position: { x: 0, y: 0 }, options: [] });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const [slideAnim, setSlideAnim] = useState('');
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [showAlignMenu, setShowAlignMenu] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [currentFont, setCurrentFont] = useState("'Noto Serif SC', serif");
  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, underline: false, strike: false, size: 'medium' });
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportMenuPos, setExportMenuPos] = useState({ x: 0, y: 0 });
  const [imageToDelete, setImageToDelete] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryPreviewImage, setGalleryPreviewImage] = useState(null);
  const [galleryContextMenu, setGalleryContextMenu] = useState({ isOpen: false, image: null, position: { x: 0, y: 0 } });
  const [galleryConfirmModal, setGalleryConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [showProfile, setShowProfile] = useState(false);
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '创作者');
  const [shelfOverscroll, setShelfOverscroll] = useState(0);
  const [shelfPage, setShelfPage] = useState(0);
  const shelfTouchStart = useRef({ y: 0, scrollTop: 0 });
  const shelfRef = useRef(null);
  const [galleryViewIndex, setGalleryViewIndex] = useState(0);
  const [galleryViewScale, setGalleryViewScale] = useState(1);
  const [galleryViewPos, setGalleryViewPos] = useState({ x: 0, y: 0 });
  const [galleryAnimating, setGalleryAnimating] = useState(false);
  const [galleryDragX, setGalleryDragX] = useState(0);
  const [galleryIsDragging, setGalleryIsDragging] = useState(false);
  const galleryTouchStart = useRef({ x: 0, y: 0, dist: 0, scale: 1, time: 0 });
  const galleryLongPressTimer = useRef(null);
  const contentLongPressTimer = useRef(null);
  const exportRef = useRef(null);
  const galleryUploadRef = useRef(null);
  const longPressTimer = useRef(null);
  const touchStartX = useRef(0);
  const editorRef = useRef(null);
  const savedSelection = useRef(null);

  // 保存当前选区
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
      savedSelection.current = sel.getRangeAt(0).cloneRange();
    }
  };

  // 恢复选区
  const restoreSelection = () => {
    if (savedSelection.current) {
      const ed = document.querySelector('.rich-editor');
      if (ed) {
        ed.focus();
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedSelection.current);
      }
    }
  };

  useEffect(() => { saveToStorage(data); }, [data]);
  const allTitlesMap = useMemo(() => collectAllLinkableTitles(data.books), [data.books]);
  
  // 全局搜索函数
  const performSearch = useCallback((query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const q = query.toLowerCase();
    const results = [];
    
    // 递归搜索词条，返回路径
    const searchInEntries = (entries, book, path = []) => {
      entries.forEach(entry => {
        const titleMatch = entry.title?.toLowerCase().includes(q);
        const summaryMatch = entry.summary?.toLowerCase().includes(q);
        const contentMatch = entry.content?.toLowerCase().includes(q);
        
        if (titleMatch || summaryMatch || contentMatch) {
          results.push({
            entry,
            book,
            path: [...path],
            matchType: titleMatch ? 'title' : summaryMatch ? 'summary' : 'content'
          });
        }
        
        if (entry.children?.length > 0) {
          searchInEntries(entry.children, book, [...path, entry]);
        }
      });
    };
    
    data.books.forEach(book => {
      searchInEntries(book.entries, book);
    });
    
    setSearchResults(results);
  }, [data.books]);
  
  // 点击搜索结果跳转
  const handleSearchResultClick = (result) => {
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    setCurrentBook(result.book);
    setNavigationStack(result.path);
    setCurrentEntry(result.entry);
    if (result.entry.isFolder || result.entry.children?.length > 0) {
      setViewMode('list');
    } else {
      setViewMode('single');
      setIsReadOnly(true);
    }
  };
  
  useEffect(() => { if (currentBook) { const u = data.books.find(b => b.id === currentBook.id); if (u && u !== currentBook) setCurrentBook(u); } }, [data.books]);
  useEffect(() => { if (currentEntry && currentBook) { const f = findEntryById(currentBook.entries, currentEntry.id); if (f && f !== currentEntry) setCurrentEntry(f); } }, [currentBook]);

  const saveContent = useCallback((html, eid = null, bid = null) => {
    const eId = eid || currentEntry?.id;
    const bId = bid || currentBook?.id;
    if (!eId || !bId) return;
    setData(prev => ({ ...prev, books: prev.books.map(b => b.id === bId ? { ...b, entries: updateEntryInTree(b.entries, eId, { content: html }) } : b) }));
  }, [currentEntry?.id, currentBook?.id]);

  const initMerged = useCallback((e) => { if (!e || !currentBook) return; setMergedContents(getAllChildContent(e, currentBook.entries).map(i => ({ id: i.id, title: i.title, content: i.content || '', isNew: false }))); }, [currentBook]);

  const handleLongPressStart = (e, type, item) => { const t = e.touches ? e.touches[0] : e; const pos = { x: t.clientX, y: t.clientY }; longPressTimer.current = setTimeout(() => { let opts = []; if (type === 'entry') { opts = [{ icon: '✏️', label: '编辑信息', action: () => { setEditingEntry(item); setShowEntryModal(true); } }, { icon: item.linkable ? '🚫' : '⭐', label: item.linkable ? '关闭跳转' : '开启跳转', action: () => setData(prev => ({ ...prev, books: prev.books.map(b => b.id === currentBook.id ? { ...b, entries: updateEntryInTree(b.entries, item.id, { linkable: !item.linkable }) } : b) })) }, { icon: '🗑️', label: '删除', danger: true, action: () => setConfirmModal({ isOpen: true, title: '确认删除', message: `删除「${item.title}」？`, onConfirm: () => { setData(prev => ({ ...prev, books: prev.books.map(b => b.id === currentBook.id ? { ...b, entries: deleteEntryFromTree(b.entries, item.id) } : b) })); if (currentEntry?.id === item.id) handleBack(); setConfirmModal({ isOpen: false }); } }) }]; } else if (type === 'book') { opts = [{ icon: '✏️', label: '编辑', action: () => { setEditingBook(item); setShowBookModal(true); } }, { icon: '🗑️', label: '删除', danger: true, action: () => setConfirmModal({ isOpen: true, title: '确认删除', message: `删除「${item.title}」？`, onConfirm: () => { setData(prev => ({ ...prev, books: prev.books.filter(b => b.id !== item.id) })); setConfirmModal({ isOpen: false }); } }) }]; } setContextMenu({ isOpen: true, position: pos, options: opts }); }, 500); };
  const handleLongPressEnd = () => { if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; } };

  const handleBookSelect = (b) => { setCurrentBook(b); setCurrentEntry(null); setViewMode('list'); setNavigationStack([]); };
  const handleBackToShelf = () => { setSlideAnim('slide-out'); setTimeout(() => { setCurrentBook(null); setCurrentEntry(null); setViewMode('list'); setNavigationStack([]); setIsSidebarOpen(false); setIsReorderMode(false); setSlideAnim(''); }, 200); };
  const handleEntryClick = (e) => { setSlideAnim('slide-in'); setNavigationStack(prev => [...prev, currentEntry].filter(Boolean)); setCurrentEntry(e); if (e.isFolder || e.children?.length > 0) setViewMode('list'); else { setViewMode('single'); setIsReadOnly(true); } setTimeout(() => setSlideAnim(''), 250); };
  const handleBack = () => { 
    setSlideAnim('slide-out'); 
    setTimeout(() => { 
      if (navigationStack.length > 0) { 
        const last = navigationStack[navigationStack.length - 1]; 
        setNavigationStack(s => s.slice(0, -1)); 
        // 检查是否是跳转记录（包含 bookId）
        if (last.bookId) {
          const b = data.books.find(x => x.id === last.bookId);
          if (b) {
            setCurrentBook(b);
            setCurrentEntry(last.entry);
            setViewMode(last.viewMode || 'single');
          }
        } else {
          // 普通的父级导航
          setCurrentEntry(last); 
          setViewMode('list'); 
        }
      } else { 
        setCurrentEntry(null); 
        setViewMode('list'); 
      } 
      setSlideAnim(''); 
      setIsReorderMode(false); 
    }, 200); 
  };
  const handleSidebarSelect = (e) => { const p = findEntryPath(currentBook.entries, e.id); if (p) { setNavigationStack(p.slice(0, -1)); setCurrentEntry(e); if (e.isFolder || e.children?.length > 0) setViewMode('list'); else setViewMode('single'); } setIsSidebarOpen(false); };
  const handleLinkClick = useCallback((kw, tbid, teid) => { 
    // 把当前位置存入导航栈（包含完整信息以便返回）
    const jumpRecord = { bookId: currentBook.id, entry: currentEntry, viewMode };
    setNavigationStack(p => [...p, jumpRecord]); 
    
    const tb = data.books.find(b => b.id === tbid); 
    if (tb) { 
      setSlideAnim('slide-in'); 
      setCurrentBook(tb); 
      const path = findEntryPath(tb.entries, teid); 
      if (path) { 
        const te = path[path.length - 1]; 
        setCurrentEntry(te); 
        if (te.isFolder && te.linkable) { 
          setViewMode('merged'); 
          setTimeout(() => initMerged(te), 0); 
        } else if (te.isFolder) setViewMode('list'); 
        else setViewMode('single'); 
      } 
      setTimeout(() => setSlideAnim(''), 250); 
    } 
  }, [currentBook, currentEntry, viewMode, data.books, initMerged]);

  // 修改标题并同步更新所有【】引用
  const handleTitleChange = (entryId, oldTitle, newTitle) => {
    if (oldTitle === newTitle) return;
    
    // 递归更新所有词条内容中的【旧标题】为【新标题】
    const updateContentRefs = (entries) => {
      return entries.map(e => {
        let updated = { ...e };
        if (e.content && e.content.includes(`【${oldTitle}】`)) {
          updated.content = e.content.replaceAll(`【${oldTitle}】`, `【${newTitle}】`);
        }
        if (e.children?.length > 0) {
          updated.children = updateContentRefs(e.children);
        }
        return updated;
      });
    };
    
    setData(prev => ({
      ...prev,
      books: prev.books.map(b => ({
        ...b,
        entries: updateContentRefs(updateEntryInTree(b.entries, entryId, { title: newTitle }))
      }))
    }));
  };
  
  // 修改简介
  const handleSummaryChange = (entryId, newSummary) => {
    setData(prev => ({
      ...prev,
      books: prev.books.map(b => b.id === currentBook.id ? {
        ...b,
        entries: updateEntryInTree(b.entries, entryId, { summary: newSummary })
      } : b)
    }));
  };

  const handleMergedChange = (i, f, v) => { 
    const entry = mergedContents[i];
    if (f === 'content') {
      // 内容都需要保存
      saveContent(v, entry.id, currentBook.id); 
    } else if (f === 'title') {
      // 标题变更
      if (entry.isNew) {
        // 新词条：直接更新标题
        setData(prev => ({ ...prev, books: prev.books.map(b => b.id === currentBook.id ? { ...b, entries: updateEntryInTree(b.entries, entry.id, { title: v }) } : b) }));
      } else if (entry.title !== v) {
        // 已有词条：更新标题并同步所有【】引用
        handleTitleChange(entry.id, entry.title, v);
      }
    }
    // 更新本地状态，如果是新词条也要标记为非新
    setMergedContents(nc => nc.map((x, j) => j === i ? { ...x, [f]: v, isNew: false } : x)); 
  };
  const handleAddMerged = () => { const ne = { id: generateId(), title: '新词条', content: '', isNew: true }; setMergedContents(p => [...p, ne]); setData(prev => ({ ...prev, books: prev.books.map(b => b.id === currentBook.id ? { ...b, entries: addEntryToParent(b.entries, currentEntry.id, { ...ne, summary: '', isFolder: false, linkable: true, children: [] }) } : b) })); };
  const handleAddEntry = (d) => { const ne = { id: generateId(), title: d.title, summary: d.summary || '', content: '', isFolder: d.isFolder, linkable: !d.isFolder, children: d.isFolder ? [] : undefined }; setData(prev => ({ ...prev, books: prev.books.map(b => b.id === currentBook.id ? { ...b, entries: addEntryToParent(b.entries, currentEntry?.id || null, ne) } : b) })); };
  const handleUpdateEntry = (d) => { if (!editingEntry) return; setData(prev => ({ ...prev, books: prev.books.map(b => b.id === currentBook.id ? { ...b, entries: updateEntryInTree(b.entries, editingEntry.id, { title: d.title, summary: d.summary }) } : b) })); setEditingEntry(null); };
  
  const handleAddBook = ({ title, author, tags, emoji, coverImage, showStats }) => { if (editingBook) { setData(prev => ({ ...prev, books: prev.books.map(b => b.id === editingBook.id ? { ...b, title, author, tags, cover: emoji, coverImage, showStats } : b) })); setEditingBook(null); } else { const colors = ['#2D3047', '#1A1A2E', '#4A0E0E', '#0E4A2D', '#3D2E4A', '#4A3D0E']; setData(prev => ({ ...prev, books: [...prev.books, { id: generateId(), title, author, tags, cover: emoji, coverImage, showStats, color: colors[Math.floor(Math.random() * colors.length)], entries: [] }] })); } };
  const handleReorder = (fi, ti) => setData(prev => ({ ...prev, books: prev.books.map(b => b.id === currentBook.id ? { ...b, entries: reorderEntriesInParent(b.entries, currentEntry?.id || null, fi, ti) } : b) }));

  const handleToggleFormat = (t) => {
    setActiveFormats(p => ['small', 'medium', 'big', 'huge'].includes(t) ? { ...p, size: t } : { ...p, [t]: !p[t] });
  };
  const handleAlign = (c) => { const ed = document.querySelector('.rich-editor'); if (ed) { ed.focus(); document.execCommand(c, false, null); ed.forceSave?.(); } };
  const handleIndent = () => { 
    const ed = document.querySelector('.rich-editor'); 
    if (!ed) return; 
    ed.querySelectorAll('p').forEach(p => { 
      if (p.textContent && !p.textContent.startsWith('　　')) {
        p.textContent = '　　' + p.textContent; 
      }
    }); 
    ed.forceSave?.(); 
  };
  const handleImageUpload = async (e) => { const f = e.target.files[0]; if (f) { const c = await compressImage(f, 600); const ed = document.querySelector('.rich-editor'); if (ed) { ed.focus(); document.execCommand('insertHTML', false, `<p style="text-align:center"><img src="${c}" style="max-width:100%;border-radius:8px" /></p>`); ed.forceSave?.(); } } e.target.value = ''; };
  const handleEntrySwipe = (e, dx) => { if (dx < -80 && (e.isFolder || e.children?.length > 0)) { setSlideAnim('slide-in'); setNavigationStack(p => [...p, currentEntry].filter(Boolean)); setCurrentEntry(e); setViewMode('merged'); setTimeout(() => initMerged(e), 50); setTimeout(() => setSlideAnim(''), 250); } };

  // 点击图片，弹出删除确认
  const handleImageClick = (imgElement) => {
    setImageToDelete(imgElement);
    setConfirmModal({
      isOpen: true,
      title: '删除图片',
      message: '确定要删除这张图片吗？',
      onConfirm: () => {
        if (imgElement) {
          const parent = imgElement.parentElement;
          if (parent && parent.tagName === 'P' && parent.childNodes.length === 1) {
            parent.remove();
          } else {
            imgElement.remove();
          }
          // 保存
          const ed = document.querySelector('.rich-editor');
          if (ed) ed.forceSave?.();
        }
        setImageToDelete(null);
        setConfirmModal({ isOpen: false });
      }
    });
  };

  // ========== 画廊功能 ==========
  
  // 开启/关闭画廊
  const toggleGallery = () => {
    if (!currentBook) return;
    const newGallery = currentBook.gallery ? { ...currentBook.gallery, enabled: !currentBook.gallery.enabled } : { enabled: true, images: [] };
    const updatedBook = { ...currentBook, gallery: newGallery };
    setCurrentBook(updatedBook);
    setData(prev => ({
      ...prev,
      books: prev.books.map(b => b.id === currentBook.id ? updatedBook : b)
    }));
  };

  // 上传图片到画廊
  const uploadGalleryImage = async (e) => {
    const files = e.target.files;
    if (!files || !currentBook) return;
    
    const currentImages = currentBook.gallery?.images || [];
    const currentFeaturedCount = currentImages.filter(img => img.featured).length;
    
    const newImages = [];
    for (let i = 0; i < files.length; i++) {
      const compressed = await compressImage(files[i], 800);
      // 前6张自动featured，之后的不自动
      const shouldFeatured = (currentImages.length + i) < 6 && (currentFeaturedCount + newImages.filter(img => img.featured).length) < 6;
      newImages.push({
        id: generateId(),
        src: compressed,
        featured: shouldFeatured
      });
    }
    
    const updatedGallery = {
      ...currentBook.gallery,
      images: [...currentImages, ...newImages]
    };
    const updatedBook = { ...currentBook, gallery: updatedGallery };
    setCurrentBook(updatedBook);
    setData(prev => ({
      ...prev,
      books: prev.books.map(b => b.id === currentBook.id ? updatedBook : b)
    }));
    
    e.target.value = '';
  };

  // 删除画廊图片
  const deleteGalleryImage = (imageId) => {
    setGalleryContextMenu({ isOpen: false, image: null, position: { x: 0, y: 0 } });
    setGalleryConfirmModal({
      isOpen: true,
      title: '删除图片',
      message: '确定要删除这张图片吗？',
      onConfirm: () => {
        const updatedGallery = {
          ...currentBook.gallery,
          images: currentBook.gallery.images.filter(img => img.id !== imageId)
        };
        const updatedBook = { ...currentBook, gallery: updatedGallery };
        setCurrentBook(updatedBook);
        setData(prev => ({
          ...prev,
          books: prev.books.map(b => b.id === currentBook.id ? updatedBook : b)
        }));
        setGalleryConfirmModal({ isOpen: false });
      }
    });
  };

  // 切换精选状态
  const toggleFeatured = (imageId) => {
    const currentImages = currentBook.gallery.images;
    const targetImage = currentImages.find(img => img.id === imageId);
    const currentFeaturedCount = currentImages.filter(img => img.featured).length;
    
    // 如果要设为featured，检查是否已达上限
    if (!targetImage.featured && currentFeaturedCount >= 6) {
      alert('最多只能展示6张图片');
      setGalleryContextMenu({ isOpen: false, image: null, position: { x: 0, y: 0 } });
      return;
    }
    
    const updatedGallery = {
      ...currentBook.gallery,
      images: currentImages.map(img => img.id === imageId ? { ...img, featured: !img.featured } : img)
    };
    const updatedBook = { ...currentBook, gallery: updatedGallery };
    setCurrentBook(updatedBook);
    setData(prev => ({
      ...prev,
      books: prev.books.map(b => b.id === currentBook.id ? updatedBook : b)
    }));
    setGalleryContextMenu({ isOpen: false, image: null, position: { x: 0, y: 0 } });
  };

  // 画廊图片长按
  const handleGalleryImageLongPress = (e, image) => {
    const t = e.touches ? e.touches[0] : e;
    const pos = { x: t.clientX, y: t.clientY };
    if (navigator.vibrate) navigator.vibrate(30);
    setGalleryContextMenu({ isOpen: true, image, position: pos });
  };

  // 打开画廊大图预览
  const openGalleryPreview = (image) => {
    const images = currentBook?.gallery?.images || [];
    const index = images.findIndex(img => img.id === image.id);
    setGalleryViewIndex(index >= 0 ? index : 0);
    setGalleryViewScale(1);
    setGalleryViewPos({ x: 0, y: 0 });
    setGalleryAnimating(true);
    setGalleryPreviewImage(image);
    setTimeout(() => setGalleryAnimating(false), 300);
  };

  // 关闭画廊大图预览
  const closeGalleryPreview = () => {
    setGalleryPreviewImage(null);
    setGalleryViewScale(1);
    setGalleryViewPos({ x: 0, y: 0 });
    setGalleryDragX(0);
  };

  // 保存用户名
  const saveUserName = (name) => {
    setUserName(name);
    localStorage.setItem('userName', name);
  };

  // 统计数据
  const totalStats = useMemo(() => {
    let totalWords = 0;
    let totalEntries = 0;
    let totalImages = 0;
    data.books.forEach(b => {
      totalWords += countWords(b.entries);
      totalEntries += countEntries(b.entries);
      totalImages += b.gallery?.images?.length || 0;
    });
    return { books: data.books.length, entries: totalEntries, words: totalWords, images: totalImages };
  }, [data.books]);

  // 长按内容区域显示导出菜单
  const handleContentLongPressStart = (e) => {
    if (!isReadOnly) return;
    const t = e.touches ? e.touches[0] : e;
    const pos = { x: t.clientX, y: t.clientY };
    contentLongPressTimer.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(30);
      setExportMenuPos(pos);
      setShowExportMenu(true);
    }, 500);
  };
  const handleContentLongPressEnd = () => {
    if (contentLongPressTimer.current) {
      clearTimeout(contentLongPressTimer.current);
      contentLongPressTimer.current = null;
    }
  };

  // 导出长图功能
  const handleExportImage = async () => {
    setShowExportMenu(false);
    const el = exportRef.current;
    if (!el) return;
    
    // 动态加载 html2canvas
    try {
      if (!window.html2canvas) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        document.head.appendChild(script);
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
        
        await new Promise(r => setTimeout(r, 100));
      }
      
      // 临时添加导出样式
      el.style.background = '#fff';
      el.style.borderRadius = '16px';
      el.style.padding = '24px 20px';
      el.style.boxShadow = '0 4px 20px rgba(45,48,71,.1)';
      
      const canvas = await window.html2canvas(el, {
        backgroundColor: '#f5f0e8',
        scale: 2,
        useCORS: true,
        logging: false,
        x: -16,
        y: -16,
        width: el.offsetWidth + 32,
        height: el.offsetHeight + 32
      });
      
      // 移除临时样式
      el.style.background = '';
      el.style.borderRadius = '';
      el.style.padding = '';
      el.style.boxShadow = '';
      
      const link = document.createElement('a');
      link.download = `${currentEntry?.title || '词条'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('导出失败:', err);
      alert('导出失败，请稍后重试');
    }
  };

  const currentEntries = currentEntry?.children || currentBook?.entries || [];
  
  // 从最新数据中获取当前 entry（确保排序等更新后能同步）
  const liveEntry = currentEntry ? findEntryById(currentBook?.entries || [], currentEntry.id) || currentEntry : null;
  const liveChildContent = liveEntry ? getAllChildContent(liveEntry, currentBook?.entries || []) : [];
  
  const isEditing = !isReadOnly && (viewMode === 'single' || viewMode === 'merged');
  const hasActiveFormat = activeFormats.bold || activeFormats.italic || activeFormats.underline || activeFormats.strike || activeFormats.size !== 'medium';

  if (!currentBook) {
  // 将书籍分页，每页4本
  const booksPerPage = 4;
  const allBooks = [...data.books, { id: 'add-new', isAddButton: true }];
  const totalPages = Math.ceil(allBooks.length / booksPerPage);
  const pages = [];
  for (let i = 0; i < totalPages; i++) {
    pages.push(allBooks.slice(i * booksPerPage, (i + 1) * booksPerPage));
  }
  
  return (<div className="app bookshelf-view"><div className="shelf-globe-bg" style={{ transform: `translateX(-50%) translateY(${-shelfOverscroll}px)`, transition: shelfOverscroll === 0 ? 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none' }} onClick={() => setShowProfile(true)} /><header className="bookshelf-header"><h1>一页穹顶</h1><p className="subtitle">拾起每一颗星星</p><p className="subtitle">便能拥有属于你的宇宙</p><button className="search-star" onClick={() => setShowSearch(true)}>⭐</button></header><div className="bookshelf-carousel" ref={shelfRef} onScroll={(e) => {
    const el = e.target;
    const pageIndex = Math.round(el.scrollLeft / el.clientWidth);
    setShelfPage(pageIndex);
  }} onTouchStart={(e) => {
    shelfTouchStart.current = { y: e.touches[0].clientY };
  }} onTouchMove={(e) => {
    const dy = shelfTouchStart.current.y - e.touches[0].clientY;
    if (dy > 0) {
      const pull = Math.min(dy * 0.3, 80);
      setShelfOverscroll(pull);
    }
  }} onTouchEnd={() => {
    if (shelfOverscroll >= 50) {
      setShowProfile(true);
    }
    setShelfOverscroll(0);
  }}>{pages.map((pageBooks, pageIndex) => (<div key={pageIndex} className="bookshelf-page"><div className="bookshelf-grid">{pageBooks.map(b => b.isAddButton ? (<div key="add" className="book-card add-book" onClick={() => { setEditingBook(null); setShowBookModal(true); }}><div className="book-cover"><span className="add-icon">+</span></div><div className="book-meta"><h2>新建世界</h2></div></div>) : (<div key={b.id} className="book-card" style={{ '--book-color': b.color }} onClick={() => handleBookSelect(b)} onTouchStart={e => { e.stopPropagation(); handleLongPressStart(e, 'book', b); }} onTouchEnd={handleLongPressEnd} onTouchMove={handleLongPressEnd}><div className="book-spine" /><div className="book-cover">{b.coverImage ? <img src={b.coverImage} alt="" className="cover-image" /> : <span className="book-emoji">{b.cover}</span>}</div><div className="book-shadow" /><div className="book-meta"><h2>{b.title}</h2>{b.author && <p>{b.author} 著</p>}</div></div>))}</div></div>))}</div>{totalPages > 1 && (<div className="shelf-page-dots">{pages.map((_, i) => (<span key={i} className={`shelf-dot ${shelfPage === i ? 'active' : ''}`} onClick={() => { shelfRef.current?.scrollTo({ left: i * shelfRef.current.clientWidth, behavior: 'smooth' }); }} />))}</div>)}<BookModal isOpen={showBookModal} onClose={() => { setShowBookModal(false); setEditingBook(null); }} onSave={handleAddBook} editingBook={editingBook} /><ContextMenu isOpen={contextMenu.isOpen} position={contextMenu.position} onClose={() => setContextMenu({ ...contextMenu, isOpen: false })} options={contextMenu.options} /><ConfirmModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal({ isOpen: false })} /><SearchModal isOpen={showSearch} onClose={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }} query={searchQuery} setQuery={setSearchQuery} results={searchResults} onSearch={performSearch} onResultClick={handleSearchResultClick} />{showProfile && (<div className="profile-page"><div className="profile-header"><button className="profile-close" onClick={() => setShowProfile(false)}>×</button><div className="profile-avatar">✨</div><input type="text" className="profile-name" value={userName} onChange={e => saveUserName(e.target.value)} placeholder="点击编辑名字" /></div><div className="profile-stats"><div className="stat-item"><span className="stat-number">{totalStats.books}</span><span className="stat-label">作品</span></div><div className="stat-item"><span className="stat-number">{totalStats.entries}</span><span className="stat-label">词条</span></div><div className="stat-item"><span className="stat-number">{totalStats.words.toLocaleString()}</span><span className="stat-label">总字数</span></div></div><div className="profile-menu"><div className="profile-menu-item" onClick={() => { setShowProfile(false); }}><span>📚</span><span>我的书架</span><span className="menu-arrow">›</span></div><div className="profile-menu-item"><span>🖼️</span><span>全部图片 ({totalStats.images})</span><span className="menu-arrow">›</span></div><div className="profile-menu-item"><span>⚙️</span><span>设置</span><span className="menu-arrow">›</span></div><div className="profile-menu-item"><span>💡</span><span>关于一页穹顶</span><span className="menu-arrow">›</span></div></div><div className="profile-footer"><p>一页穹顶 v1.0</p><p>拾起每一颗星星，便能拥有属于你的宇宙</p></div></div>)}<style>{styles}</style></div>);
}

  return (<div className="app main-view"><div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}><div className="sidebar-header"><h2>{currentBook.title}</h2><button className="close-sidebar" onClick={() => setIsSidebarOpen(false)}>×</button></div><div className="sidebar-content">{currentBook.entries.map(e => <SidebarItem key={e.id} entry={e} onSelect={handleSidebarSelect} currentId={currentEntry?.id} expandedIds={expandedIds} onToggle={id => setExpandedIds(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; })} />)}</div></div>{isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}<div className="main-content" onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }} onTouchEnd={e => { if (e.changedTouches[0].clientX - touchStartX.current > 80 && (currentEntry || navigationStack.length > 0)) handleBack(); }}><header className="top-bar"><div className="top-left"><button className="icon-btn" onClick={() => setIsSidebarOpen(true)}>☰</button>{(currentEntry || navigationStack.length > 0) && <button className="icon-btn" onClick={handleBack}>←</button>}<button className="icon-btn" onClick={handleBackToShelf}>🏠</button></div><div className="breadcrumb"><span className="book-name">{currentBook.title}</span>{currentEntry && <><span className="separator">/</span><span className="current-title">{currentEntry.title}</span></>}</div><div className="top-right">{(viewMode === 'single' || viewMode === 'merged') && (<div className="read-mode-toggle" onClick={() => { if (!isReadOnly) { const ed = document.querySelector('.rich-editor'); if (ed) ed.forceSave?.(); } else if (viewMode === 'merged' && liveEntry) { initMerged(liveEntry); } setIsReadOnly(!isReadOnly); }}><span className={`toggle-label ${isReadOnly ? 'active' : ''}`}>阅读</span><div className={`toggle-switch ${!isReadOnly ? 'edit-mode' : ''}`}><div className="toggle-knob" /></div><span className={`toggle-label ${!isReadOnly ? 'active' : ''}`}>编辑</span></div>)}</div></header>{!currentEntry && currentBook.showStats && (<div className="book-info-card"><div className="info-cover">{currentBook.coverImage ? <img src={currentBook.coverImage} alt="" /> : <span>{currentBook.cover}</span>}</div><div className="info-details">{currentBook.author && <p>作者：{currentBook.author}</p>}{currentBook.tags?.length > 0 && <p>标签：{currentBook.tags.join('、')}</p>}<p>词条：{countEntries(currentBook.entries)}条</p><p>字数：{countWords(currentBook.entries).toLocaleString()}字</p></div></div>)}{!currentEntry && currentBook.gallery?.enabled && (<div className="gallery-preview-strip"><div className="gallery-preview-scroll">{currentBook.gallery.images?.filter(img => img.featured).map(img => (<div key={img.id} className="gallery-strip-item" onClick={() => openGalleryPreview(img)}><img src={img.src} alt="" /></div>))}{(!currentBook.gallery.images?.filter(img => img.featured).length) && (<div className="gallery-strip-empty" onClick={() => setShowGallery(true)}><span>+</span><p>添加展示图片</p></div>)}</div><button className="gallery-enter-btn" onClick={() => setShowGallery(true)}>进入画廊 ›</button></div>)}<main className={`content-area ${slideAnim}`}>{viewMode === 'list' && !isReorderMode && (<>{currentEntry && <div className="list-header"><h1>{currentEntry.title}</h1>{currentEntry.summary && <p className="summary">{currentEntry.summary}</p>}</div>}<p className="swipe-hint">💡 左滑合并视图 · 右滑返回 · 长按编辑</p><div className="entry-list">{currentEntries.map(e => { let tx = 0; return (<div key={e.id} className="entry-card" onClick={() => handleEntryClick(e)} onTouchStart={ev => { tx = ev.touches[0].clientX; handleLongPressStart(ev, 'entry', e); }} onTouchMove={handleLongPressEnd} onTouchEnd={ev => { handleLongPressEnd(); handleEntrySwipe(e, ev.changedTouches[0].clientX - tx); }}><div className="entry-icon">{e.isFolder ? '📁' : '📄'}</div><div className="entry-info"><h3>{e.title}{e.linkable && <span className="star-badge">⭐</span>}</h3><p>{e.summary}</p></div><span className="entry-arrow">›</span></div>); })}</div>{currentEntries.length === 0 && <div className="empty-state"><span>✨</span><p>点击右下角添加</p></div>}</>)}{viewMode === 'list' && isReorderMode && <ReorderList entries={currentEntries} onReorder={handleReorder} onExit={() => setIsReorderMode(false)} />}{viewMode === 'single' && currentEntry && (<div className="single-view"><div className="export-content" ref={exportRef}><div className="content-header">{isReadOnly ? <h1>{currentEntry.title}</h1> : <input type="text" className="editable-title" defaultValue={currentEntry.title} onBlur={ev => handleTitleChange(currentEntry.id, currentEntry.title, ev.target.value)} key={currentEntry.id + '-title'} />}{isReadOnly ? (currentEntry.summary && <p className="entry-summary">{currentEntry.summary}</p>) : <input type="text" className="editable-summary" defaultValue={currentEntry.summary || ''} placeholder="添加简介..." onBlur={ev => handleSummaryChange(currentEntry.id, ev.target.value)} key={currentEntry.id + '-summary'} />}</div><div onTouchStart={isReadOnly ? handleContentLongPressStart : undefined} onTouchEnd={isReadOnly ? handleContentLongPressEnd : undefined} onTouchMove={isReadOnly ? handleContentLongPressEnd : undefined}>{isReadOnly ? <ContentRenderer content={currentEntry.content} allTitlesMap={allTitlesMap} currentBookId={currentBook.id} onLinkClick={handleLinkClick} fontFamily={currentFont} /> : <RichEditor content={currentEntry.content} onSave={html => saveContent(html)} fontFamily={currentFont} activeFormats={activeFormats} onImageClick={handleImageClick} />}</div></div><div className="word-count">{countSingleEntryWords(currentEntry.content).toLocaleString()} 字</div></div>)}{viewMode === 'merged' && currentEntry && (<div className="merged-view">{isReadOnly ? (<div ref={exportRef}><div className="content-header merged-header"><h1>{currentEntry.title}</h1><p className="merged-hint">📖 合并视图</p></div><div className="merged-content-read" onTouchStart={handleContentLongPressStart} onTouchEnd={handleContentLongPressEnd} onTouchMove={handleContentLongPressEnd}>{liveChildContent.map((it, i, arr) => (<div key={it.id} className="merged-section"><div className="section-title">• {it.title}</div><ContentRenderer content={it.content} allTitlesMap={allTitlesMap} currentBookId={currentBook.id} onLinkClick={handleLinkClick} fontFamily={currentFont} />{i < arr.length - 1 && <div className="section-divider" />}</div>))}</div></div>) : (<><div className="content-header merged-header"><h1>{currentEntry.title}</h1><p className="merged-hint">📖 合并视图</p></div><div className="merged-content-edit">{mergedContents.map((it, i) => (<div key={it.id} className="merged-edit-section"><div className="merged-edit-header">• <input type="text" className="merged-title-input" defaultValue={it.title} onBlur={ev => handleMergedChange(i, 'title', ev.target.value)} key={it.id + '-title'} /></div><div className="merged-editor-wrap" contentEditable dangerouslySetInnerHTML={{ __html: it.content }} onBlur={ev => handleMergedChange(i, 'content', ev.target.innerHTML)} style={{ fontFamily: currentFont }} /></div>))}<button className="add-merged-entry-btn" onClick={handleAddMerged}>+ 添加词条</button></div></>)}<div className="word-count">{liveChildContent.reduce((sum, it) => sum + countSingleEntryWords(it.content), 0).toLocaleString()} 字</div></div>)}</main>{viewMode === 'list' && !isReorderMode && (<><button className={`fab ${showAddMenu ? 'active' : ''}`} onClick={() => setShowAddMenu(!showAddMenu)}><span style={{ transform: showAddMenu ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span></button><AddMenu isOpen={showAddMenu} onClose={() => setShowAddMenu(false)} onAddEntry={() => { setEditingEntry(null); setIsCreatingFolder(false); setShowEntryModal(true); }} onAddFolder={() => { setEditingEntry(null); setIsCreatingFolder(true); setShowEntryModal(true); }} onReorder={() => setIsReorderMode(true)} onToggleGallery={toggleGallery} galleryEnabled={currentBook?.gallery?.enabled} /></>)}{isEditing && <EditorToolbar onIndent={handleIndent} onFormat={() => { saveSelection(); setShowFormatMenu(true); }} onAlign={() => { saveSelection(); setShowAlignMenu(true); }} onFont={() => { saveSelection(); setShowFontMenu(true); }} onImage={handleImageUpload} hasActive={hasActiveFormat} />}<TextFormatMenu isOpen={showFormatMenu} onClose={() => { setShowFormatMenu(false); restoreSelection(); }} activeFormats={activeFormats} onToggleFormat={handleToggleFormat} /><AlignMenu isOpen={showAlignMenu} onClose={() => { setShowAlignMenu(false); restoreSelection(); }} onAlign={handleAlign} /><FontMenu isOpen={showFontMenu} onClose={() => { setShowFontMenu(false); restoreSelection(); }} onSelectFont={setCurrentFont} currentFont={currentFont} /></div><EntryModal isOpen={showEntryModal} onClose={() => { setShowEntryModal(false); setEditingEntry(null); }} onSave={editingEntry ? handleUpdateEntry : handleAddEntry} editingEntry={editingEntry} parentTitle={currentEntry?.title} isFolder={isCreatingFolder} /><ContextMenu isOpen={contextMenu.isOpen} position={contextMenu.position} onClose={() => setContextMenu({ ...contextMenu, isOpen: false })} options={contextMenu.options} /><ConfirmModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal({ isOpen: false })} />{showGallery && (<div className="gallery-page" onClick={e => e.stopPropagation()}><div className="gallery-header"><button className="gallery-back" onClick={() => { setShowGallery(false); setGalleryContextMenu({ isOpen: false, image: null, position: { x: 0, y: 0 } }); }}>← 返回</button><h2>{currentBook?.title}</h2><button className="gallery-upload" onClick={() => galleryUploadRef.current?.click()}>+ 添加</button><input ref={galleryUploadRef} type="file" accept="image/*" multiple onChange={uploadGalleryImage} style={{ display: 'none' }} /></div><div className="gallery-grid">{currentBook?.gallery?.images?.map(img => (<div key={img.id} className="gallery-item" onTouchStart={(e) => { e.stopPropagation(); const touch = e.touches[0]; galleryLongPressTimer.current = setTimeout(() => { if (navigator.vibrate) navigator.vibrate(30); setGalleryContextMenu({ isOpen: true, image: img, position: { x: touch.clientX, y: touch.clientY } }); }, 500); }} onTouchEnd={(e) => { e.stopPropagation(); if (galleryLongPressTimer.current) { clearTimeout(galleryLongPressTimer.current); galleryLongPressTimer.current = null; } }} onTouchMove={(e) => { if (galleryLongPressTimer.current) { clearTimeout(galleryLongPressTimer.current); galleryLongPressTimer.current = null; } }} onClick={(e) => { e.stopPropagation(); if (!galleryContextMenu.isOpen) openGalleryPreview(img); }}><img src={img.src} alt="" draggable={false} />{img.featured && <span className="featured-star">★</span>}</div>))}{(!currentBook?.gallery?.images || currentBook.gallery.images.length === 0) && (<div className="gallery-empty"><span>🖼️</span><p>还没有图片</p><p>点击右上角添加</p></div>)}</div>{galleryContextMenu.isOpen && (<><div className="gallery-context-overlay" onClick={(e) => { e.stopPropagation(); setGalleryContextMenu({ isOpen: false, image: null, position: { x: 0, y: 0 } }); }} /><div className="context-menu" style={{ top: galleryContextMenu.position.y, left: Math.min(galleryContextMenu.position.x, window.innerWidth - 180) }}><div className="context-item" onClick={(e) => { e.stopPropagation(); toggleFeatured(galleryContextMenu.image.id); }}><span className="context-icon">{galleryContextMenu.image.featured ? '☆' : '★'}</span>{galleryContextMenu.image.featured ? '取消展示' : '展示'}</div><div className="context-item danger" onClick={(e) => { e.stopPropagation(); deleteGalleryImage(galleryContextMenu.image.id); }}><span className="context-icon">🗑️</span>删除图片</div></div></>)}{galleryConfirmModal.isOpen && (<div className="gallery-confirm-overlay" onClick={(e) => { e.stopPropagation(); setGalleryConfirmModal({ isOpen: false }); }}><div className="modal-content confirm-modal" onClick={e => e.stopPropagation()}><h3>{galleryConfirmModal.title}</h3><p>{galleryConfirmModal.message}</p><div className="modal-actions"><button className="btn-cancel" onClick={() => setGalleryConfirmModal({ isOpen: false })}>取消</button><button className="btn-save" onClick={galleryConfirmModal.onConfirm}>确定</button></div></div></div>)}</div>)}{galleryPreviewImage && (<div className="gallery-viewer" onTouchStart={(e) => {
  e.stopPropagation();
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    galleryTouchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, dist: Math.sqrt(dx*dx + dy*dy), scale: galleryViewScale, time: Date.now() };
  } else {
    galleryTouchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, dist: 0, scale: galleryViewScale, time: Date.now() };
    setGalleryIsDragging(true);
  }
}} onTouchMove={(e) => {
  e.stopPropagation();
  if (e.touches.length === 2 && galleryTouchStart.current.dist > 0) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const scale = Math.max(1, Math.min(4, galleryTouchStart.current.scale * (dist / galleryTouchStart.current.dist)));
    setGalleryViewScale(scale);
  } else if (e.touches.length === 1 && galleryViewScale === 1) {
    const dx = e.touches[0].clientX - galleryTouchStart.current.x;
    setGalleryDragX(dx);
  }
}} onTouchEnd={(e) => {
  e.stopPropagation();
  setGalleryIsDragging(false);
  const dx = galleryDragX;
  const images = currentBook?.gallery?.images || [];
  
  if (galleryViewScale === 1 && Math.abs(dx) > 50) {
    // 切换图片
    if (dx < -50 && galleryViewIndex < images.length - 1) {
      setGalleryViewIndex(galleryViewIndex + 1);
      setGalleryPreviewImage(images[galleryViewIndex + 1]);
    } else if (dx > 50 && galleryViewIndex > 0) {
      setGalleryViewIndex(galleryViewIndex - 1);
      setGalleryPreviewImage(images[galleryViewIndex - 1]);
    }
  }
  setGalleryDragX(0);
  if (galleryViewScale < 1.1) setGalleryViewScale(1);
}} onClick={(e) => { e.stopPropagation(); if (Math.abs(galleryDragX) < 10 && galleryViewScale === 1) closeGalleryPreview(); }}><div className="gallery-viewer-counter">{galleryViewIndex + 1} / {currentBook?.gallery?.images?.length || 0}</div><div className="gallery-viewer-track" style={{ transform: `translateX(calc(-${galleryViewIndex * 100}% + ${galleryDragX}px))`, transition: galleryIsDragging ? 'none' : 'transform 0.3s ease-out' }}>{currentBook?.gallery?.images?.map((img, idx) => (<div key={img.id} className="gallery-viewer-slide"><img src={img.src} alt="" style={{ transform: `scale(${idx === galleryViewIndex ? galleryViewScale : 1})` }} draggable={false} /></div>))}</div></div>)}{showExportMenu && (<><div className="export-menu-overlay" onClick={() => setShowExportMenu(false)} /><div className="export-menu" style={{ top: exportMenuPos.y - 60, left: Math.min(exportMenuPos.x - 60, window.innerWidth - 140) }}><div className="export-menu-item" onClick={handleExportImage}><span>📷</span><span>导出长图</span></div></div></>)}<style>{styles}</style></div>);
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=ZCOOL+XiaoWei&display=swap');
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body,#root{height:100%;overflow:hidden}
.app{height:100%;font-family:'Noto Serif SC',serif;overflow-y:auto;-webkit-overflow-scrolling:touch}
.bookshelf-view{background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f0f23 100%);padding:0;min-height:100vh;box-sizing:border-box;overflow:hidden;display:flex;flex-direction:column;position:relative}
.bookshelf-header{text-align:center;padding:50px 20px 20px;position:relative;z-index:10}
.bookshelf-header h1{font-family:'ZCOOL XiaoWei',serif;font-size:2.5rem;color:#f4e4c1;letter-spacing:.3em;text-shadow:0 0 40px rgba(244,228,193,.3);margin-bottom:16px}
.bookshelf-carousel{flex:1;display:flex;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scrollbar-width:none;-ms-overflow-style:none;position:relative;z-index:10;padding-bottom:50px}
.bookshelf-carousel::-webkit-scrollbar{display:none}
.bookshelf-page{flex:0 0 100%;width:100%;scroll-snap-align:start;display:flex;align-items:flex-start;justify-content:center;padding:0 20px;box-sizing:border-box}
.bookshelf-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px 16px;justify-items:center;padding-top:5px}
.shelf-page-dots{position:fixed;bottom:60px;left:0;right:0;display:flex;justify-content:center;gap:8px;z-index:10}
.shelf-dot{width:8px;height:8px;border-radius:50%;background:rgba(244,228,193,.3);cursor:pointer;transition:all .3s}
.shelf-dot.active{background:#f4e4c1;transform:scale(1.2)}
.subtitle{color:rgba(244,228,193,.6);font-size:.85rem;letter-spacing:.1em;line-height:1.6}
.search-star{background:none;border:none;font-size:1.5rem;cursor:pointer;margin-top:12px;animation:starPulse 2s ease-in-out infinite;filter:drop-shadow(0 0 10px rgba(255,215,0,.5))}
.search-star:active{transform:scale(1.2)}
@keyframes starPulse{0%,100%{transform:scale(1);filter:drop-shadow(0 0 10px rgba(255,215,0,.5))}50%{transform:scale(1.1);filter:drop-shadow(0 0 20px rgba(255,215,0,.8))}}
.book-card{position:relative;width:120px;cursor:pointer;user-select:none}
.book-card:active{transform:scale(.95)}
.book-spine{position:absolute;left:0;top:0;width:12px;height:155px;background:var(--book-color,#2D3047);border-radius:3px 0 0 3px;transform:rotateY(-30deg) translateX(-6px);transform-origin:right center;box-shadow:-5px 0 15px rgba(0,0,0,.3)}
.book-cover{width:100%;height:155px;background:linear-gradient(145deg,var(--book-color,#2D3047) 0%,color-mix(in srgb,var(--book-color,#2D3047) 70%,black) 100%);border-radius:0 8px 8px 0;display:flex;align-items:center;justify-content:center;box-shadow:5px 5px 20px rgba(0,0,0,.4);overflow:hidden;position:relative}
.cover-image{position:absolute;width:100%;height:100%;object-fit:cover}
.book-emoji{font-size:2.5rem}
.book-shadow{position:absolute;bottom:-15px;left:10%;width:80%;height:15px;background:radial-gradient(ellipse,rgba(0,0,0,.4) 0%,transparent 70%)}
.book-meta{text-align:center;padding:10px 4px 0}
.book-meta h2{color:#f4e4c1;font-size:.9rem;margin-bottom:4px}
.book-meta p{color:rgba(244,228,193,.5);font-size:.75rem}
.add-book{opacity:.5}
.add-book .book-cover{border:2px dashed rgba(244,228,193,.3)}
.add-icon{font-size:2.5rem;color:rgba(244,228,193,.5)}
.main-view{background:linear-gradient(180deg,#faf8f3 0%,#f5f0e8 100%);display:flex;flex-direction:column;height:100%;overflow:hidden}
.main-content{flex:1;display:flex;flex-direction:column;overflow:hidden}
.sidebar{position:fixed;left:0;top:0;width:280px;max-width:85vw;height:100%;background:linear-gradient(180deg,#2D3047 0%,#1a1a2e 100%);z-index:1000;transform:translateX(-100%);transition:transform .3s;display:flex;flex-direction:column}
.sidebar.open{transform:translateX(0)}
.sidebar-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:999}
.sidebar-header{padding:20px 16px;border-bottom:1px solid rgba(244,228,193,.1);display:flex;justify-content:space-between;align-items:center}
.sidebar-header h2{color:#f4e4c1;font-size:1.2rem;font-family:'ZCOOL XiaoWei',serif}
.close-sidebar{background:none;border:none;color:rgba(244,228,193,.6);font-size:1.5rem;cursor:pointer}
.sidebar-content{flex:1;overflow-y:auto;padding:12px 0}
.sidebar-item{display:flex;align-items:center;padding:12px 16px;color:rgba(244,228,193,.8);cursor:pointer;gap:8px}
.sidebar-item:active,.sidebar-item.active{background:rgba(244,228,193,.1)}
.expand-icon{font-size:.9rem;width:16px;transition:transform .2s}
.expand-icon.expanded{transform:rotate(90deg)}
.sidebar-icon{font-size:.85rem}
.sidebar-title{font-size:.9rem;flex:1}
.link-star{font-size:.65rem;opacity:.7}
.top-bar{position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:rgba(250,248,243,.95);backdrop-filter:blur(10px);border-bottom:1px solid rgba(45,48,71,.1)}
.top-left{display:flex;gap:4px}
.icon-btn{background:none;border:none;font-size:1.2rem;padding:8px;border-radius:8px;cursor:pointer;color:#2D3047}
.icon-btn:active{background:rgba(45,48,71,.1)}
.breadcrumb{flex:1;text-align:center;font-size:.85rem;color:#666;overflow:hidden}
.book-name{color:#2D3047;font-weight:600}
.separator{margin:0 6px;color:#ccc}
.current-title{color:#8B7355}
.read-mode-toggle{display:flex;align-items:center;gap:6px;cursor:pointer;padding:4px 8px;border-radius:16px;background:rgba(45,48,71,.05)}
.toggle-label{font-size:.75rem;color:#999}
.toggle-label.active{color:#2D3047;font-weight:600}
.toggle-switch{width:36px;height:20px;background:#2D3047;border-radius:10px;position:relative}
.toggle-switch.edit-mode{background:#8B7355}
.toggle-knob{position:absolute;left:2px;top:2px;width:16px;height:16px;background:#f4e4c1;border-radius:50%;transition:transform .3s}
.toggle-switch.edit-mode .toggle-knob{transform:translateX(16px)}
.book-info-card{display:flex;gap:16px;padding:20px;background:#fff;margin:16px;border-radius:12px;box-shadow:0 2px 8px rgba(45,48,71,.08)}
.info-cover{width:70px;height:95px;border-radius:6px;overflow:hidden;background:linear-gradient(135deg,#2D3047,#1a1a2e);display:flex;align-items:center;justify-content:center;font-size:2rem;flex-shrink:0}
.info-cover img{width:100%;height:100%;object-fit:cover}
.info-details{flex:1;font-size:.85rem;color:#666;display:flex;flex-direction:column;gap:6px}
.content-area{padding:20px 16px 80px;flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior-y:contain}
.content-area.slide-in{animation:slideIn .25s ease-out}
.content-area.slide-out{animation:slideOut .2s ease-in}
@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes slideOut{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}
.list-header{margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid rgba(45,48,71,.1)}
.list-header h1{font-family:'ZCOOL XiaoWei',serif;font-size:1.6rem;color:#2D3047;margin-bottom:6px}
.list-header .summary{color:#8B7355;font-size:.9rem}
.swipe-hint{font-size:.75rem;color:#aaa;text-align:center;margin-bottom:16px}
.entry-list{display:flex;flex-direction:column;gap:10px}
.entry-card{display:flex;align-items:center;gap:12px;padding:16px;background:#fff;border-radius:12px;cursor:pointer;box-shadow:0 2px 8px rgba(45,48,71,.08);user-select:none}
.entry-card:active{transform:scale(.98)}
.entry-icon{font-size:1.3rem}
.entry-info{flex:1;min-width:0}
.entry-info h3{font-size:1rem;color:#2D3047;margin-bottom:2px;font-weight:600;display:flex;align-items:center;gap:6px}
.entry-info p{font-size:.8rem;color:#8B7355;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.star-badge{font-size:.7rem;opacity:.7}
.entry-arrow{font-size:1.3rem;color:#ccc}
.empty-state{text-align:center;padding:60px 20px;color:#999}
.empty-state span{font-size:2.5rem;display:block;margin-bottom:12px}
.single-view,.merged-view{background:#fff;border-radius:16px;padding:24px 20px;box-shadow:0 4px 20px rgba(45,48,71,.1);min-height:calc(100vh - 200px)}
.content-header{margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid rgba(45,48,71,.1);display:flex;flex-direction:column;gap:6px}
.content-header h1{font-family:'ZCOOL XiaoWei',serif;font-size:1.5rem;color:#2D3047}
.editable-title{font-family:'ZCOOL XiaoWei',serif;font-size:1.5rem;color:#2D3047;border:none;background:transparent;padding:0;width:100%;outline:none}
.entry-summary{font-size:.9rem;color:#8B7355}
.editable-summary{font-size:.9rem;color:#8B7355;border:none;background:transparent;padding:0;width:100%;outline:none}
.merged-header{text-align:center;display:block}
.merged-hint{color:#8B7355;font-size:.85rem;margin-top:6px}
.content-body{line-height:1.9;color:#333;font-size:16px}
.content-body p{margin-bottom:.5em}
.content-body img{max-width:100%;border-radius:8px;display:block;margin:16px auto}
.keyword{color:#2D3047;font-weight:600}
.keyword.linked{color:#8B7355;background:linear-gradient(180deg,transparent 60%,rgba(139,115,85,.2) 60%);cursor:pointer}
.rich-editor{min-height:50vh;line-height:1.9;font-size:16px;outline:none;color:#333;padding-bottom:40vh}
.rich-editor:empty:before{content:'开始书写...';color:#999}
.rich-editor p{margin-bottom:.5em}
.rich-editor img{max-width:100%;border-radius:8px;display:block;margin:16px auto}
.merged-content-read .merged-section{margin-bottom:32px}
.section-title{font-size:1.1rem;color:#2D3047;font-weight:600;margin-bottom:12px}
.section-divider{height:1px;background:linear-gradient(90deg,transparent,rgba(45,48,71,.15),transparent);margin:32px 0}
.merged-content-edit{display:flex;flex-direction:column;gap:24px}
.merged-edit-section{padding-bottom:20px;border-bottom:1px solid rgba(45,48,71,.1)}
.merged-edit-header{display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:1.1rem;color:#2D3047;font-weight:600}
.merged-title-input{flex:1;background:none;border:none;font-size:1.1rem;font-weight:600;color:#2D3047;padding:4px 0;font-family:'Noto Serif SC',serif}
.merged-title-input:focus{outline:none}
.merged-editor-wrap{min-height:80px;line-height:1.8;font-size:16px;outline:none;color:#333}
.merged-editor-wrap:empty:before{content:'内容...';color:#999}
.add-merged-entry-btn{background:none;border:1px dashed rgba(45,48,71,.2);border-radius:8px;padding:12px;color:#8B7355;font-size:.9rem;cursor:pointer}
.fab{position:fixed;right:24px;bottom:24px;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#2D3047,#1a1a2e);border:none;color:#f4e4c1;font-size:1.8rem;cursor:pointer;box-shadow:0 4px 20px rgba(45,48,71,.4);display:flex;align-items:center;justify-content:center;z-index:50}
.fab:active,.fab.active{transform:scale(.9)}
.add-menu-overlay{position:fixed;inset:0;z-index:48}
.add-menu{position:fixed;right:24px;bottom:90px;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,.15);overflow:hidden;z-index:49}
.add-menu-item{display:flex;align-items:center;gap:12px;padding:16px 20px;cursor:pointer}
.add-menu-item:active{background:#f5f5f5}
.add-menu-item:not(:last-child){border-bottom:1px solid #eee}
.editor-toolbar-bottom{position:fixed;bottom:0;left:0;right:0;display:flex;justify-content:space-around;padding:8px 16px;background:rgba(250,248,243,.98);border-top:1px solid rgba(45,48,71,.08);z-index:50}
.editor-toolbar-bottom button{background:none;border:none;font-size:1rem;padding:8px 14px;cursor:pointer;color:#2D3047;border-radius:6px;display:flex;align-items:center;justify-content:center}
.editor-toolbar-bottom button:active{background:rgba(45,48,71,.08)}
.editor-toolbar-bottom button.has-active{color:#8B7355;background:rgba(139,115,85,.1)}
.format-menu-overlay{position:fixed;inset:0;z-index:58}
.format-menu{position:fixed;left:16px;right:16px;bottom:60px;background:#fff;border-radius:12px;box-shadow:0 -4px 20px rgba(0,0,0,.1);z-index:59;padding:12px}
.format-hint{font-size:.75rem;color:#999;text-align:center;margin-bottom:10px}
.format-row{display:flex;justify-content:space-around;margin-bottom:8px}
.format-row:last-child{margin-bottom:0}
.format-row button{width:44px;height:44px;border-radius:10px;border:1px solid #eee;background:#fff;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center}
.format-row button:active{background:rgba(139,115,85,.15)}
.format-row button.active{background:#8B7355;color:#fff;border-color:#8B7355}
.size-row button{width:auto;padding:0 14px}
.align-menu .format-row{justify-content:center;gap:16px}
.font-menu{position:fixed;left:16px;right:16px;bottom:60px;background:#fff;border-radius:12px;box-shadow:0 -4px 20px rgba(0,0,0,.1);z-index:59;padding:16px;display:flex;flex-wrap:wrap;gap:8px}
.font-item{padding:10px 14px;border-radius:8px;cursor:pointer;font-size:.9rem;background:#f5f5f5}
.font-item.active{background:rgba(139,115,85,.15);color:#8B7355}
.reorder-mode{padding:0}
.reorder-header{display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-bottom:1px solid rgba(45,48,71,.1);margin-bottom:16px}
.reorder-header h3{font-family:'ZCOOL XiaoWei',serif;font-size:1.3rem;color:#2D3047}
.done-btn{background:#8B7355;color:#fff;border:none;padding:8px 20px;border-radius:8px;font-size:.9rem;cursor:pointer}
.reorder-hint{font-size:.8rem;color:#999;text-align:center;margin-bottom:16px}
.reorder-list{display:flex;flex-direction:column;gap:8px;position:relative;min-height:200px}
.reorder-item{display:flex;align-items:center;background:#fff;border-radius:12px;overflow:visible;box-shadow:0 2px 8px rgba(45,48,71,.08)}
.reorder-item.dragging{background:#fff;border-radius:12px}
.reorder-content{flex:1;display:flex;align-items:center;gap:12px;padding:14px 16px}
.bookmark-tab{width:40px;height:100%;background:linear-gradient(135deg,#8B7355,#6B5335);display:flex;align-items:center;justify-content:center;color:#f4e4c1;font-size:1.2rem;clip-path:polygon(0 0,100% 0,100% 100%,0 100%,8px 50%)}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px}
.modal-content{background:#fff;border-radius:16px;padding:24px;width:100%;max-width:360px;max-height:80vh;overflow-y:auto}
.modal-content h3{font-family:'ZCOOL XiaoWei',serif;font-size:1.3rem;color:#2D3047;margin-bottom:16px;text-align:center}
.confirm-modal p{text-align:center;color:#666;margin-bottom:20px}
.modal-hint{font-size:.85rem;color:#8B7355;margin-bottom:16px;text-align:center}
.modal-content input[type="text"]{width:100%;padding:12px 16px;border:2px solid rgba(45,48,71,.1);border-radius:10px;font-family:'Noto Serif SC',serif;font-size:1rem;margin-bottom:12px}
.modal-content input:focus{outline:none;border-color:#8B7355}
.checkbox-label{display:flex;align-items:center;gap:10px;margin-bottom:12px;font-size:.9rem;color:#666;cursor:pointer}
.checkbox-label input{width:18px;height:18px;accent-color:#8B7355}
.section-label{font-size:.85rem;color:#666;margin-bottom:10px}
.cover-section{margin-bottom:16px}
.cover-preview{position:relative;width:100%;height:150px;border-radius:10px;overflow:hidden;margin-bottom:12px}
.cover-preview img{width:100%;height:100%;object-fit:cover}
.remove-cover{position:absolute;top:8px;right:8px;width:28px;height:28px;border-radius:50%;background:rgba(0,0,0,.6);color:#fff;border:none;font-size:1.2rem;cursor:pointer}
.upload-cover-btn{width:100%;padding:12px;border:2px dashed rgba(45,48,71,.2);border-radius:10px;background:none;color:#666;font-size:.9rem;cursor:pointer;margin-top:12px}
.emoji-picker{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.emoji-option{font-size:1.8rem;padding:8px;border-radius:8px;cursor:pointer}
.emoji-option.selected{background:rgba(139,115,85,.2);transform:scale(1.1)}
.modal-actions{display:flex;gap:12px;margin-top:16px}
.btn-cancel,.btn-save,.btn-danger{flex:1;padding:12px;border-radius:10px;font-family:'Noto Serif SC',serif;font-size:1rem;cursor:pointer}
.btn-cancel{background:none;border:2px solid rgba(45,48,71,.2);color:#666}
.btn-save{background:linear-gradient(135deg,#2D3047,#1a1a2e);border:none;color:#f4e4c1}
.btn-danger{background:#e53935;border:none;color:#fff}
.btn-save:disabled{opacity:.5}
.book-modal{max-width:400px}
.context-overlay{position:fixed;inset:0;z-index:1998}
.context-menu{position:fixed;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,.2);overflow:hidden;z-index:1999;min-width:160px}
.context-item{display:flex;align-items:center;gap:12px;padding:14px 18px;cursor:pointer;font-size:.95rem}
.context-item:active{background:#f5f5f5}
.context-item.danger{color:#e53935}
.context-item:not(:last-child){border-bottom:1px solid #eee}
.context-icon{font-size:1.1rem}
.search-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:2000;display:flex;flex-direction:column;backdrop-filter:blur(4px)}
.search-modal{background:linear-gradient(180deg,#faf8f3 0%,#f5f0e8 100%);flex:1;display:flex;flex-direction:column;max-height:100%;animation:slideUp .3s ease}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
.search-header{display:flex;align-items:center;gap:12px;padding:16px;border-bottom:1px solid rgba(139,115,85,.2);background:#fff}
.search-input-wrap{flex:1;display:flex;align-items:center;background:rgba(139,115,85,.1);border-radius:12px;padding:0 12px}
.search-icon{font-size:1rem;color:#8B7355}
.search-input{flex:1;border:none;background:none;padding:12px 8px;font-size:1rem;font-family:'Noto Serif SC',serif;outline:none;color:#2D3047}
.search-input::placeholder{color:#aaa}
.search-clear{background:none;border:none;font-size:1.2rem;color:#999;cursor:pointer;padding:4px 8px}
.search-cancel{background:none;border:none;color:#8B7355;font-size:1rem;cursor:pointer;font-family:'Noto Serif SC',serif}
.search-results{flex:1;overflow-y:auto;padding:8px}
.search-empty{text-align:center;padding:60px 20px;color:#999}
.search-empty span{font-size:3rem;display:block;margin-bottom:16px}
.search-result-item{display:flex;align-items:center;gap:12px;padding:14px 16px;background:#fff;border-radius:12px;margin-bottom:8px;box-shadow:0 2px 8px rgba(0,0,0,.05);cursor:pointer}
.search-result-item:active{background:#f9f6f1}
.result-icon{font-size:1.5rem}
.result-info{flex:1;min-width:0}
.result-info h4{font-size:1rem;color:#2D3047;margin-bottom:4px;font-weight:600}
.result-path{font-size:.8rem;color:#8B7355;margin-bottom:2px}
.result-summary{font-size:.85rem;color:#888;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.result-arrow{color:#ccc;font-size:1.2rem}
.word-count{text-align:center;font-size:.8rem;color:#aaa;padding:20px 0;margin-top:20px;border-top:1px solid rgba(45,48,71,.1)}
.export-menu-overlay{position:fixed;inset:0;z-index:1998}
.export-menu{position:fixed;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,.2);overflow:hidden;z-index:1999;min-width:120px}
.export-menu-item{display:flex;align-items:center;gap:10px;padding:14px 18px;cursor:pointer;font-size:.95rem}
.export-menu-item:active{background:#f5f5f5}
.gallery-page{position:fixed;inset:0;background:linear-gradient(180deg,#faf8f3 0%,#f5f0e8 100%);z-index:2500;display:flex;flex-direction:column}
.gallery-header{display:flex;align-items:center;justify-content:space-between;padding:16px;border-bottom:1px solid rgba(45,48,71,.1);background:rgba(250,248,243,.95);backdrop-filter:blur(10px)}
.gallery-back{background:none;border:none;color:#2D3047;font-size:1rem;cursor:pointer;font-family:'Noto Serif SC',serif}
.gallery-header h2{font-family:'ZCOOL XiaoWei',serif;font-size:1.3rem;color:#2D3047}
.gallery-upload{background:none;border:none;color:#8B7355;font-size:1rem;cursor:pointer;font-family:'Noto Serif SC',serif}
.gallery-grid{flex:1;overflow-y:auto;padding:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;align-content:start}
.gallery-item{position:relative;aspect-ratio:1;border-radius:8px;overflow:hidden;cursor:pointer}
.gallery-item img{width:100%;height:100%;object-fit:cover}
.gallery-item:active{transform:scale(.98)}
.gallery-empty{grid-column:1/-1;text-align:center;padding:60px 20px;color:#999}
.gallery-empty span{font-size:3rem;display:block;margin-bottom:16px}
.gallery-context-overlay{position:fixed;inset:0;z-index:100}
.gallery-confirm-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:2600;display:flex;align-items:center;justify-content:center;padding:20px}
.gallery-viewer{position:fixed;inset:0;background:rgba(0,0,0,.95);z-index:3000;touch-action:none;overflow:hidden}
.gallery-viewer-counter{position:absolute;top:20px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.7);font-size:.9rem;background:rgba(0,0,0,.4);padding:6px 16px;border-radius:20px;z-index:10}
.gallery-viewer-track{display:flex;height:100%;will-change:transform}
.gallery-viewer-slide{flex:0 0 100%;width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box}
.gallery-viewer-slide img{max-width:100%;max-height:90vh;object-fit:contain;border-radius:4px;transition:transform .15s ease;user-select:none;-webkit-user-drag:none;pointer-events:none}
.gallery-preview-modal{position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:3000;display:flex;align-items:center;justify-content:center;padding:20px}
.gallery-preview-modal img{max-width:100%;max-height:100%;object-fit:contain;border-radius:8px}
.gallery-strip-item{width:120px;height:120px;flex-shrink:0;border-radius:12px;overflow:hidden;cursor:pointer}
.gallery-strip-item img{width:100%;height:100%;object-fit:cover}
.gallery-strip-item:active{transform:scale(.97)}
.gallery-preview-strip{margin:0 16px 16px;padding:16px;background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(45,48,71,.08)}
.gallery-preview-strip .gallery-preview-scroll{display:flex;gap:10px;overflow-x:auto;padding:4px 0 12px;scrollbar-width:none;-ms-overflow-style:none}
.gallery-preview-strip .gallery-preview-scroll::-webkit-scrollbar{display:none}
.gallery-strip-empty{width:120px;height:120px;flex-shrink:0;border-radius:12px;border:2px dashed rgba(139,115,85,.3);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#8B7355;cursor:pointer;gap:4px}
.gallery-strip-empty span{font-size:2rem}
.gallery-strip-empty p{font-size:.75rem;margin:0}
.gallery-enter-btn{display:block;width:100%;background:none;border:none;color:#8B7355;font-size:.9rem;cursor:pointer;text-align:center;padding:8px 0 0;font-family:'Noto Serif SC',serif}
.shelf-globe-bg{position:fixed;bottom:-550px;left:50%;width:300vw;height:600px;border-radius:50%;background:linear-gradient(180deg,#D4A84B 0%,#C9A227 40%,#B8960B 100%);box-shadow:0 -40px 100px 50px rgba(212,168,75,.3);z-index:1;cursor:pointer;pointer-events:auto}
.featured-star{position:absolute;top:6px;right:6px;color:#FFD700;font-size:1.2rem;text-shadow:0 0 8px rgba(255,215,0,.8),0 2px 4px rgba(0,0,0,.3)}
.profile-page{position:fixed;inset:0;background:linear-gradient(180deg,#2D3047 0%,#1a1d2e 100%);z-index:3000;display:flex;flex-direction:column;overflow-y:auto}
.profile-header{text-align:center;padding:60px 20px 30px;position:relative}
.profile-close{position:absolute;top:20px;right:20px;background:none;border:none;color:#f4e4c1;font-size:1.8rem;cursor:pointer;opacity:.7}
.profile-avatar{width:80px;height:80px;margin:0 auto 16px;background:linear-gradient(135deg,#4A3D6A,#8B7355);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:2.5rem;box-shadow:0 4px 20px rgba(0,0,0,.3)}
.profile-name{background:none;border:none;color:#f4e4c1;font-size:1.3rem;text-align:center;width:100%;font-family:'ZCOOL XiaoWei',serif;padding:8px}
.profile-name:focus{outline:none;border-bottom:1px solid rgba(244,228,193,.3)}
.profile-name::placeholder{color:rgba(244,228,193,.5)}
.profile-stats{display:flex;justify-content:center;gap:40px;padding:20px;border-bottom:1px solid rgba(244,228,193,.1)}
.stat-item{text-align:center}
.stat-number{display:block;font-size:1.5rem;color:#f4e4c1;font-family:'ZCOOL XiaoWei',serif}
.stat-label{font-size:.8rem;color:rgba(244,228,193,.6)}
.profile-menu{padding:20px}
.profile-menu-item{display:flex;align-items:center;gap:14px;padding:16px;background:rgba(255,255,255,.05);border-radius:12px;margin-bottom:10px;color:#f4e4c1;cursor:pointer}
.profile-menu-item:active{background:rgba(255,255,255,.1)}
.profile-menu-item span:first-child{font-size:1.3rem}
.profile-menu-item span:nth-child(2){flex:1}
.menu-arrow{color:rgba(244,228,193,.4);font-size:1.2rem}
.profile-footer{text-align:center;padding:30px 20px;color:rgba(244,228,193,.4);font-size:.85rem}
.profile-footer p{margin:4px 0}
`;
