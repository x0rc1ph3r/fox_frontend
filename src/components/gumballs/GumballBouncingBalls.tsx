import { useEffect, useRef, useState, useCallback } from 'react';
import type { PrizeDataBackend } from '../../../types/backend/gumballTypes';

interface Ball {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  image: string;
  isNft: boolean;
  prizeIndex: number;
}

interface GumballBouncingBallsProps {
  prizes: PrizeDataBackend[];
  isActive: boolean;
  status: string;
}

export const GumballBouncingBalls = ({ prizes, isActive, status }: GumballBouncingBallsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballsRef = useRef<Ball[]>([]);
  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const animationFrameRef = useRef<number>();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Calculate ball sizes based on quantity and isNft
  const calculateBallSize = useCallback((quantity: number, isNft: boolean, maxQuantity: number) => {
    const baseSize = 20;
    const maxSize = 55;
    const nftBonus = isNft ? 12 : 0;
    
    // Normalize quantity to get size multiplier
    const quantityRatio = Math.min(quantity / Math.max(maxQuantity, 1), 1);
    const size = baseSize + (quantityRatio * (maxSize - baseSize - nftBonus)) + nftBonus;
    
    return Math.max(baseSize, Math.min(size, maxSize));
  }, []);

  // Initialize balls from prizes
  const initializeBalls = useCallback(() => {
    if (!dimensions.width || !dimensions.height) return;

    const maxQuantity = Math.max(...prizes.map(p => p.quantity), 1);
    const newBalls: Ball[] = [];
    
    prizes.forEach((prize, prizeIndex) => {
      // Create balls based on quantity (but cap at reasonable number for performance)
      const ballCount = Math.min(prize.quantity, 15);
      const radius = calculateBallSize(prize.quantity, prize.isNft, maxQuantity);
      
      for (let i = 0; i < ballCount; i++) {
        const padding = radius + 10;
        newBalls.push({
          id: `${prizeIndex}-${i}`,
          x: padding + Math.random() * (dimensions.width - padding * 2),
          y: padding + Math.random() * (dimensions.height - padding * 2),
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          radius,
          image: prize.image || '/images/gumballs/sol-img-frame.png',
          isNft: prize.isNft,
          prizeIndex,
        });
      }
    });

    ballsRef.current = newBalls;
  }, [prizes, dimensions, calculateBallSize]);

  // Preload images
  useEffect(() => {
    const imageUrls = new Set(prizes.map(p => p.image || '/images/gumballs/sol-img-frame.png'));
    
    imageUrls.forEach(url => {
      if (!imagesRef.current.has(url)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = url;
        imagesRef.current.set(url, img);
      }
    });
  }, [prizes]);

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Initialize balls when dimensions change
  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      initializeBalls();
    }
  }, [dimensions, initializeBalls]);

  // Animation loop - floating movement
  useEffect(() => {
    if (!canvasRef.current || !dimensions.width || !dimensions.height) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Store time offset for each ball for smooth sine wave movement
    const timeOffsets = ballsRef.current.map(() => Math.random() * Math.PI * 2);

    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      time += 0.015;

      // Update and draw balls with floating motion
      ballsRef.current.forEach((ball, index) => {
        const offset = timeOffsets[index];
        
        // Gentle floating movement using sine waves
        ball.vx = Math.sin(time + offset) * 0.5;
        ball.vy = Math.cos(time * 0.7 + offset) * 0.4;

        // Update position
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Soft boundary wrapping - gently redirect when near edges
        const padding = ball.radius + 5;
        if (ball.x < padding) {
          ball.x = padding;
        } else if (ball.x > dimensions.width - padding) {
          ball.x = dimensions.width - padding;
        }

        if (ball.y < padding) {
          ball.y = padding;
        } else if (ball.y > dimensions.height - padding) {
          ball.y = dimensions.height - padding;
        }

        // Draw soft shadow
        ctx.beginPath();
        ctx.arc(ball.x + 3, ball.y + 3, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fill();

        // Draw ball
        ctx.save();
        
        // Create circular clip for image
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Draw image or fallback
        const img = imagesRef.current.get(ball.image);
        if (img && img.complete && img.naturalWidth > 0) {
          ctx.drawImage(
            img,
            ball.x - ball.radius,
            ball.y - ball.radius,
            ball.radius * 2,
            ball.radius * 2
          );
        } else {
          // Fallback gradient
          const gradient = ctx.createRadialGradient(
            ball.x - ball.radius * 0.3,
            ball.y - ball.radius * 0.3,
            0,
            ball.x,
            ball.y,
            ball.radius
          );
          gradient.addColorStop(0, ball.isNft ? '#ff69b4' : '#ffd700');
          gradient.addColorStop(1, ball.isNft ? '#ff1493' : '#ff8c00');
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        ctx.restore();

        // Draw border ring
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.strokeStyle = ball.isNft 
          ? 'rgba(255, 20, 147, 0.6)' 
          : 'rgba(200, 200, 200, 0.8)';
        ctx.lineWidth = ball.isNft ? 3 : 2;
        ctx.stroke();

        // Add glow effect for NFTs
        if (ball.isNft) {
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, ball.radius + 4, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 20, 147, 0.2)';
          ctx.lineWidth = 4;
          ctx.stroke();
        }
      });

      // Soft collision - balls gently push each other
      for (let i = 0; i < ballsRef.current.length; i++) {
        for (let j = i + 1; j < ballsRef.current.length; j++) {
          const ball1 = ballsRef.current[i];
          const ball2 = ballsRef.current[j];
          
          const dx = ball2.x - ball1.x;
          const dy = ball2.y - ball1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDist = ball1.radius + ball2.radius + 5;

          if (distance < minDist) {
            const angle = Math.atan2(dy, dx);
            const overlap = minDist - distance;
            
            // Gently separate balls
            const separationX = (overlap / 2) * Math.cos(angle) * 0.3;
            const separationY = (overlap / 2) * Math.sin(angle) * 0.3;
            
            ball1.x -= separationX;
            ball1.y -= separationY;
            ball2.x += separationX;
            ball2.y += separationY;
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions]);

  // Calculate total balls count
  const totalBalls = prizes.reduce((sum, prize) => sum + Math.min(prize.quantity, 15), 0);

  if (!prizes || prizes.length === 0) {
    return (
      <div className="w-full h-[506px] rounded-[20px] bg-white flex items-center justify-center">
        <p className="text-gray-400 font-inter">No prizes available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Gumball machine container */}
      <div 
        ref={containerRef}
        className="relative w-full h-[506px] rounded-[20px] overflow-hidden bg-white"
      >
        {/* Canvas for floating balls */}
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="absolute inset-0"
        />

        {/* Inactive overlay */}
        {!isActive && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <p className='md:text-[28px] text-lg text-white font-bold font-inter'>
              {status === "CANCELLED" ? "Cancelled" : (status === "COMPLETED_SUCCESSFULLY" || status === "COMPLETED_FAILED") ? "Sale Ended" : "Not Started"}
            </p>
          </div>
        )}

        {/* Ball count indicator */}
        <div className="absolute top-4 right-4 bg-gray-100 px-3 py-1.5 rounded-full z-20">
          <span className="text-gray-600 text-sm font-inter font-medium">
            {totalBalls} {totalBalls === 1 ? 'prize' : 'prizes'}
          </span>
        </div>
      </div>
    </div>
  );
};

