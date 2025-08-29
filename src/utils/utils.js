import { format } from 'date-fns';

export const formatText = text =>
  text
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const formatTimestamp = timestamp => {
  const date = new Date(
    timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000,
  );
  return format(date, 'dd MMM yyyy');
};

export const convertFIrstCharToUpper = s => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};
