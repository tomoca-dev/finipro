
import React, { useEffect, useRef } from 'react';

const GlobeSalesMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width;
    let height = canvas.height;
    let rotation = 0;

    const points: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < 400; i++) {
      const lat = Math.acos(2 * Math.random() - 1) - Math.PI / 2;
      const lng = 2 * Math.PI * Math.random();
      const r = 140;
      points.push({
        x: r * Math.cos(lat) * Math.cos(lng),
        y: r * Math.sin(lat),
        z: r * Math.cos(lat) * Math.sin(lng),
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      rotation += 0.005;

      const centerX = width / 2;
      const centerY = height / 2;

      points.forEach((p) => {
        // Rotate around Y axis
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        const z = p.z * cos - p.x * sin;
        const x = p.z * sin + p.x * cos;
        const y = p.y;

        // Simple projection
        const scale = 300 / (300 + z);
        const px = x * scale + centerX;
        const py = y * scale + centerY;

        if (z < 100) {
          const alpha = Math.max(0.1, 1 - (z + 140) / 280);
          ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw active sales arcs
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.setLineDash([5, 10]);
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 140, 140, 0, 0, Math.PI * 2);
      ctx.stroke();

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <div className="relative w-full h-[350px] flex items-center justify-center">
      <canvas ref={canvasRef} width={500} height={400} className="max-w-full h-auto drop-shadow-2xl" />
      <div className="absolute bottom-4 left-4 space-y-2 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Live Global Sales Ingestion</span>
        </div>
        <div className="text-[10px] text-slate-500 font-medium">Monitoring 14 regional nodes</div>
      </div>
    </div>
  );
};

export default GlobeSalesMap;
