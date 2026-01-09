export function formatTimePeriod(seconds:number) {
    const minute = 60;
    const hour = 60 * minute;
    const day = 24 * hour;
    
    if (seconds >= day) {
      const days = Math.floor(seconds / day);
      return `${days}d`;
    } else if (seconds >= hour) {
      const hours = Math.floor(seconds / hour);
      return `${hours}h`;
    } else if (seconds >= minute) {
      const minutes = Math.floor(seconds / minute);
      return `${minutes}m`;
    } else {
      return `${seconds}s`;
    }
  }