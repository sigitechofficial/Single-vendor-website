import dayjs from "dayjs";

export default function formatDateFromDB(dbDate) {
  const parsedDate = dayjs(dbDate);
  if (!parsedDate.isValid()) {
    return "";
  }
  const formattedDate = parsedDate.format("dddd, MMMM D, YYYY h:mm:ss A");
  return formattedDate;
}
export function formattedDayMonth(dbDate) {
  const parsedDate = dayjs(dbDate);
  if (!parsedDate.isValid()) {
    return "";
  }
  const formattedDate = parsedDate.format("DD MMM");
  return formattedDate;
}

export function formattedDay(dbDate) {
  const parsedDate = dayjs(dbDate);
  if (!parsedDate.isValid()) {
    return "";
  }
  const formattedDate = parsedDate.format("dddd");
  return formattedDate;
}
