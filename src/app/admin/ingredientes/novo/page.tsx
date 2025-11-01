import FormularioIngrediente from '@/components/admin/FormularioIngrediente'

export default function NovoIngredientePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Novo ingrediente</h1>
      <FormularioIngrediente />
    </div>
  )
}
