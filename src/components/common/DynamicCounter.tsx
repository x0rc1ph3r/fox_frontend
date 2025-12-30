import { useEffect, useState } from "react";

export const DynamicCounter = ({ endsAt ,status,className}: { endsAt: Date ,status:"ACTIVE"|"ENDED",className?:string}) => {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [elapsedTime, setElapsedTime] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const end = new Date(endsAt);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds };
    };

    const calculateElapsedTime = () => {
      const now = Date.now();
      const end = new Date(endsAt).getTime();
      const diff = now - end;

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0 };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      return { days, hours, minutes };
    };

    setCountdown(calculateCountdown());
    setElapsedTime(calculateElapsedTime());

    const interval = setInterval(() => {
      setCountdown(calculateCountdown());
      setElapsedTime(calculateElapsedTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [endsAt]);

  const formatElapsedTime = () => {
    const parts = [];
    if (elapsedTime.days > 0) parts.push(`${elapsedTime.days}d`);
    if (elapsedTime.hours > 0 || elapsedTime.days > 0) parts.push(`${elapsedTime.hours}h`);
    parts.push(`${elapsedTime.minutes}m`);
    return parts.join(" ");
  };
  console.log("status",status);
  const isActive = (status === "ACTIVE" && new Date(endsAt).getTime() > Date.now());
  
  return (
    <div className={`w-full flex items-center justify-end ${className}`}>
      <div className="inline-flex items-center justify-center px-2.5 py-2 divide-x divide-white/30 rounded-lg bg-black/60 border border-white/30">
        {isActive ? (
          <>
            {countdown.days > 0 && (
              <p className="text-xs font-semibold font-inter uppercase text-white pr-1.5">
                {countdown.days}D
              </p>
            )}
            <p className={`text-xs font-semibold font-inter uppercase text-white ${countdown.days > 0 ? 'px-1.5' : 'pr-1.5'}`}>
              {countdown.hours}H
            </p>
            <p className="text-xs font-semibold font-inter uppercase text-white px-1.5">
              {countdown.minutes}M
            </p>
            <p className="text-xs font-semibold font-inter uppercase text-white pl-1.5">
              {countdown.seconds}S
            </p>
          </>
        ) : (
          <p className="text-xs font-semibold font-inter uppercase text-white">
            Ended {formatElapsedTime()} ago
          </p>
        )}
      </div>
    </div>
  );
};