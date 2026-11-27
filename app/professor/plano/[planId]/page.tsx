import PlanEditor from "@/components/professor/PlanEditor";

export default async function PlanoPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params;
  return <PlanEditor planId={planId} />;
}
