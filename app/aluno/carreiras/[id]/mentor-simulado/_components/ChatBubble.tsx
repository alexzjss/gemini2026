import Box from "@mui/material/Box";
import { visuallyHidden } from "@mui/utils";
import { tokens } from "@/lib/theme";

/** Bolha do chat: aluno à direita (`blue`), mentor à esquerda (`inkRaised` + borda `inkBorder`). */
export default function ChatBubble({ role, texto }: { role: "aluno" | "mentor"; texto: string }) {
  const aluno = role === "aluno";
  return (
    <Box sx={{
      alignSelf: aluno ? "flex-end" : "flex-start", maxWidth: aluno ? "78%" : "86%", px: 1.75, py: 1.25, fontSize: 15, lineHeight: 1.4,
      whiteSpace: "pre-wrap", overflowWrap: "anywhere",
      bgcolor: aluno ? tokens.blue : tokens.inkRaised, color: aluno ? tokens.white : tokens.paper,
      border: aluno ? `2px solid ${tokens.blue}` : `2px solid ${tokens.inkBorder}`,
      borderRadius: aluno ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
    }}>
      <Box component="span" sx={visuallyHidden}>
        {aluno ? "Você: " : "Mentor simulado: "}
      </Box>
      {texto}
    </Box>
  );
}
