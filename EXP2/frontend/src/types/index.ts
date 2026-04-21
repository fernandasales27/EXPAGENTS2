export type Id = string;

export type EvaluationConcept = 'MANA' | 'MPA' | 'MA';

export interface Student {
	id: Id;
	name: string;
	cpf: string;
	email: string;
}

export interface ClassGroup {
	id: Id;
	topicDescription: string;
	year: number;
	semester: number;
}

export interface Goal {
	id: Id;
	name: string;
	order: number;
}

export interface Enrollment {
	id: Id;
	classGroupId: Id;
	studentId: Id;
}

export interface Evaluation {
	id: Id;
	classGroupId: Id;
	studentId: Id;
	goalId: Id;
	concept: EvaluationConcept;
	updatedAt: string;
}

export interface EmailNotificationItem {
	classGroupId: Id;
	studentId: Id;
	goalId: Id;
	concept: EvaluationConcept;
	updatedAt: string;
}

export interface EmailNotificationBatch {
	studentId: Id;
	studentEmail: string;
	date: string;
	items: EmailNotificationItem[];
	sentAt?: string;
}
