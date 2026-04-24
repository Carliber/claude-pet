window.SKINS = window.SKINS || {};
window.SKINS.crab = {
  name: '螃蟹',
  shadowColor: 'rgba(255,107,53,0.25)',
  draw(ctx, state) {
    ctx.clearRect(0, 0, 120, 120);
    ctx.save();
    ctx.scale(1.2, 1.2);

    ctx.shadowColor = 'rgba(255,107,53,0.3)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ff6b35';
    roundRect(ctx, 20, 40, 60, 40, 10);
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    roundRect(ctx, 24, 42, 52, 12, 6);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(35, 35, 8, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(65, 35, 8, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath(); ctx.arc(37, 33, 2.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(67, 33, 2.5, 0, Math.PI*2); ctx.fill();

    if (state === 'SLEEPING') {
      ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(29,35); ctx.lineTo(41,35); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(59,35); ctx.lineTo(71,35); ctx.stroke();
      ctx.strokeStyle = '#8b0000'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(50, 58, 6, 0.1*Math.PI, 0.9*Math.PI); ctx.stroke();
    } else if (state === 'CRYING') {
      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.arc(35, 35, 3, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(65, 35, 3, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#8b0000';
      ctx.beginPath(); ctx.ellipse(50, 65, 8, 5, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#4fc3f7';
      ctx.beginPath(); ctx.ellipse(30, 46, 2, 4, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(70, 46, 2, 4, 0, 0, Math.PI*2); ctx.fill();
    } else if (state === 'HAPPY' || state === 'DONE') {
      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.arc(35, 33, 3.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(65, 33, 3.5, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#8b0000'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(50, 58, 8, 0.1*Math.PI, 0.9*Math.PI); ctx.stroke();
    } else if (state === 'SURPRISED') {
      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.arc(35, 35, 5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(65, 35, 5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#8b0000';
      ctx.beginPath(); ctx.arc(50, 62, 7, 0, Math.PI*2); ctx.fill();
    } else if (state === 'ANGRY') {
      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.arc(35, 35, 3.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(65, 35, 3.5, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(28, 26); ctx.lineTo(40, 28); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(72, 26); ctx.lineTo(60, 28); ctx.stroke();
      ctx.fillStyle = '#8b0000';
      ctx.beginPath(); ctx.ellipse(50, 63, 10, 5, 0, 0, Math.PI*2); ctx.fill();
    } else {
      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.arc(35, 35, 3.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(65, 35, 3.5, 0, Math.PI*2); ctx.fill();
    }

    ctx.fillStyle = '#ff7b47';
    ctx.beginPath(); ctx.arc(15, 55, 12, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(85, 55, 12, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ff6b35';
    ctx.beginPath(); ctx.arc(8, 45, 6, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(92, 45, 6, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.arc(14, 52, 5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(84, 52, 5, 0, Math.PI*2); ctx.fill();

    if (state === 'CODING' || state === 'EXECUTING') {
      ctx.fillStyle = '#8b0000';
      ctx.beginPath(); ctx.ellipse(50, 65, 8, 5, 0, 0, Math.PI*2); ctx.fill();
    }
    if (state === 'THINKING' || state === 'ANALYZING') {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath(); ctx.arc(75, 20, 7, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(84, 11, 4.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(90, 5, 2.5, 0, Math.PI*2); ctx.fill();
    }
    if (state === 'SLEEPING') {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 9px sans-serif'; ctx.fillText('Z', 75, 18);
      ctx.font = 'bold 7px sans-serif'; ctx.fillText('z', 84, 10);
      ctx.font = 'bold 5px sans-serif'; ctx.fillText('z', 90, 5);
    }
    ctx.restore();
  }
};

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x+r, y);
  c.lineTo(x+w-r, y); c.quadraticCurveTo(x+w, y, x+w, y+r);
  c.lineTo(x+w, y+h-r); c.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  c.lineTo(x+r, y+h); c.quadraticCurveTo(x, y+h, x, y+h-r);
  c.lineTo(x, y+r); c.quadraticCurveTo(x, y, x+r, y);
  c.closePath(); c.fill();
}
