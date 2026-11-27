import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import StyleRoundedIcon from "@mui/icons-material/StyleRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import type { SvgIconComponent } from "@mui/icons-material";

export interface NavItem { href: string; label: string; Icon: SvgIconComponent; match: (p: string) => boolean; }

export const NAV_ALUNO_MOBILE: NavItem[] = [
  { href: "/aluno", label: "Início", Icon: HomeRoundedIcon, match: (p) => p === "/aluno" },
  { href: "/aluno/carreiras", label: "Carreiras", Icon: ExploreRoundedIcon, match: (p) => p.startsWith("/aluno/carreiras") },
  { href: "/aluno/missoes", label: "Missões", Icon: BoltRoundedIcon, match: (p) => p.startsWith("/aluno/missoes") },
  { href: "/aluno/perfil", label: "Perfil", Icon: PersonRoundedIcon, match: (p) => p.startsWith("/aluno/perfil") },
];

export const NAV_ALUNO_DESKTOP: NavItem[] = [
  NAV_ALUNO_MOBILE[0],
  NAV_ALUNO_MOBILE[1],
  { href: "/aluno/galera", label: "Da Galera", Icon: StyleRoundedIcon, match: (p) => p.startsWith("/aluno/galera") },
  NAV_ALUNO_MOBILE[2],
  { href: "/aluno/perfil", label: "Ficha e mentores", Icon: BadgeRoundedIcon, match: (p) => p.startsWith("/aluno/perfil") },
];

export const NAV_PROFESSOR: NavItem[] = [
  { href: "/professor/turma/2A", label: "Turma", Icon: GroupsRoundedIcon, match: (p) => p.startsWith("/professor/turma") },
  { href: "/professor/planos", label: "Planos", Icon: DescriptionRoundedIcon, match: (p) => p.startsWith("/professor/plano") },
];

/** Rotas de fluxo em tela cheia (sem navegação). */
export function isFlowRoute(p: string): boolean {
  return (
    p === "/aluno/consentimento" ||
    (p.startsWith("/aluno/galera") && !p.startsWith("/aluno/galera/resultado")) ||
    p.startsWith("/aluno/semana") ||
    /^\/aluno\/missoes\/[^/]+$/.test(p) ||
    /\/mentor-simulado$/.test(p) ||
    p.startsWith("/aluno/match")
  );
}
