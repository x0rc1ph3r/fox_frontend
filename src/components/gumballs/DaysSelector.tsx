import { useState, useCallback, useEffect } from "react";
import { useGumballStore } from "../../../store/useGumballStore";

export default function DaysSelector() {
  const [days, setDaysLocal] = useState("2");
  
  const { 
    startType,
    getStartTimestamp,
    setEndDate,
    setEndTimeHour,
    setEndTimeMinute,
    setEndTimePeriod,
    isCreatingGumball,
  } = useGumballStore();

  const presets = [
    { label: "2d", value: "2" },
    { label: "5d", value: "5" },
    { label: "7d", value: "7" },
  ];

  const updateEndTime = useCallback((daysValue: string) => {
    const daysNum = parseInt(daysValue) || 1;
    const hoursToAdd = daysNum * 24;
    
    let startTimestamp: number;
    if (startType === "manual") {
      startTimestamp = Math.floor(Date.now() / 1000);
    } else {
      const scheduledStart = getStartTimestamp();
      startTimestamp = scheduledStart || Math.floor(Date.now() / 1000);
    }
    
    const endTimestamp = startTimestamp + (hoursToAdd * 60 * 60);
    const endDate = new Date(endTimestamp * 1000);
    
    const hours = endDate.getHours();
    const minutes = endDate.getMinutes();
    
    setEndDate(endDate);
    setEndTimeHour(String(hours > 12 ? hours - 12 : hours || 12).padStart(2, "0"));
    setEndTimeMinute(String(minutes).padStart(2, "0"));
    setEndTimePeriod(hours >= 12 ? "PM" : "AM");
  }, [startType, getStartTimestamp, setEndDate, setEndTimeHour, setEndTimeMinute, setEndTimePeriod]);

  const handleDaysChange = (value: string) => {
    setDaysLocal(value);
    if (value && parseInt(value) > 0) {
      updateEndTime(value);
    }
  };
  useEffect(() => {
    if(days && parseInt(days) > 0) {
      updateEndTime(days);
    }
  }, [days]);
  return (
    <div className="pb-10 max-w-[588px] w-full">
      <p className="md:text-base text-sm font-medium font-inter text-gray-1200 pb-2.5">
        How many days would you like the Gumball to be live for?
      </p>

      <input
        id="days"
        type="number"
        value={days}
        onChange={(e) => handleDaysChange(e.target.value)}
        onBlur={() => updateEndTime(days)}
        disabled={isCreatingGumball}
        className="text-black-1000 outline outline-gray-1100 focus:outline-primary-color placeholder:text-black-1000 text-base w-full font-inter px-5 h-12 rounded-lg font-medium [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
        placeholder="1"
        min="1"
      />

      <ol className="flex items-center gap-4 pt-2.5">
        {presets.map((p) => (
          <li key={p.value} className="w-full">
            <button
              type="button"
              onClick={() => handleDaysChange(p.value)}
              disabled={isCreatingGumball}
              className={`rounded-[7px] px-2.5 h-10 flex items-center justify-center text-sm font-semibold font-inter w-full 
                ${
                  days === p.value
                    ? "bg-primary-color text-white"
                    : "bg-gray-1300 text-black-1000"
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {p.label}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
