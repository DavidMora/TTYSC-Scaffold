/**
 * Converts a UTC date from the backend to the local timezone of the user
 * @param date - Date in ISO string format (e.g: '2024-01-15T16:30:00Z')
 * @param useUTC - If true, keeps UTC. If false (default), converts to local time
 * @returns Formatted date in readable format
 */
export function parseDate(date: string, useUTC: boolean = false): string {
  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  const month = useUTC ? dateObj.getUTCMonth() + 1 : dateObj.getMonth() + 1;
  const day = useUTC ? dateObj.getUTCDate() : dateObj.getDate();
  const year = useUTC ? dateObj.getUTCFullYear() : dateObj.getFullYear();
  const hours = useUTC ? dateObj.getUTCHours() : dateObj.getHours();
  const minutes = useUTC ? dateObj.getUTCMinutes() : dateObj.getMinutes();

  const formattedMinutes = minutes.toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  return `${month}/${day}/${year} at ${displayHours}:${formattedMinutes} ${ampm}`;
}
