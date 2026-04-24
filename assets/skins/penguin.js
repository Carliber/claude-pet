window.SKINS = window.SKINS || {};
window.SKINS.penguin = {
  name: '企鹅',
  shadowColor: 'rgba(60,120,200,0.25)',
  draw(ctx, state) {
    ctx.clearRect(0, 0, 120, 120);
    ctx.save();
    ctx.scale(1.2, 1.2);

    // Body (black oval)
    ctx.shadowColor = 'rgba(60,120,200,0.3)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#2d3748';
    ctx.beginPath(); ctx.ellipse(50, 55, 30, 38, 0, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;

    // Belly (white oval)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(50, 58, 20, 28, 0, 0, Math.PI*2); ctx.fill();

    // Head
    ctx.fillStyle = '#2d3748';
    ctx.beginPath(); ctx.arc(50, 25, 22, 0, Math.PI*2); ctx.fill();

    // Face patch (white)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(50, 28, 15, 12, 0, 0, Math.PI*2); ctx.fill();

    // Eyes
    if (state === 'SLEEPING') {
      ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(38,25); ctx.lineTo(48,25); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(52,25); ctx.lineTo(62,25); ctx.stroke();
    } else if (state === 'HAPPY' || state === 'DONE') {
      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.arc(42, 25, 3, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(58, 25, 3, 0, Math.PI*2); ctx.fill();
      // Blush
      ctx.fillStyle = 'rgba(255,150,150,0.4)';
      ctx.beginPath(); ctx.arc(35, 30, 4, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(65, 30, 4, 0, Math.PI*2); ctx.fill();
    } else if (state === 'SURPRISED') {
      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.arc(42, 24, 4.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(58, 24, 4.5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(43, 23, 1.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(59, 23, 1.5, 0, Math.PI*2); ctx.fill();
    } else if (state === 'CRYING') {
      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.arc(42, 25, 3, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(58, 25, 3, 0, Math.PI*2); ctx.fill();
      // Tears
      ctx.fillStyle = '#4fc3f7';
      ctx.beginPath(); ctx.ellipse(36, 30, 2, 4, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(64, 30, 2, 4, 0, 0, Math.PI*2); ctx.fill();
    } else if (state === 'ANGRY') {
      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.arc(42, 26, 3, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(58, 26, 3, 0, Math.PI*2); ctx.fill();
      // Angry brows
      ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(35,19); ctx.lineTo(47,21); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(65,19); ctx.lineTo(53,21); ctx.stroke();
    } else {
      // Normal eyes
      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.arc(42, 25, 3.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(58, 25, 3.5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(43, 24, 1.2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(59, 24, 1.2, 0, Math.PI*2); ctx.fill();
    }

    // Beak
    if (state === 'HAPPY' || state === 'DONE') {
      ctx.fillStyle = '#f6ad55';
      ctx.beginPath(); ctx.moveTo(44,31); ctx.lineTo(50,38); ctx.lineTo(56,31); ctx.closePath(); ctx.fill();
    } else if (state === 'SURPRISED') {
      ctx.fillStyle = '#f6ad55';
      ctx.beginPath(); ctx.arc(50, 34, 4, 0, Math.PI*2); ctx.fill();
    } else if (state === 'CODING' || state === 'EXECUTING') {
      ctx.fillStyle = '#f6ad55';
      ctx.beginPath(); ctx.moveTo(44,31); ctx.lineTo(50,37); ctx.lineTo(56,31); ctx.closePath(); ctx.fill();
    } else {
      ctx.fillStyle = '#f6ad55';
      ctx.beginPath(); ctx.moveTo(44,30); ctx.lineTo(50,36); ctx.lineTo(56,30); ctx.closePath(); ctx.fill();
    }

    // Flippers (wings)
    ctx.fillStyle = '#2d3748';
    // Left flipper
    ctx.beginPath();
    ctx.moveTo(20, 45);
    ctx.quadraticCurveTo(10, 60, 16, 80);
    ctx.lineTo(22, 75);
    ctx.quadraticCurveTo(22, 58, 25, 45);
    ctx.closePath(); ctx.fill();
    // Right flipper
    ctx.beginPath();
    ctx.moveTo(80, 45);
    ctx.quadraticCurveTo(90, 60, 84, 80);
    ctx.lineTo(78, 75);
    ctx.quadraticCurveTo(78, 58, 75, 45);
    ctx.closePath(); ctx.fill();

    // Feet
    ctx.fillStyle = '#f6ad55';
    ctx.beginPath(); ctx.ellipse(38, 94, 10, 4, -0.2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(62, 94, 10, 4, 0.2, 0, Math.PI*2); ctx.fill();

    // State-specific extras
    if (state === 'THINKING' || state === 'ANALYZING') {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath(); ctx.arc(75, 12, 7, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(84, 5, 4.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(90, 0, 2.5, 0, Math.PI*2); ctx.fill();
    }
    if (state === 'SLEEPING') {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 9px sans-serif'; ctx.fillText('Z', 75, 12);
      ctx.font = 'bold 7px sans-serif'; ctx.fillText('z', 84, 5);
      ctx.font = 'bold 5px sans-serif'; ctx.fillText('z', 90, 0);
    }
    if (state === 'CODING' || state === 'EXECUTING') {
      // Sweat drop
      ctx.fillStyle = '#4fc3f7';
      ctx.beginPath(); ctx.ellipse(72, 18, 2, 3, 0, 0, Math.PI*2); ctx.fill();
    }

    ctx.restore();
  }
};
