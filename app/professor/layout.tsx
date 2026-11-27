import type { Metadata } from "next";
import type { ReactNode } from "react";
import ProfessorShell from "@/components/professor/ProfessorShell";

export const metadata: Metadata = { title: "Professor" };

export default function ProfessorLayout({ children }: { children: ReactNode }) {
  return <ProfessorShell>{children}</ProfessorShell>;
}
