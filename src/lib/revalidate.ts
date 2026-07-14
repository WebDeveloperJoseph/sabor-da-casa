import { revalidatePath } from "next/cache";

/** Invalida o cache do cardápio público após alterações no admin. */
export function revalidatePublicMenu() {
  revalidatePath("/");
}
