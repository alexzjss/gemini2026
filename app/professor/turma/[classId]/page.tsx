import TurmaMapa from "@/components/professor/TurmaMapa";

export default async function TurmaPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  return <TurmaMapa classId={classId} />;
}
