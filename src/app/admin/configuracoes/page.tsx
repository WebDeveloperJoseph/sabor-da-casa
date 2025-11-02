import { Settings } from 'lucide-react'

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-orange-100 p-6 shadow-sm">
        <h1 className="text-4xl font-bold bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center">
          <Settings className="w-10 h-10 mr-4 text-orange-600" />
          Configurações — em breve
        </h1>
        <p className="text-gray-600 mt-2">Esta área está temporariamente desabilitada. Novas funcionalidades serão implementadas futuramente.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-100 p-8">
        <div className="text-center py-12">
          <p className="text-gray-700 text-lg">Estamos preparando novidades para você ajustar o sistema do seu jeito.</p>
          <p className="text-gray-500 text-sm mt-2">Fique à vontade para navegar pelas outras seções do painel.</p>
        </div>
      </div>
    </div>
  )
}
