import { redirect } from 'next/navigation'

export default async function EditarPizzaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/admin/pratos/${id}`)
}