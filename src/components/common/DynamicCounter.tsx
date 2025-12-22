import { useEffect, useState } from "react";

export const DynamicCounter = ({ endsAt }: { endsAt: Date }) => {
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const end = new Date(endsAt);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { hours, minutes, seconds };
    };

    setCountdown(calculateCountdown());

    const interval = setInterval(() => {
      setCountdown(calculateCountdown());
    }, 1000);

    return () => clearInterval(interval);
  }, [endsAt]);

  return (
    <div className="w-full flex items-center justify-end">
      <div className="inline-flex items-center justify-center px-2.5 py-2 divide-x divide-white/30 rounded-lg bg-black/60 border border-white/30">
        <p className="text-xs font-semibold font-inter uppercase text-white pr-1.5">
          {countdown.hours}H
        </p>
        <p className="text-xs font-semibold font-inter uppercase text-white px-1.5">
          {countdown.minutes}M
        </p>
        <p className="text-xs font-semibold font-inter uppercase text-white pl-1.5">
          {countdown.seconds}S
        </p>
      </div>
    </div>
  );
};