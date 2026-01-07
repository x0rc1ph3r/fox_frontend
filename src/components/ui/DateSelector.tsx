import React, { useRef, useMemo } from "react";

interface DateSelectorProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label?: string;
  value?: Date | null;
  limit?:string|null;
  onChange?: (date: Date | null) => void;
  minDate?: Date;
}

// Helper to format Date to YYYY-MM-DD string for input[type="date"]
const formatDateToString = (date: Date | null | undefined): string => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function DateSelector({ 
  label, 
  value, 
  minDate,
  limit,
  onChange,
  ...restProps 
}: DateSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    inputRef.current?.showPicker?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      const dateValue = e.target.value;
      if (dateValue) {
        // Parse YYYY-MM-DD format
        const [year, month, day] = dateValue.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        onChange(date);
      } else {
        onChange(null);
      }
    }
  };

  // Format the value for the input
  const inputValue = useMemo(() => formatDateToString(value), [value]);
  
  // Format the min date
  const minValue = useMemo(() => formatDateToString(minDate), [minDate]);
  
  return (
    <div className="w-full flex flex-col justify-end relative">
      {label && (
        <div className="flex gap-3">
        <label
          htmlFor={restProps.id}
          className="text-sm mb-2.5 block text-gray-1200 font-medium font-inter"
        >
          {label}
        </label>
        {limit && 
        <p className="text-sm text-gray-1200">Time Period Limit ({limit})</p>
        }
        </div>
      )}
      <div className="w-full relative">
        <input
          type="date"
          ref={inputRef}
          value={inputValue}
          onChange={handleChange}
          min={minValue}
          {...restProps}
          className={`w-full text-sm md:text-base font-medium ${inputValue ? 'text-black-1000' : 'text-gray-1200'} placeholder:text-gray-1200 outline outline-gray-1100 focus:outline-primary-color h-12 md:px-5 px-3 md:pr-5 py-3 rounded-lg border-transparent appearance-none`}
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
              d="M2 12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C22 6.34315 22 8.22876 22 12V14C22 17.7712 22 19.6569 20.8284 20.8284C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14V12Z"
              stroke="#212121"
              strokeWidth="1.5"
            />
            <path
              opacity="0.5"
              d="M7 4V2.5"
              stroke="#212121"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              opacity="0.5"
              d="M17 4V2.5"
              stroke="#212121"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              opacity="0.5"
              d="M2.5 9H21.5"
              stroke="#212121"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M18 17C18 17.5523 17.5523 18 17 18C16.4477 18 16 17.5523 16 17C16 16.4477 16.4477 16 17 16C17.5523 16 18 16.4477 18 17Z"
              fill="#212121"
            />
            <path
              d="M18 13C18 13.5523 17.5523 14 17 14C16.4477 14 16 13.5523 16 13C16 12.4477 16.4477 12 17 12C17.5523 12 18 12.4477 18 13Z"
              fill="#212121"
            />
            <path
              d="M13 17C13 17.5523 12.5523 18 12 18C11.4477 18 11 17.5523 11 17C11 16.4477 11.4477 16 12 16C12.5523 16 13 16.4477 13 17Z"
              fill="#212121"
            />
            <path
              d="M13 13C13 13.5523 12.5523 14 12 14C11.4477 14 11 13.5523 11 13C11 12.4477 11.4477 12 12 12C12.5523 12 13 12.4477 13 13Z"
              fill="#212121"
            />
            <path
              d="M8 17C8 17.5523 7.55228 18 7 18C6.44772 18 6 17.5523 6 17C6 16.4477 6.44772 16 7 16C7.55228 16 8 16.4477 8 17Z"
              fill="#212121"
            />
            <path
              d="M8 13C8 13.5523 7.55228 14 7 14C6.44772 14 6 13.5523 6 13C6 12.4477 6.44772 12 7 12C7.55228 12 8 12.4477 8 13Z"
              fill="#212121"
            />
          </svg>
        </span>
      </div>
    </div>
  );
}
