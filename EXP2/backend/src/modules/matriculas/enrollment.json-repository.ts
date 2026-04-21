import { JsonFileStore } from '../../infrastructure/persistence/json-file-store';
import type { Enrollment } from '../../domain/models';
import type { EnrollmentRepository } from './enrollment.repository';

export class JsonEnrollmentRepository implements EnrollmentRepository {
  constructor(private readonly store: JsonFileStore<Enrollment[]>) {}

  async listByClassGroupId(classGroupId: string): Promise<Enrollment[]> {
    const enrollments = await this.store.read([]);
    return enrollments.filter((enrollment) => enrollment.classGroupId === classGroupId);
  }

  async findByClassGroupAndStudent(classGroupId: string, studentId: string): Promise<Enrollment | undefined> {
    const enrollments = await this.store.read([]);
    return enrollments.find((enrollment) => enrollment.classGroupId === classGroupId && enrollment.studentId === studentId);
  }

  async create(enrollment: Enrollment): Promise<Enrollment> {
    const enrollments = await this.store.read([]);
    enrollments.push(enrollment);
    await this.store.write(enrollments);
    return enrollment;
  }

  async remove(classGroupId: string, studentId: string): Promise<boolean> {
    const enrollments = await this.store.read([]);
    const index = enrollments.findIndex((enrollment) => enrollment.classGroupId === classGroupId && enrollment.studentId === studentId);
    if (index === -1) {
      return false;
    }

    enrollments.splice(index, 1);
    await this.store.write(enrollments);
    return true;
  }
}
