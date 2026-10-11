import { useMemo, useState } from 'react';
import {
  approveRender,
  canExport,
  completeSession,
  confirmContent,
  initialWorkflowState,
  startSession,
  type WorkflowState,
} from '../domain/workflow';
import type { WorkflowStage } from '../domain/models';

const questions = [
  '为什么远程协作最容易在交付前返工？',
  '你会怎样把“完成标准”写得更清楚？',
  '给刚开始远程协作的团队一个建议。',
] as const;

const projects = [
  ['远程协作为什么总在返工？', '备稿中 · 刚刚'],
  ['AI 工具不是越多越好', '待审片 · 昨天'],
  ['我的第一年独立开发复盘', '已导出 · 10 月 8 日'],
] as const;

const stages: ReadonlyArray<{ id: WorkflowStage; label: string }> = [
  { id: 'prepare', label: '1 准备内容' },
  { id: 'record', label: '2 录制' },
  { id: 'review', label: '3 审片' },
  { id: 'export', label: '4 导出' },
];

type InspectorTab = 'script' | 'questions' | 'sources';

export function App() {
  const [workflow, setWorkflow] = useState<WorkflowState>(initialWorkflowState);
  const [stage, setStage] = useState<WorkflowStage>('prepare');
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('script');
  const [activeProject, setActiveProject] = useState<string>(projects[0][0]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isAnswering, setIsAnswering] = useState(false);
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');

  const contentConfirmed = workflow.confirmedRevision === workflow.contentRevision;
  const exportReady = canExport(workflow);
  const stageStatus = useMemo(() => {
    if (stage === 'prepare') return `草稿 v${workflow.contentRevision}`;
    if (stage === 'record') return contentConfirmed ? '内容已冻结' : '内容待确认';
    if (stage === 'review') return workflow.reviewedRenderRevision ? '当前成片已审核' : '等待审片';
    return exportReady ? '可以导出' : '尚未满足导出条件';
  }, [contentConfirmed, exportReady, stage, workflow]);

  function showNotice(text: string) {
    setNotice(text);
    window.setTimeout(() => setNotice(''), 2200);
  }

  function confirmAndRecord() {
    const confirmed = confirmContent(workflow);
    const recording = startSession(confirmed, `session-${Date.now()}`);
    setWorkflow(recording);
    setStage('record');
    showNotice('内容版本已冻结，可以开始录制');
  }

  function finishSession() {
    if (!workflow.session || workflow.session.state !== 'recording') return;
    setIsAnswering(false);
    setWorkflow(completeSession(workflow));
    setStage('review');
    showNotice('录制会话已完成，原始轨道等待媒体层接入');
  }

  function approveCurrentRender() {
    try {
      setWorkflow(approveRender(workflow));
      showNotice('当前成片输入已审核');
    } catch (error) {
      showNotice(error instanceof Error ? error.message : '暂时无法审核');
    }
  }

  function selectStage(nextStage: WorkflowStage) {
    setStage(nextStage);
    if (nextStage === 'export' && !exportReady) showNotice('需要先完成录制并审核当前成片');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span>A</span>AceMode</div>
        <button className="new-project" onClick={() => showNotice('下一步将接入新建作品流程')}>＋ 新建内容</button>
        <p className="side-label">最近作品</p>
        <div className="project-list">
          {projects.map(([title, meta]) => (
            <button
              className={activeProject === title ? 'project active' : 'project'}
              key={title}
              onClick={() => setActiveProject(title)}
            >
              <strong>{title}</strong><small>{meta}</small>
            </button>
          ))}
        </div>
        <div className="side-actions">
          <button onClick={() => showNotice('作品与原片将在持久化层接入后启用')}>▣ 作品与原片</button>
          <button onClick={() => showNotice('设备设置将在 M0 录制实验中接入')}>⚙ 设置与设备</button>
          <div className="profile"><span>陈</span><div><strong>陈默</strong><small>个人工作区</small></div></div>
        </div>
      </aside>

      <main className="workspace">
        <header className="workspace-header">
          <div><strong>{activeProject}</strong><small>{stageStatus} · 本地演示状态</small></div>
          <nav aria-label="创作阶段">
            {stages.map((item) => (
              <button
                aria-current={stage === item.id ? 'step' : undefined}
                key={item.id}
                onClick={() => selectStage(item.id)}
              >{item.label}</button>
            ))}
          </nav>
        </header>

        <section className="workspace-body">
          {stage === 'prepare' && (
            <div className="conversation">
              <p className="eyebrow">内容准备</p>
              <h1>先把想说的话理清楚，再打开摄像头。</h1>
              <p className="lead">告诉我主题、听众和真正想表达的观点。AI 的建议会形成右侧可确认的产物，而不是只留在聊天记录中。</p>
              <div className="turn"><span>你</span><p>我想讲讲远程协作为什么总在返工，听众是产品和技术团队。不要讲大道理，最好有一个具体方法。</p></div>
              <div className="turn assistant"><span>A</span><div><strong>我先整理成一条 4 分钟内容。</strong><p>重点不放在“多沟通”，而是如何把模糊任务改写成可验收交付。稿件和三个主持问题已经整理在右侧。</p><dl><div><dt>切入点</dt><dd>返工往往不是执行问题，而是完成标准没有说清楚。</dd></div><div><dt>具体方法</dt><dd>每项任务写清交付物、验收人和完成证据。</dd></div><div><dt>表达方式</dt><dd>使用个人经验，不引用未经核实的数据。</dd></div></dl></div></div>
              <div className="suggestions"><button onClick={() => showNotice('已生成失败案例的修改建议')}>增加失败案例</button><button onClick={() => showNotice('已生成更口语的版本')}>语气更口语</button><button onClick={() => showNotice('已生成三分钟版本')}>压缩到 3 分钟</button></div>
              <div className="composer"><textarea aria-label="继续修改内容" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="告诉 AceMode 你想怎样修改……"/><button onClick={() => { if (!message.trim()) return showNotice('请先输入修改要求'); setMessage(''); showNotice('修改建议已生成，等待确认'); }}>↑</button></div>
            </div>
          )}

          {stage === 'record' && (
            <div className="record-layout">
              <section className="camera-column">
                <div className="camera-preview">
                  <span className="recording-state">● {isAnswering ? '录制中 00:42' : '准备就绪'}</span>
                  <span className="saving-state">✓ {isAnswering ? '边录边保存' : '设备预检待接入'}</span>
                  <div className="person-placeholder"><span>人</span><strong>真人画面预览</strong><small>当前版本尚未访问摄像头</small></div>
                  <div className="host-question"><small>问题 {questionIndex + 1} / {questions.length} · AI 主持</small><strong>{questions[questionIndex]}</strong></div>
                </div>
                <div className="record-controls"><button onClick={() => showNotice('正在重复当前问题')}>重复问题</button><button className="primary" disabled={!contentConfirmed} onClick={() => setIsAnswering(!isAnswering)}>{isAnswering ? '完成这段回答' : '开始回答'}</button><button onClick={() => showNotice('已创建候选 Take；旧回答保留')}>重来本题</button><button onClick={() => setQuestionIndex(Math.min(questions.length - 1, questionIndex + 1))}>下一题</button><button onClick={finishSession}>结束录制</button></div>
              </section>
              <aside className="record-status"><h2>录制状态</h2>{[['摄像头','待接入'],['麦克风','待接入'],['保存位置','待接入'],['主持连接','模拟在线']].map(([name,value]) => <div className="status-row" key={name}><span>{name}</span><strong>{value}</strong></div>)}<h2>问题单</h2>{questions.map((question,index) => <button className={index === questionIndex ? 'question current' : 'question'} key={question} onClick={() => setQuestionIndex(index)}>{index + 1}. {question}</button>)}</aside>
            </div>
          )}

          {stage === 'review' && (
            <div className="review-layout">
              <section><div className="video-preview"><button aria-label="播放预览" onClick={() => showNotice('真实播放器将在媒体层接入后启用')}>▶</button><p>把任务从“要做什么”，改写成“完成时会看到什么”。</p></div><div className="timeline"><span>Q1 · Take 2</span><span>Q2 · Take 1</span><span>Q3 · Take 2</span></div></section>
              <aside className="take-panel"><h2>回答片段</h2>{['Q1 · Take 2','Q1 · Take 1','Q2 · Take 1','Q3 · Take 2'].map((take,index) => <button className={index === 1 ? 'take' : 'take selected'} key={take}><strong>{take}</strong><small>{index === 1 ? '原片保留' : '当前采用'}</small></button>)}<button className="primary approve" disabled={!workflow.session || workflow.session.state !== 'complete'} onClick={approveCurrentRender}>{workflow.reviewedRenderRevision ? '✓ 当前版本已确认' : '确认成片版本'}</button></aside>
            </div>
          )}

          {stage === 'export' && (
            <div className="export-view"><p className="eyebrow">导出</p><h1>成片准备好后，由你决定何时发布。</h1><p className="lead">导出不会自动上传，也不等于授权发布。当前只展示文件契约，真实媒体生成将在 FFmpeg 管线接入后启用。</p><div className="export-list">{[['video.mp4','1080p · H.264'],['captions.srt','中文字幕'],['copy.md','标题、简介与标签'],['manifest.json','版本关系与文件校验']].map(([file,meta]) => <div key={file}><span><strong>{file}</strong><small>{meta}</small></span><em>{exportReady ? '准备生成' : '等待审核'}</em></div>)}</div><button className="primary export-button" disabled={!exportReady} onClick={() => showNotice('真实本地导出将在媒体管线接入后启用')}>导出到本地…</button></div>
          )}
        </section>
      </main>

      <aside className="inspector">
        <header><strong>当前内容</strong><small>编辑发生在产物上，而不是藏在聊天记录里</small></header>
        <div className="tabs">{(['script','questions','sources'] as const).map((tab) => <button className={inspectorTab === tab ? 'active' : ''} key={tab} onClick={() => setInspectorTab(tab)}>{tab === 'script' ? '稿件' : tab === 'questions' ? '问题单' : '来源'}</button>)}</div>
        <div className="document-panel">
          {inspectorTab === 'script' && <><label>标题</label><h2>远程协作为什么总在返工？</h2><label>开场</label><p>很多团队以为远程协作的问题是沟通太少，但真正造成返工的，往往是我们没有把“什么叫完成”说清楚。</p><label>核心观点</label><p>把任务从“要做什么”改写成“交付什么、谁来验收、出现什么证据才算完成”。</p><label>结尾</label><p>下一次分配任务前，试着补上一句：完成时，我会看到什么？</p></>}
          {inspectorTab === 'questions' && questions.map((question,index) => <div className="inspector-question" key={question}><span>{index + 1}</span>{question}</div>)}
          {inspectorTab === 'sources' && <><div className="source-item">✓ 内容以个人经验和团队实践为主。</div><div className="source-item warning">! “显著减少返工”属于待核验的量化倾向表达。</div></>}
        </div>
        <button className="confirm-content" disabled={contentConfirmed} onClick={confirmAndRecord}>{contentConfirmed ? '✓ 内容版本已冻结' : '确认此版本并去录制'}</button>
      </aside>

      {notice && <div className="toast" role="status">{notice}</div>}
    </div>
  );
}
