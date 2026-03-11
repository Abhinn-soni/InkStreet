import { useState, useEffect } from 'react';
import { FiClock, FiZap } from 'react-icons/fi';

export const LimitedEditionBadge = ({ product }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!product.is_limited_edition || !product.drop_ends_at) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(product.drop_ends_at).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('ENDED');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [product]);

  if (!product.is_limited_edition) return null;

  return (
    <div className="space-y-2">
      {/* Limited Edition Badge */}
      <div className="inline-flex items-center gap-2 bg-cyber-red/20 text-cyber-red px-3 py-1 border border-cyber-red/50">
        <FiZap size={14} className="animate-pulse" />
        <span className="font-mono text-xs uppercase tracking-wider font-bold">
          Limited Edition Drop
        </span>
      </div>

      {/* Stock Counter */}
      {product.limited_stock !== null && product.limited_stock !== undefined && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-white/5">
            <div
              className="h-full bg-cyber-cyan"
              style={{
                width: `${Math.max(10, (product.stock / product.limited_stock) * 100)}%`
              }}
            />
          </div>
          <span className="font-mono text-xs text-zinc-400">
            {product.stock} / {product.limited_stock} left
          </span>
        </div>
      )}

      {/* Countdown Timer */}
      {product.drop_ends_at && timeLeft && timeLeft !== 'ENDED' && (
        <div className="flex items-center gap-2 bg-void-surface border border-cyber-cyan/30 px-3 py-2">
          <FiClock size={16} className="text-cyber-cyan" />
          <div>
            <p className="font-mono text-xs text-zinc-400">Drop ends in</p>
            <p className="font-mono text-sm font-bold text-cyber-cyan" data-testid="countdown-timer">
              {timeLeft}
            </p>
          </div>
        </div>
      )}

      {timeLeft === 'ENDED' && (
        <div className="bg-zinc-800 text-zinc-500 px-3 py-2 font-mono text-xs uppercase tracking-wider text-center">
          Drop Ended
        </div>
      )}
    </div>
  );
};

export const LimitedEditionLabel = ({ isLimitedEdition }) => {
  if (!isLimitedEdition) return null;

  return (
    <div className="absolute top-4 left-4 z-10 bg-cyber-red/90 text-white px-3 py-1 font-mono text-xs uppercase tracking-wider font-bold backdrop-blur-sm">
      <FiZap className="inline mr-1" size={12} />
      Limited Drop
    </div>
  );
};
