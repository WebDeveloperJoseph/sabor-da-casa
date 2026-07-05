"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Menu, ShieldCheck, Truck, UserRound } from "lucide-react";

type Props = {
  isOpenNow: boolean;
};

export function HeroSection({ isOpenNow }: Props) {
  return (
    <section className="relative overflow-hidden bg-[#b50008] text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-b from-[#c90010]/95 via-[#b50008]/92 to-[#970006]/96" />
        <div className="absolute -right-16 top-8 h-52 w-52 rounded-full border border-white/10" />
        <div className="absolute -left-16 bottom-8 h-48 w-48 rounded-full border border-white/10" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-6 sm:px-6 md:pb-18 md:pt-8">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white shadow-sm backdrop-blur transition hover:bg-white/20"
            aria-label="Abrir menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-3">
            <div className="relative h-16 w-16 overflow-hidden rounded-full border-4 border-white bg-white shadow-xl">
              <Image
                src="/img/logo-sabor-red.jpeg"
                alt="Sabor da Casa Pizzaria"
                fill
                priority
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="hidden text-left leading-none min-[380px]:block">
              <div className="text-2xl font-black tracking-tight text-white drop-shadow sm:text-3xl">
                Sabor da Casa
              </div>
              <div className="mt-1 text-lg font-black italic tracking-wide text-[#ffd15a] sm:text-xl">
                Pizzaria
              </div>
            </div>
          </div>

          <Link
            href="/meus-pedidos"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-white text-[#b50008] shadow-sm transition hover:bg-[#fff5e6]"
            aria-label="Minha conta"
          >
            <UserRound className="h-6 w-6" />
          </Link>
        </div>

        <div className="mx-auto mt-8 max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#ffd15a]">
            Pizzaria artesanal
          </p>
          <h1 className="mt-2 text-3xl font-black leading-tight sm:text-5xl md:text-6xl">
            Pizza quentinha, pedido facil.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-6 text-white/88 sm:text-base">
            Massa de longa fermentacao, molho artesanal e pizzas assadas com cuidado para chegar quentinhas na sua mesa.
          </p>
        </div>

        <div className="mx-auto mt-6 grid max-w-2xl grid-cols-2 overflow-hidden rounded-2xl border border-white/20 bg-[#fff7ea] text-[#2b1212] shadow-2xl">
          <div className="flex items-center gap-3 border-r border-[#ead7bd] px-4 py-3">
            <span
              className={`h-3 w-3 rounded-full ${isOpenNow ? "bg-[#28c76f]" : "bg-[#d71920]"}`}
            />
            <div className="min-w-0">
              <p className={`text-sm font-black ${isOpenNow ? "text-[#11783b]" : "text-[#9a0007]"}`}>
                {isOpenNow ? "Aberto agora" : "Fechado agora"}
              </p>
              <p className="truncate text-xs text-[#5f5250]">Atendemos ate 23:30</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3">
            <Truck className="h-7 w-7 shrink-0 text-[#b50008]" />
            <div>
              <p className="text-sm font-black">30-45 min</p>
              <p className="text-xs text-[#5f5250]">Entrega estimada</p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-5 flex max-w-3xl flex-wrap justify-center gap-2 text-xs font-semibold text-white/90 sm:text-sm">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 backdrop-blur">
            <MapPin className="h-4 w-4 text-[#ffd15a]" />
            Entrega em Nova Floresta
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 backdrop-blur">
            <ShieldCheck className="h-4 w-4 text-[#ffd15a]" />
            Pedido seguro
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 backdrop-blur">
            <Clock className="h-4 w-4 text-[#ffd15a]" />
            Terça fechado
          </span>
        </div>
      </div>
    </section>
  );
}
