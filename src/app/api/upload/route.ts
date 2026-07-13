import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

function sanitizeSegment(value: string) {
  return value
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-zA-Z0-9/_-]/g, "-")
    .replace(/\/{2,}/g, "/");
}

function getFileExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{1,10}$/.test(fromName)) {
    return fromName;
  }

  if (file.type.startsWith("image/")) {
    const fromType = file.type.split("/")[1]?.toLowerCase();
    if (fromType && /^[a-z0-9.+-]{1,15}$/.test(fromType)) {
      return fromType === "jpeg" ? "jpg" : fromType;
    }
  }

  return "bin";
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
    const bucket = (formData.get("bucket") as string) || "pratos";
    const prefix = (formData.get("prefix") as string) || "uploads";

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
    const extension = getFileExtension(file);
    const path = `${safePrefix}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

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
            details: uploadError.message,
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
