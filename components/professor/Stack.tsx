"use client";

import { Box, type BoxProps } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { forwardRef } from "react";

type Bp = "xs" | "sm" | "md" | "lg" | "xl";
type Resp<T> = T | Partial<Record<Bp, T>>;

export type StackProps = Omit<BoxProps, "display" | "sx"> & {
  direction?: Resp<"row" | "column" | "row-reverse" | "column-reverse">;
  gap?: Resp<number | string>;
  alignItems?: Resp<string>;
  justifyContent?: Resp<string>;
  flexWrap?: Resp<"wrap" | "nowrap">;
  sx?: SxProps<Theme>;
};

/**
 * Flex simples com a mesma API de uso do `Stack` do MUI.
 * Existe porque o MUI 9 tirou as "system props" (gap, alignItems…) do Stack;
 * aqui tudo vira `sx`, que funciona igual nas versões 7, 8 e 9.
 */
const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  { direction = "column", gap, alignItems, justifyContent, flexWrap, sx, ...rest },
  ref,
) {
  return (
    <Box
      ref={ref}
      {...rest}
      sx={[
        { display: "flex", flexDirection: direction, gap, alignItems, justifyContent, flexWrap } as SxProps<Theme>,
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
});

export default Stack;
