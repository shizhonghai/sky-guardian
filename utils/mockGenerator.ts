export const generateVehicleCapture = (plate: string, color: string, type: string, timestamp: string): string => {
  if (typeof document === 'undefined') return ''; // Server-side guard

  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 450;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Parse time to determine day/night
  const hour = parseInt(timestamp.split(' ')[1]?.split(':')[0] || '12');
  const isNight = hour < 6 || hour > 18;

  // 1. Background (Street scene)
  const gradient = ctx.createLinearGradient(0, 0, 0, 450);
  if (isNight) {
    gradient.addColorStop(0, '#0f172a'); 
    gradient.addColorStop(1, '#1e293b');
  } else {
    gradient.addColorStop(0, '#64748b');
    gradient.addColorStop(1, '#94a3b8');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 450);

  // Road
  ctx.fillStyle = isNight ? '#334155' : '#475569';
  ctx.beginPath();
  ctx.moveTo(0, 450);
  ctx.lineTo(800, 450);
  ctx.lineTo(550, 200);
  ctx.lineTo(250, 200);
  ctx.fill();

  // Lane markings
  ctx.strokeStyle = isNight ? '#94a3b8' : '#cbd5e1';
  ctx.lineWidth = 4;
  ctx.setLineDash([40, 60]);
  ctx.beginPath();
  ctx.moveTo(400, 200);
  ctx.lineTo(400, 450);
  ctx.stroke();
  ctx.setLineDash([]);

  // 2. Car Body (Simplified Front View)
  let carColor = '#94a3b8'; // default
  if (color.includes('黑')) carColor = '#171717';
  else if (color.includes('白')) carColor = '#f8fafc';
  else if (color.includes('红')) carColor = '#dc2626';
  else if (color.includes('蓝')) carColor = '#2563eb';
  else if (color.includes('银') || color.includes('灰')) carColor = '#9ca3af';
  else if (color.includes('金') || color.includes('香槟')) carColor = '#d97706';
  else if (color.includes('绿')) carColor = '#16a34a';

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.ellipse(400, 390, 200, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body shape
  ctx.fillStyle = carColor;
  ctx.beginPath();
  // Hood top
  ctx.moveTo(280, 280);
  ctx.lineTo(520, 280);
  // Windshield sides
  ctx.lineTo(550, 350); 
  ctx.lineTo(250, 350);
  ctx.fill();
  
  // Lower body
  ctx.fillRect(240, 350, 320, 60);

  // Windshield
  ctx.fillStyle = isNight ? '#1e293b' : '#334155';
  ctx.beginPath();
  ctx.moveTo(300, 280);
  ctx.lineTo(500, 280);
  ctx.lineTo(530, 350);
  ctx.lineTo(270, 350);
  ctx.fill();

  // Headlights
  const lightColor = isNight ? '#fef08a' : '#e2e8f0';
  ctx.fillStyle = lightColor;
  // Left
  ctx.beginPath();
  ctx.ellipse(280, 370, 25, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Right
  ctx.beginPath();
  ctx.ellipse(520, 370, 25, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glare (if night)
  if (isNight) {
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = 40;
      ctx.fillStyle = 'rgba(254, 240, 138, 0.5)';
      ctx.beginPath();
      ctx.ellipse(280, 370, 40, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(520, 370, 40, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
  }

  // 3. License Plate
  // NEV plates are longer (8 characters usually vs 7, or 9 chars total including hyphen)
  // Standard: 赣E·12345 (8 chars)
  // NEV: 赣E·D12345 (9 chars)
  // Using solid dot '·' instead of '-'
  const isGreen = plate.length > 8 || color.includes('新能源') || type.includes('新能源');
  
  const px = 330;
  const py = 385;
  const pw = 140;
  const ph = 40;

  // Plate BG
  if (isGreen) {
      const g = ctx.createLinearGradient(px, py, px, py + ph);
      g.addColorStop(0, '#fbfdfc'); // White fade at top
      g.addColorStop(0.3, '#bef264'); // Light green
      g.addColorStop(1, '#16a34a'); // Green
      ctx.fillStyle = g;
  } else {
      ctx.fillStyle = '#1d4ed8'; // Blue
  }
  ctx.fillRect(px, py, pw, ph);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.strokeRect(px, py, pw, ph);

  // Plate Text
  ctx.fillStyle = isGreen ? '#000' : '#fff';
  // Adjust font size for longer plates (NEV)
  const fontSize = plate.length > 8 ? 20 : 24; 
  // Use sans-serif for better looking dots and standard plate look
  ctx.font = `bold ${fontSize}px sans-serif`;
  
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Lift the text slightly to align visually in the box
  ctx.fillText(plate, px + pw / 2, py + ph / 2 + 2);

  // 4. OSD Text (Watermark)
  ctx.font = '14px monospace';
  ctx.fillStyle = '#fff';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 4;
  ctx.textAlign = 'left';
  ctx.fillText(`CAM-0${Math.floor(Math.random()*9)+1} | ${timestamp}`, 20, 30);
  ctx.textAlign = 'right';
  ctx.fillText(type.toUpperCase(), 780, 30);

  return canvas.toDataURL('image/jpeg', 0.7);
};