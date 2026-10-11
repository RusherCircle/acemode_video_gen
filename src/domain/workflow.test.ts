import { describe, expect, it } from 'vitest';
import {
  approveRender,
  canExport,
  changeRenderInput,
  completeSession,
  confirmContent,
  initialWorkflowState,
  reviseContent,
  startSession,
} from './workflow';

describe('workflow invariants', () => {
  it('requires confirmation before recording', () => {
    expect(() => startSession(initialWorkflowState, 'session-1')).toThrow('尚未确认');
  });

  it('freezes the content revision used by a recording session', () => {
    const confirmed = confirmContent(initialWorkflowState);
    const recording = startSession(confirmed, 'session-1');
    expect(recording.session?.contentRevision).toBe(1);
    expect(() => reviseContent(recording)).toThrow('录制进行中');
  });

  it('invalidates review whenever the render input changes', () => {
    const recording = startSession(confirmContent(initialWorkflowState), 'session-1');
    const completed = completeSession(recording);
    const reviewed = approveRender(completed);
    expect(canExport(reviewed)).toBe(true);
    const changed = changeRenderInput(reviewed);
    expect(canExport(changed)).toBe(false);
  });
});
