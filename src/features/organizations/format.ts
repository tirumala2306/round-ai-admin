const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatCreatedDate(isoDate: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) {
    return isoDate;
  }

  const month = months[Number(match[2]) - 1];
  if (!month) {
    return isoDate;
  }

  return `${month} ${Number(match[3])}, ${match[1]}`;
}

export function formatLocation(city: string, state: string) {
  const location = [city, state].filter((part) => part.trim().length > 0);
  return location.length > 0 ? location.join(", ") : "Not provided";
}

export function formatAddress(parts: {
  address: string;
  city: string;
  state: string;
  country: string;
}) {
  const locality = [parts.city, parts.state].filter(Boolean).join(", ");
  const lines = [parts.address, locality, parts.country].filter(
    (part) => part.trim().length > 0,
  );
  return lines.length > 0 ? lines : ["Not provided"];
}

export function todayIsoDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}
