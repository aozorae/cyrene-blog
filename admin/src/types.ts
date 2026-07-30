export interface RepositorySettings {
	owner: string;
	repo: string;
	branch: string;
}

export interface RepositoryContext extends RepositorySettings {
	token: string;
}

export type DraftKind = "article" | "dynamic" | "settings" | "studio";

export interface DraftRecord<T = Record<string, unknown>> {
	id: string;
	kind: DraftKind;
	title: string;
	path: string;
	payload: T;
	baseRevision: Record<string, string | null>;
	createdAt: string;
	updatedAt: string;
}
