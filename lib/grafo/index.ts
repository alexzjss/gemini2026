import grafoJson from "@/data/grafo/grafo.json";
import { carregarGrafo } from "./grafo";

/** Grafo versionado do produto (data/grafo/grafo.json), validado no carregamento. */
export const grafoPadrao = carregarGrafo(grafoJson);

export * from "./contexto";
export * from "./dominio";
export * from "./grafo";
export * from "./tipos";
export * from "./trilha";
