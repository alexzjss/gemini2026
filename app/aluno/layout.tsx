import { StudentShell } from "@/components/shell";

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  return <StudentShell>{children}</StudentShell>;
}
