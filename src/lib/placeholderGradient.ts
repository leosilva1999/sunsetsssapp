// `Location` não tem campo de imagem própria (seção 3) — a web usa um quadrado em gradiente
// como placeholder visual nos cards de ranking/lista. Replicamos o mesmo recurso aqui,
// escolhendo determinísticamente a partir do id pra manter a cor estável entre renders.
const PAIRS: [string, string][] = [
  ["#ff8c5a", "#e85d8a"],
  ["#2d1b4e", "#e85d8a"],
  ["#ffcf6b", "#ff8c5a"],
  ["#1e1038", "#ff8c5a"],
];

export function placeholderGradientFor(seed: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PAIRS[hash % PAIRS.length];
}
