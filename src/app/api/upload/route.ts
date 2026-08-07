import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

function sanitizeSegment(value: string) {
  return value
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-zA-Z0-9/_-]/g, "-")
    .replace(/\/{2,}/g, "/");
}

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

function temAssinaturaValida(buffer: Buffer, type: string) {
  if (type === "image/jpeg") return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (type === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (type === "image/gif") return ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString("ascii"));
  if (type === "image/webp") return buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  if (type === "image/avif") return buffer.subarray(4, 12).toString("ascii").includes("ftypavif");
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const { authenticated } = await requireAuth();
    if (!authenticated) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    // Validar configuração do Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // Tentar usar service role primeiro, senão usar anon key
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          message:
            "Configuração do Supabase não encontrada. Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY",
        },
        { status: 500 },
      );
    }

    // Obter arquivo do FormData
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const bucket = "pratos";
    const prefix = "uploads";

    if (!file) {
      return NextResponse.json(
        { message: "Arquivo não encontrado" },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "Apenas arquivos de imagem são permitidos" },
        { status: 400 },
      );
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          message:
            "Formato não suportado. Use JPG, PNG, WEBP, GIF ou AVIF.",
        },
        { status: 400 },
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        { message: "Arquivo inválido" },
        { status: 400 },
      );
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json(
        {
          message: "A imagem excede o limite de 10MB. Envie um arquivo menor.",
        },
        { status: 400 },
      );
    }

    // Criar cliente Supabase com service role key (mais permissões)
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Fazer upload
    const safePrefix = sanitizeSegment(prefix) || "uploads";
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (!temAssinaturaValida(buffer, file.type)) {
      return NextResponse.json({ message: "O conteúdo do arquivo não corresponde a uma imagem válida" }, { status: 400 });
    }
    const extension = EXTENSION_BY_TYPE[file.type];
    const path = `${safePrefix}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    console.log("Tentando upload:", {
      bucket,
      path,
      size: buffer.length,
      type: file.type,
    });

    const { error: uploadError, data: uploadData } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Erro no upload Supabase:", uploadError);

      // Se o erro for de autenticação, dar instruções claras
      if (
        uploadError.message.includes("signature") ||
        uploadError.message.includes("JWT")
      ) {
        return NextResponse.json(
          {
            message:
              'Erro de autenticação com Supabase Storage. Você precisa: 1) Tornar o bucket "pratos" público no Supabase Dashboard, OU 2) Adicionar SUPABASE_SERVICE_ROLE_KEY no .env.local',
          },
          { status: 500 },
        );
      }

      throw uploadError;
    }

    console.log("Upload bem-sucedido:", uploadData);

    // Obter URL pública
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);

    if (!data?.publicUrl) {
      throw new Error("Não foi possível obter URL pública");
    }

    return NextResponse.json({ url: data.publicUrl });
  } catch (error) {
    console.error("Erro na API de upload:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro no upload" },
      { status: 500 },
    );
  }
}
