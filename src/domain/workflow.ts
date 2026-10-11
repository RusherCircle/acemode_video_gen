import type { Identifier, WorkflowStage } from './models';

export interface WorkflowState {
  stage: WorkflowStage;
  contentRevision: number;
  confirmedRevision?: number;
  session?: {
    id: Identifier;
    contentRevision: number;
    state: 'recording' | 'complete';
  };
  renderInputRevision: number;
  reviewedRenderRevision?: number;
}

export const initialWorkflowState: WorkflowState = {
  stage: 'prepare',
  contentRevision: 1,
  renderInputRevision: 0,
};

export function reviseContent(state: WorkflowState): WorkflowState {
  if (state.session?.state === 'recording') {
    throw new Error('录制进行中不能修改主持问题单');
  }
  return { ...state, stage: 'prepare', contentRevision: state.contentRevision + 1 };
}

export function confirmContent(state: WorkflowState): WorkflowState {
  return { ...state, confirmedRevision: state.contentRevision };
}

export function startSession(state: WorkflowState, sessionId: Identifier): WorkflowState {
  if (state.confirmedRevision !== state.contentRevision) {
    throw new Error('当前内容版本尚未确认');
  }
  return {
    ...state,
    stage: 'record',
    session: { id: sessionId, contentRevision: state.contentRevision, state: 'recording' },
  };
}

export function completeSession(state: WorkflowState): WorkflowState {
  if (!state.session || state.session.state !== 'recording') {
    throw new Error('没有正在进行的录制会话');
  }
  return {
    ...state,
    stage: 'review',
    session: { ...state.session, state: 'complete' },
    renderInputRevision: state.renderInputRevision + 1,
    reviewedRenderRevision: undefined,
  };
}

export function changeRenderInput(state: WorkflowState): WorkflowState {
  return {
    ...state,
    stage: 'review',
    renderInputRevision: state.renderInputRevision + 1,
    reviewedRenderRevision: undefined,
  };
}

export function approveRender(state: WorkflowState): WorkflowState {
  if (!state.session || state.session.state !== 'complete') {
    throw new Error('录制尚未完成');
  }
  return { ...state, reviewedRenderRevision: state.renderInputRevision };
}

export function canExport(state: WorkflowState): boolean {
  return state.renderInputRevision > 0 && state.reviewedRenderRevision === state.renderInputRevision;
}
