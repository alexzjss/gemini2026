import { redirect } from "next/navigation";

/** D55: o professor demo abre direto no 2º EM A. */
export default function ProfessorPage() {
  redirect("/professor/turma/2A");
}
