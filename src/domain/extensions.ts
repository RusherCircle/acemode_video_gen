import type { Identifier } from './models';

export type ExtensionKind = 'mcp' | 'skill';
export type ExtensionPermission =
  | 'project:read-metadata'
  | 'project:read-proxy-media'
  | 'project:read-original-media'
  | 'project:create-derived-assets'
  | 'network:send-data'
  | 'billing:create-cost';

export interface ExtensionManifest {
  id: Identifier;
  name: string;
  version: string;
  kind: ExtensionKind;
  permissions: readonly ExtensionPermission[];
  dataPolicyUrl?: string;
}

export interface EditProposal {
  id: Identifier;
  extensionId: Identifier;
  episodeId: Identifier;
  sourceRevision: number;
  summary: string;
  derivedAssetIds: readonly Identifier[];
  estimatedCost?: { amount: number; currency: string };
  state: 'draft' | 'awaiting-review' | 'accepted' | 'rejected';
}

export interface ExtensionGateway {
  listAvailable(): Promise<readonly ExtensionManifest[]>;
  createProposal(extensionId: Identifier, episodeId: Identifier): Promise<EditProposal>;
  acceptProposal(proposalId: Identifier): Promise<void>;
  rejectProposal(proposalId: Identifier): Promise<void>;
}
