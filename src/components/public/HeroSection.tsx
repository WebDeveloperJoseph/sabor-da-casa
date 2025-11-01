"use client"

import Image from "next/image"
import { Clock, MapPin, Star } from "lucide-react"
import { useState, useEffect } from "react"

type Props = {
  isOpenNow: boolean
}

export function HeroSection({ isOpenNow }: Props) {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section className="relative mb-16 overflow-hidden">
      {/* Background com gradiente animado */}
      <div className="absolute inset-0 bg-linear-to-br from-orange-100 via-red-50 to-pink-100 opacity-60"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-20">
        {/* Grid layout para desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Coluna esquerda: Texto e CTAs */}
          <div className="text-center lg:text-left space-y-6 z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full border-2 border-orange-300 shadow-sm">
              <Star className="w-5 h-5 text-orange-500 fill-orange-500" />
              <span className="text-sm font-bold text-orange-800">Sabor Artesanal</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
              <span className="bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Pizzas Artesanais
              </span>
              <br />
              <span className="text-gray-900">Feitas com Amor</span>
            </h1>
            
            <p className="text-xl text-gray-700 max-w-2xl mx-auto lg:mx-0">
              Ingredientes frescos, massa artesanal e muito sabor. Peça agora e receba quentinha em casa! 🍕
            </p>
            
            {/* Badges de info */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start flex-wrap">
              <div className="inline-flex items-center gap-2 px-5 py-3 bg-white rounded-xl border-2 border-gray-200 shadow-md hover:shadow-lg transition-all">
                <Clock className="w-5 h-5 text-orange-500" />
                <div className="text-left">
                  <p className="text-xs text-gray-500 font-medium">Horário</p>
                  <p className="text-sm font-bold text-gray-900">Seg-Sex: 18h-22:30</p>
                </div>
              </div>
              
              <div className="inline-flex items-center gap-2 px-5 py-3 bg-white rounded-xl border-2 border-gray-200 shadow-md hover:shadow-lg transition-all">
                <MapPin className="w-5 h-5 text-red-500" />
                <div className="text-left">
                  <p className="text-xs text-gray-500 font-medium">Entrega</p>
                  <p className="text-sm font-bold text-gray-900">Até 5km</p>
                </div>
              </div>
              
              <div className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 shadow-md ${
                isOpenNow 
                  ? 'bg-green-50 border-green-300' 
                  : 'bg-red-50 border-red-300'
              }`}>
                <div className={`w-3 h-3 rounded-full animate-pulse ${
                  isOpenNow ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className={`text-sm font-bold ${
                  isOpenNow ? 'text-green-800' : 'text-red-800'
                }`}>
                  {isOpenNow ? 'Aberto Agora!' : 'Fechado'}
                </span>
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="pt-4">
              <a 
                href="#cardapio" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-orange-500 to-red-500 text-white font-bold rounded-full shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
              >
                <span>Ver Cardápio</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Coluna direita: Imagem da equipe + Logo */}
          <div className="relative z-10">
            {/* Versão Desktop: Com animação de carrossel e scroll */}
            <div 
              className="relative rounded-3xl overflow-hidden bg-white shadow-2xl border-4 border-white hidden lg:block"
              style={{
                transform: `translateY(${scrollY * 0.1}px)`,
                transition: 'transform 0.1s ease-out'
              }}
            >
              <div className="relative h-96 md:h-[500px] w-full overflow-hidden">
                {/* Container do carrossel com animação infinita */}
                <div className="sliding-carousel absolute inset-0 flex">
                  {/* Imagem original */}
                  <div className="shrink-0 h-full relative" style={{ width: '150%' }}>
                    <Image
                      src="/img/equipe.png"
                      alt="Nossa Equipe"
                      fill
                      priority
                      sizes="75vw"
                      className="object-cover object-left"
                    />
                  </div>
                  {/* Imagem duplicada para loop sem falhas */}
                  <div className="shrink-0 h-full relative" style={{ width: '150%' }}>
                    <Image
                      src="/img/equipe.png"
                      alt="Nossa Equipe"
                      fill
                      sizes="75vw"
                      className="object-cover object-left"
                    />
                  </div>
                </div>
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent pointer-events-none z-10"></div>
                
                {/* Logo flutuante */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-6 md:bottom-10 z-20">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-linear-to-r from-orange-500 to-red-500 rounded-full blur-2xl opacity-75 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-full bg-white p-3 shadow-2xl ring-4 ring-white/50 transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                      <Image
                        src="/img/logoSaborDaCasa.jpg"
                        alt="Sabor da Casa"
                        fill
                        sizes="200px"
                        className="object-contain rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Versão Mobile: Com carrossel mas sem parallax scroll */}
            <div className="relative rounded-3xl overflow-hidden bg-white shadow-2xl border-4 border-white lg:hidden">
              <div className="relative h-80 w-full overflow-hidden">
                {/* Container do carrossel com animação infinita */}
                <div className="sliding-carousel absolute inset-0 flex">
                  {/* Imagem original */}
                  <div className="shrink-0 h-full relative" style={{ width: '150%' }}>
                    <Image
                      src="/img/equipe.png"
                      alt="Nossa Equipe"
                      fill
                      priority
                      sizes="150vw"
                      className="object-cover object-left"
                    />
                  </div>
                  {/* Imagem duplicada para loop sem falhas */}
                  <div className="shrink-0 h-full relative" style={{ width: '150%' }}>
                    <Image
                      src="/img/equipe.png"
                      alt="Nossa Equipe"
                      fill
                      sizes="150vw"
                      className="object-cover object-left"
                    />
                  </div>
                </div>
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent pointer-events-none z-10"></div>
                
                {/* Logo sobre a imagem */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-6 z-20">
                  <div className="relative">
                    <div className="absolute inset-0 bg-linear-to-r from-orange-500 to-red-500 rounded-full blur-2xl opacity-75"></div>
                    <div className="relative w-32 h-32 rounded-full bg-white p-3 shadow-2xl ring-4 ring-white/50">
                      <Image
                        src="/img/logoSaborDaCasa.jpg"
                        alt="Sabor da Casa"
                        fill
                        sizes="150px"
                        className="object-contain rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Elementos decorativos flutuantes */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-400 rounded-full blur-3xl opacity-50 animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-red-400 rounded-full blur-3xl opacity-50 animate-pulse animation-delay-1000"></div>
          </div>
        </div>
        
        {/* Detalhes de horário expandido */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-orange-200 p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-bold text-gray-900">Horários de Funcionamento</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="font-semibold text-gray-700">Segunda, Quarta, Quinta e Sexta</span>
                <span className="font-bold text-orange-600">18:00 - 22:30</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="font-semibold text-gray-700">Sábado e Domingo</span>
                <span className="font-bold text-orange-600">17:00 - 23:00</span>
              </div>
              <div className="md:col-span-2 flex justify-center items-center p-3 bg-gray-100 rounded-lg">
                <span className="font-semibold text-gray-700">Terça-feira</span>
                <span className="ml-3 font-bold text-red-600">Fechado</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        @keyframes slide-carousel {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        .sliding-carousel {
          animation: slide-carousel 25s linear infinite;
        }
        
        .sliding-carousel:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}
