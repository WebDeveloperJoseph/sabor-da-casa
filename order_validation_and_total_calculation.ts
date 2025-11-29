// ... existing code ...
    // Validar dados recebidos
    if (!body.itens || body.itens.length === 0) {
      return NextResponse.json(
        { error: "O pedido deve conter pelo menos um item" },
        { status: 400 }
      );
    }

    // Calcular total considerando o preço da borda se houver
    const total = body.itens.reduce((acc: number, item: any) => {
      const precoItem = Number(item.preco);
      const precoBorda = item.borda?.preco ? Number(item.borda.preco) : 0;
      return acc + ((precoItem + precoBorda) * item.quantidade);
    }, 0);

    // Criar pedido no banco de dados
    const pedido = await prisma.pedido.create({
      data: {
// ... existing code ...
