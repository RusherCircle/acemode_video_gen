export type Identifier = string;

export type WorkflowStage = 'prepare' | 'record' | 'review' | 'export';

export interface Episode {
  id: Identifier;
  title: string;
  audience: string;
  purpose: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentVersion {
  id: Identifier;
  episodeId: Identifier;
  revision: number;
  script: string;
  questions: readonly string[];
  sourceStatus: 'verified' | 'needs-review' | 'opinion-only';
  confirmedAt?: string;
}

export interface Session {
  id: Identifier;
  episodeId: Identifier;
  contentVersionId: Identifier;
  state: 'preflight' | 'recording' | 'finalizing' | 'complete' | 'failed';
  startedAt?: string;
  completedAt?: string;
}

export interface Take {
  id: Identifier;
  sessionId: Identifier;
  questionIndex: number;
  state: 'recording' | 'candidate' | 'selected' | 'discarded' | 'failed';
  sourceAssetIds: readonly Identifier[];
}

export interface Asset {
  id: Identifier;
  episodeId: Identifier;
  kind: 'video' | 'speaker-audio' | 'host-audio' | 'caption' | 'render' | 'export';
  state: 'writing' | 'saved' | 'missing' | 'archived';
  relativePath: string;
  checksum?: string;
}

export interface RenderJob {
  id: Identifier;
  episodeId: Identifier;
  inputRevision: number;
  state: 'queued' | 'processing' | 'complete' | 'failed' | 'cancelled';
  outputAssetId?: Identifier;
}

export interface Review {
  id: Identifier;
  renderJobId: Identifier;
  inputRevision: number;
  reviewedAt: string;
}

export interface ExportRecord {
  id: Identifier;
  reviewId: Identifier;
  assetIds: readonly Identifier[];
  createdAt: string;
}
