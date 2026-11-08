import type { Href } from "expo-router";

// Href da página de cidade/localidade (`app/cities/[slug].tsx`). Montado aqui, com cast, porque os
// tipos de rotas (`.expo/types/router.d.ts`) só passam a conhecer uma rota nova depois de o servidor
// de desenvolvimento regenerá-los — o cast evita que o `tsc` dependa disso.
export const cityHref = (slug: string) => `/cities/${slug}` as Href;
