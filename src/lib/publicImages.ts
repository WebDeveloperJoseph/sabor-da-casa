const normalizeImageKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();

const pizzaImageByName: Record<string, string> = {
  "2 amores": "/img/pizzas/2 amores.jpeg",
  "dois amores": "/img/pizzas/2 amores.jpeg",
  "4 queijos": "/img/pizzas/4 queijos.jpeg",
  "quatro queijos": "/img/pizzas/4 queijos.jpeg",
  "a moda da casa": "/img/pizzas/sabor da casa.jpeg",
  "banana com chocolate": "/img/pizzas/banana com chocolate.jpeg",
  "banana nevada": "/img/pizzas/banana nevada.jpeg",
  "calabresa": "/img/pizzas/calabresa.jpeg",
  "carne de sol na lata": "/img/pizzas/carne na lata.jpeg",
  "chocolate ao leite": "/img/pizzas/chocolate ao leite.jpeg",
  "du chef": "/img/pizzas/duchef.jpeg",
  "duchef": "/img/pizzas/duchef.jpeg",
  "frango": "/img/pizzas/frango.jpeg",
  "frango com bacon": "/img/pizzas/frango com bacon.jpeg",
  "frango com barbecue molho": "/img/pizzas/frango com molho barbecue.jpeg",
  "frango com molho barbecue": "/img/pizzas/frango com molho barbecue.jpeg",
  "lombinho canadense": "/img/pizzas/lombinho canadense.jpeg",
  "marguerita": "/img/pizzas/marguerita.jpeg",
  "moda da casa com creme cheese": "/img/pizzas/moda da casa com creme cheese.jpeg",
  "moda do chef": "/img/pizzas/moda do chef.jpeg",
  "mussarela": "/img/pizzas/musarrela.jpeg",
  "musarrela": "/img/pizzas/musarrela.jpeg",
  "paraibana": "/img/pizzas/paraibana.jpeg",
  "portuguesa": "/img/pizzas/portuguesa.jpeg",
  "predileta": "/img/pizzas/predileta.jpeg",
  "presunto": "/img/pizzas/presunto.jpeg",
  "romeu e julieta": "/img/pizzas/romeu e julieta.jpeg",
  "sabor da casa": "/img/pizzas/sabor da casa.jpeg",
};

export function getPublicPizzaImage(nome: string, fallback?: string | null) {
  if (fallback) return fallback;
  const normalized = normalizeImageKey(nome);
  return pizzaImageByName[normalized] || null;
}
