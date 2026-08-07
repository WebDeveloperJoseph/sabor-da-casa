"use client";

import { useCallback, useEffect, useState } from "react";

const FAVORITOS_STORAGE_KEY = "sabor-favoritos";

function lerFavoritos(): number[] {
  try {
    const favoritos = JSON.parse(
      localStorage.getItem(FAVORITOS_STORAGE_KEY) ?? "[]",
    );

    if (!Array.isArray(favoritos)) return [];

    return [...new Set(favoritos.map(Number))].filter(
      (id) => Number.isInteger(id) && id > 0,
    );
  } catch {
    return [];
  }
}

export function useFavoritosCardapio() {
  const [favoritosIds, setFavoritosIds] = useState<number[]>([]);
  const [carregados, setCarregados] = useState(false);

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      setFavoritosIds(lerFavoritos());
      setCarregados(true);
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  useEffect(() => {
    if (!carregados) return;

    try {
      localStorage.setItem(
        FAVORITOS_STORAGE_KEY,
        JSON.stringify(favoritosIds),
      );
    } catch {
      // O cardapio continua funcional quando o armazenamento esta indisponivel.
    }
  }, [carregados, favoritosIds]);

  const toggleFavorito = useCallback((pratoId: number) => {
    setFavoritosIds((favoritosAtuais) =>
      favoritosAtuais.includes(pratoId)
        ? favoritosAtuais.filter((id) => id !== pratoId)
        : [...favoritosAtuais, pratoId],
    );
  }, []);

  return { favoritosIds, toggleFavorito };
}
