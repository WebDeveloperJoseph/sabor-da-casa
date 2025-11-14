import React from 'react';

const PizzaPlaceholderGenerator = () => {
  const downloadAsImage = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Configurar canvas
    canvas.width = 600;
    canvas.height = 400;
    
    // Função para criar gradiente arredondado
    const createRoundedRect = (x, y, width, height, radius) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + width, y, x + width, y + height, radius);
      ctx.arcTo(x + width, y + height, x, y + height, radius);
      ctx.arcTo(x, y + height, x, y, radius);
      ctx.arcTo(x, y, x + width, y, radius);
      ctx.closePath();
    };
    
    // Fundo com gradiente
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#ff6b35');
    gradient.addColorStop(0.5, '#f7931e');
    gradient.addColorStop(1, '#ff8c42');
    
    createRoundedRect(0, 0, canvas.width, canvas.height, 20);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Efeitos decorativos
    const decorGrad1 = ctx.createRadialGradient(120, 120, 0, 120, 120, 200);
    decorGrad1.addColorStop(0, 'rgba(255,255,255,0.2)');
    decorGrad1.addColorStop(1, 'rgba(255,255,255,0)');
    
    const decorGrad2 = ctx.createRadialGradient(480, 280, 0, 480, 280, 150);
    decorGrad2.addColorStop(0, 'rgba(255,255,255,0.15)');
    decorGrad2.addColorStop(1, 'rgba(255,255,255,0)');
    
    ctx.fillStyle = decorGrad1;
    ctx.fill();
    ctx.fillStyle = decorGrad2;
    ctx.fill();
    
    // Pizza circular
    const centerX = canvas.width / 2;
    const centerY = 140;
    const radius = 50;
    
    // Base da pizza
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFE066';
    ctx.fill();
    ctx.strokeStyle = '#FF6B35';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Ingredientes da pizza
    const ingredients = [
      { x: centerX - 20, y: centerY - 15, r: 5, color: '#FF4757' },
      { x: centerX + 20, y: centerY - 10, r: 5, color: '#2ECC71' },
      { x: centerX - 10, y: centerY + 15, r: 5, color: '#FF4757' },
      { x: centerX + 15, y: centerY + 20, r: 5, color: '#2ECC71' },
      { x: centerX, y: centerY - 25, r: 3, color: '#FFA726' },
      { x: centerX + 10, y: centerY + 5, r: 3, color: '#FFA726' },
      { x: centerX - 15, y: centerY + 5, r: 3, color: '#FFA726' }
    ];
    
    ingredients.forEach(ing => {
      ctx.beginPath();
      ctx.arc(ing.x, ing.y, ing.r, 0, 2 * Math.PI);
      ctx.fillStyle = ing.color;
      ctx.fill();
    });
    
    // Fatia destacada
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX, centerY - radius);
    ctx.lineTo(centerX + radius * Math.cos(-Math.PI/6), centerY + radius * Math.sin(-Math.PI/6));
    ctx.strokeStyle = '#FFB74D';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Configurar sombra para texto
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 4;
    
    // Texto principal
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FOTO EM BREVE!', centerX, 230);
    
    // Remover sombra para próximos textos
    ctx.shadowColor = 'transparent';
    
    // Subtexto
    ctx.font = '18px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fillText('Esta deliciosa pizza já está no nosso cardápio', centerX, 265);
    
    // Emojis decorativos
    ctx.font = '24px Arial, sans-serif';
    ctx.fillStyle = 'white';
    ctx.fillText('📸 ✨', centerX, 295);
    
    // Texto final
    ctx.font = 'italic 14px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText('Estamos preparando uma foto incrível para você!', centerX, 325);
    
    // Sparkles
    const sparklePositions = [
      { x: 60, y: 80, emoji: '✨' },
      { x: 540, y: 100, emoji: '⭐' },
      { x: 120, y: 340, emoji: '✨' },
      { x: 480, y: 320, emoji: '⭐' },
      { x: 300, y: 60, emoji: '✨' },
      { x: 270, y: 350, emoji: '⭐' }
    ];
    
    ctx.font = '20px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    sparklePositions.forEach(sparkle => {
      ctx.fillText(sparkle.emoji, sparkle.x, sparkle.y);
    });
    
    // Download
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pizza-placeholder-sabor-da-casa.png';
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png', 1.0);
  };

  return (
    <div style={{
      padding: '20px',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '600px',
        height: '400px',
        background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff8c42 100%)',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '30px'
      }}>
        {/* Efeitos decorativos */}
        <div style={{
          position: 'absolute',
          inset: '0',
          background: `
            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.2) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255,255,255,0.15) 0%, transparent 50%)
          `
        }}></div>
        
        {/* Sparkles */}
        {['✨', '⭐', '✨', '⭐', '✨', '⭐'].map((sparkle, i) => (
          <div key={i} style={{
            position: 'absolute',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '20px',
            ...(i === 0 && { top: '15%', left: '10%' }),
            ...(i === 1 && { top: '25%', right: '15%' }),
            ...(i === 2 && { bottom: '20%', left: '20%' }),
            ...(i === 3 && { bottom: '30%', right: '10%' }),
            ...(i === 4 && { top: '40%', left: '50%' }),
            ...(i === 5 && { bottom: '15%', right: '45%' })
          }}>
            {sparkle}
          </div>
        ))}
        
        {/* Conteúdo principal */}
        <div style={{ zIndex: 2, textAlign: 'center' }}>
          <div style={{
            fontSize: '80px',
            marginBottom: '20px',
            animation: 'spin 4s linear infinite'
          }}>
            🍕
          </div>
          
          <h1 style={{
            color: 'white',
            fontSize: '32px',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            margin: '0 0 10px 0',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            Foto em Breve!
          </h1>
          
          <p style={{
            color: 'rgba(255,255,255,0.95)',
            fontSize: '18px',
            fontWeight: '500',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
            margin: '0 0 15px 0'
          }}>
            Esta deliciosa pizza já está no nosso cardápio
          </p>
          
          <div style={{
            fontSize: '24px',
            margin: '10px 0'
          }}>
            📸 ✨
          </div>
          
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '14px',
            margin: '0',
            fontStyle: 'italic'
          }}>
            Estamos preparando uma foto incrível para você!
          </p>
        </div>
      </div>
      
      <button
        onClick={downloadAsImage}
        style={{
          background: 'linear-gradient(45deg, #ff4757, #ff3742)',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '25px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 5px 15px rgba(255,71,87,0.4)',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}
      >
        📱 Gerar e Baixar PNG
      </button>
      
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default PizzaPlaceholderGenerator;