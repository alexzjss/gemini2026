import { redirect } from "next/navigation";
import { DEMO } from "@/lib/config";

export default function ProfessorIndex() {
  redirect(`/professor/turma/${DEMO.turmaPadrao}`);
}
