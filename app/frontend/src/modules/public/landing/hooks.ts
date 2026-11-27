import React, { useEffect, useRef, useState } from 'react';
import {
  DEFAULT_LANDING_APPEARANCE,
  type LandingContent,
  type SimulatorProduct,
} from '../../../shared/lib/landingContent';

type TimerRef = ReturnType<typeof setTimeout> | null;

function clearTimer(ref: React.MutableRefObject<TimerRef>): void {
  if (ref.current !== null) {
    clearTimeout(ref.current);
    ref.current = null;
  }
}

function buildInitialQuantities(products: SimulatorProduct[]): Record<number, number> {
  const result: Record<number, number> = {};
  products.forEach((product) => {
    const value = Number(product.defaultQty);
    result[product.id] = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  });
  return result;
}

export function useLandingInteractions(content: LandingContent) {
  // El CMS puede publicar formas inesperadas: nunca dejamos que un array se
  // convierta en objeto (o viceversa) y rompa un `.map()`.
  const words = Array.isArray(content.words) ? content.words : [];
  const statuses = Array.isArray(content.statuses) ? content.statuses : [];
  const rolesData = Array.isArray(content.roles?.data) ? content.roles.data : [];
  const simulatorTypes = Array.isArray(content.simulator?.types) ? content.simulator.types : [];

  const simulatorProductsByType: Record<string, SimulatorProduct[]> = {};
  const publishedGroups = content.simulator?.productsByType;
  if (publishedGroups && typeof publishedGroups === 'object' && !Array.isArray(publishedGroups)) {
    Object.entries(publishedGroups).forEach(([key, value]) => {
      if (Array.isArray(value)) simulatorProductsByType[key] = value as SimulatorProduct[];
    });
  }

  const appearance = { ...DEFAULT_LANDING_APPEARANCE, ...(content.appearance ?? {}) };

  // 1. Typewriter. `words` entra en las dependencias para que un cambio del
  //    CMS se refleje sin esperar a que termine la palabra anterior.
  const [typewriterText, setTypewriterText] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!words.length) {
      setTypewriterText('');
      return;
    }
    const currentWord = words[wordIdx % words.length] ?? '';
    let timeout: TimerRef = null;

    if (!isDeleting && charIdx < currentWord.length) {
      timeout = setTimeout(() => {
        setTypewriterText(currentWord.slice(0, charIdx + 1));
        setCharIdx((c) => c + 1);
      }, 75);
    } else if (!isDeleting && charIdx === currentWord.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1800);
    } else if (isDeleting && charIdx > 0) {
      timeout = setTimeout(() => {
        setTypewriterText(currentWord.slice(0, charIdx - 1));
        setCharIdx((c) => c - 1);
      }, 35);
    } else if (isDeleting && charIdx === 0) {
      setIsDeleting(false);
      setWordIdx((w) => (w + 1) % words.length);
    }

    return () => {
      if (timeout !== null) clearTimeout(timeout);
    };
  }, [charIdx, isDeleting, wordIdx, words]);

  // 2. Barra de progreso: se recalcula la altura real en cada frame (limitado
  //    por rAF) y un ResizeObserver detecta contenido async/imágenes del CMS.
  const progressRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    let ticking = false;
    let disposed = false;

    const update = () => {
      ticking = false;
      if (disposed) return;
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const progress = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
      if (progressRef.current) progressRef.current.style.width = `${progress}%`;
    };
    const handleScroll = () => {
      if (!ticking && !disposed) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(handleScroll)
      : null;
    observer?.observe(document.body);

    update();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      disposed = true;
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      observer?.disconnect();
    };
  }, [content]);

  // 3. Particle network canvas (color, opacidad y cantidad editables)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particleColor = appearance.particleColor;
  const particleOpacity = Math.min(1, Math.max(0, appearance.particleOpacity / 100));
  const particleCount = Math.min(120, Math.max(0, Math.floor(appearance.particleCount) || 0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !appearance.particlesEnabled || particleCount === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Respeta "prefers-reduced-motion": sin animación de partículas.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    let animId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const mouse = { x: -999, y: -999 };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    const count = window.innerWidth < 700
      ? Math.round(particleCount * 0.45)
      : particleCount;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.3 + 1,
    }));

    const render = () => {
      // Marca el frame actual como pendiente de renovar: evita duplicar el
      // bucle cuando la pestaña vuelve a hacerse visible.
      animId = 0;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        const distMouse = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (distMouse < 140) {
          p.x += (p.x - mouse.x) * 0.006;
          p.y += (p.y - mouse.y) * 0.006;
        }

        ctx.fillStyle = particleColor;
        ctx.globalAlpha = particleOpacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 120) {
            ctx.globalAlpha = (1 - dist / 120) * 0.36 * particleOpacity;
            ctx.strokeStyle = particleColor;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      if (!document.hidden) animId = requestAnimationFrame(render);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        if (animId) {
          cancelAnimationFrame(animId);
          animId = 0;
        }
      } else if (!animId) {
        render();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [appearance.particlesEnabled, particleColor, particleOpacity, particleCount]);

  // 4. Stepper & Telemetry
  const [currentStep, setCurrentStep] = useState(0);
  const [autoStep, setAutoStep] = useState(true);
  const [simulatedDeliverySuccess, setSimulatedDeliverySuccess] = useState(false);
  const successTimerRef = useRef<TimerRef>(null);
  const orderTimerRef = useRef<TimerRef>(null);

  useEffect(() => () => {
    clearTimer(successTimerRef);
    clearTimer(orderTimerRef);
  }, []);

  useEffect(() => {
    if (!statuses.length) {
      setCurrentStep(0);
      return;
    }
    if (currentStep >= statuses.length) setCurrentStep(0);
    if (!autoStep) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % statuses.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [autoStep, currentStep, statuses.length]);

  const handleManualStep = (idx: number) => {
    setAutoStep(false);
    setCurrentStep(idx);
  };

  /** Pausa/reanuda el avance automático a petición del usuario. */
  const handleToggleAuto = () => {
    setAutoStep((prev) => !prev);
  };

  const handleSimulateFastForward = () => {
    setAutoStep(false);
    setCurrentStep(Math.max(0, statuses.length - 1));
    setSimulatedDeliverySuccess(true);
    clearTimer(successTimerRef);
    successTimerRef.current = setTimeout(() => {
      successTimerRef.current = null;
      setSimulatedDeliverySuccess(false);
    }, 3000);
  };

  // 5. Simulator State. La clave activa y las cantidades se derivan del CMS
  //    publicado (incluido `defaultQty`) y se corrigen si el técnico cambia
  //    las claves o los productos.
  const availableTypeKeys = Object.keys(simulatorProductsByType);
  const availableTypeKeysKey = availableTypeKeys.join('|');
  const fallbackType = simulatorTypes[0]?.key ?? availableTypeKeys[0] ?? '';

  const [selectedType, setSelectedType] = useState(fallbackType);
  const currentProducts = simulatorProductsByType[selectedType]
    ?? simulatorProductsByType[fallbackType]
    ?? [];

  const [quantities, setQuantities] = useState<Record<number, number>>(
    () => buildInitialQuantities(currentProducts)
  );

  useEffect(() => {
    const validKeys = simulatorTypes.map((type) => type.key).filter(Boolean);
    if (!validKeys.includes(selectedType)) {
      setSelectedType(validKeys[0] ?? availableTypeKeys[0] ?? '');
    }
  }, [simulatorTypes, selectedType, availableTypeKeysKey]);

  useEffect(() => {
    setQuantities((prev) => {
      const stillValid = currentProducts.some((product) => prev[product.id] !== undefined);
      return stillValid ? prev : buildInitialQuantities(currentProducts);
    });
  }, [currentProducts]);

  const [cufeCode, setCufeCode] = useState('8f3b92c47a1098e21054de74b39a...01cb');
  const [orderTransmittedMsg, setOrderTransmittedMsg] = useState(false);

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    const products = simulatorProductsByType[type]
      ?? simulatorProductsByType[fallbackType]
      ?? [];
    setQuantities(buildInitialQuantities(products));
  };

  const handleQuantity = (id: number, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  // Simulator calculations
  const rawSubtotal = currentProducts.reduce((acc, p) => acc + p.price * (quantities[p.id] || 0), 0);
  const fefoSavings = currentProducts.reduce((acc, p) => acc + p.price * (quantities[p.id] || 0) * p.fefoDiscount, 0);
  const subtotalAfterFefo = rawSubtotal - fefoSavings;
  const tax = Math.round(subtotalAfterFefo * 0.08); // 8% Impoconsumo
  const totalPayable = subtotalAfterFefo + tax;

  const handleEmitOrder = () => {
    const randHash = Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setCufeCode(`${randHash.slice(0, 16)}...${randHash.slice(-12)}`);
    setOrderTransmittedMsg(true);
    clearTimer(orderTimerRef);
    orderTimerRef.current = setTimeout(() => {
      orderTimerRef.current = null;
      setOrderTransmittedMsg(false);
    }, 3500);
  };

  // 6. Role Explorer Tabs
  const [activeRole, setActiveRole] = useState(rolesData[0]?.key ?? 'admin');

  useEffect(() => {
    if (!rolesData.some((role) => role.key === activeRole)) {
      setActiveRole(rolesData[0]?.key ?? '');
    }
  }, [rolesData, activeRole]);

  // 7. 3D Card Tilt handler
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    card.style.setProperty('--ry', (px - 0.5) * 12 + 'deg');
    card.style.setProperty('--rx', (0.5 - py) * 12 + 'deg');
    card.style.setProperty('--mx', px * 100 + '%');
    card.style.setProperty('--my', py * 100 + '%');
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  };

  return {
    content,
    typewriterText,
    progressRef,
    canvasRef,
    currentStep,
    autoStep,
    simulatedDeliverySuccess,
    handleManualStep,
    handleToggleAuto,
    handleSimulateFastForward,
    selectedType,
    currentProducts,
    quantities,
    cufeCode,
    orderTransmittedMsg,
    handleTypeChange,
    handleQuantity,
    rawSubtotal,
    fefoSavings,
    subtotalAfterFefo,
    tax,
    totalPayable,
    handleEmitOrder,
    activeRole,
    setActiveRole,
    handleCardMouseMove,
    handleCardMouseLeave,
  };
}

export type LandingInteractions = ReturnType<typeof useLandingInteractions>;
