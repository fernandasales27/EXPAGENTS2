import type { Enrollment } from '../../domain/models';

export interface EnrollmentRepository {
  listByClassGroupId(classGroupId: string): Promise<Enrollment[]>;
  findByClassGroupAndStudent(classGroupId: string, studentId: string): Promise<Enrollment | undefined>;
  create(enrollment: Enrollment): Promise<Enrollment>;
  remove(classGroupId: string, studentId: string): Promise<boolean>;
}
