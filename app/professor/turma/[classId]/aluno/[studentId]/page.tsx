import StudentProfile from "@/components/professor/StudentProfile";

export default async function AlunoPage({ params }: { params: Promise<{ classId: string; studentId: string }> }) {
  const { classId, studentId } = await params;
  return <StudentProfile classId={classId} studentId={studentId} />;
}
