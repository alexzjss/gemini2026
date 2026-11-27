import { ErrorState } from "@/components/ui";

export default function NotFound() {
  return <ErrorState titulo="Essa página não existe." texto="O link pode ter mudado. Bora voltar pro começo?" />;
}
