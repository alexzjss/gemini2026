"use client";
import Button, { type ButtonProps } from "@mui/material/Button";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import NextLink from "next/link";

type Props = ButtonProps & { href?: string; arrow?: boolean };

/** Botão pill do design. `color`: primary (blue) · ink · secondary (lime). */
export default function PillButton({ arrow, href, children, endIcon, ...props }: Props) {
  const icon = endIcon ?? (arrow ? <ArrowForwardRoundedIcon /> : undefined);
  if (href) {
    return (
      <Button component={NextLink} href={href} endIcon={icon} {...props}>
        {children}
      </Button>
    );
  }
  return (
    <Button endIcon={icon} {...props}>
      {children}
    </Button>
  );
}
