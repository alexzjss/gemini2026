"use client";
/* Hooks React sobre os selectors puros do Agente 2 (lib/store/selectors.ts). Dono: Agente 1. */
import { useMemo } from "react";
import type { ClassGroup, LocalState } from "@/lib/types";
import { buildClassView, buildStudentView, type ClassView, type StudentView } from "./selectors";
import { getStudent, seed } from "./seed";
import { useAppStore } from "./AppStore";

/** View do aluno ou `null` (sem sessão ou id fora do seed). */
export function studentView(state: LocalState, studentId: string | undefined, agoraIso = new Date().toISOString()): StudentView | null {
  if (!studentId || !getStudent(studentId)) return null;
  return buildStudentView(seed, state, studentId, agoraIso);
}

export function useStudentView(studentId: string | undefined): StudentView | null {
  const { state } = useAppStore();
  return useMemo(() => studentView(state, studentId), [state, studentId]);
}

export function useClassView(classId: ClassGroup["id"]): ClassView {
  const { state } = useAppStore();
  return useMemo(() => buildClassView(seed, state, classId, new Date().toISOString()), [state, classId]);
}

export type { StudentView, ClassView };
