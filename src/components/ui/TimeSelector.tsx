import React, { useRef, useMemo } from "react";

interface TimeSelectorProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label?: string;
  hour?: string;
  minute?: string;
  period?: "AM" | "PM";
  onTimeChange?: (hour: string, minute: string, period: "AM" | "PM") => void;
}

export default function TimeSelector({ 
  label, 
  hour = "12",
  minute = "00",
  period = "PM",
  onTimeChange,
  ...props 
}: TimeSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    inputRef.current?.showPicker?.();
  };

  // Convert 12-hour format to 24-hour format for input[type="time"]
  const inputValue = useMemo(() => {
    let hour24 = parseInt(hour) || 12;
    
    if (period === "PM" && hour24 !== 12) {
      hour24 += 12;
    } else if (period === "AM" && hour24 === 12) {
      hour24 = 0;
    }
    
    return `${String(hour24).padStart(2, "0")}:${minute.padStart(2, "0")}`;
  }, [hour, minute, period]);

  // Handle change and convert 24-hour back to 12-hour format
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onTimeChange) {
      const [h24, m] = e.target.value.split(":");
      let hour24 = parseInt(h24) || 0;
      const newMinute = m || "00";
      
      let newPeriod: "AM" | "PM" = hour24 >= 12 ? "PM" : "AM";
      let newHour = hour24 % 12 || 12;
      
      onTimeChange(
        String(newHour).padStart(2, "0"),
        newMinute,
        newPeriod
      );
    }
  };

  return (
    <div className="w-full flex flex-col justify-end relative">
      {label && (
        <label
          htmlFor={props.id}
          className="text-sm mb-2.5 block text-gray-1200 font-medium font-inter"
        >
          {label}
        </label>
      )}
      <div className="w-full relative">
        <input
          type="time"
          ref={inputRef}
          value={inputValue}
          onChange={handleChange}
          {...props}
          className="w-full text-base font-medium text-gray-1200 placeholder:text-gray-1200 outline outline-gray-1100 focus:outline-primary-color h-12 md:px-5 px-3 md:pr-5 py-3 rounded-lg border-transparent appearance-none"
        />
        <span
          onClick={handleIconClick}
          className="absolute bg-white right-3 md:right-5 top-[50%] -translate-y-1/2 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
              stroke="#212121"
              strokeWidth="1.5"
            />
            <path
              d="M12 6V12L16 14"
              stroke="#212121"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </div>
  );
}
