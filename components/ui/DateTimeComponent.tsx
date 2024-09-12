import { formatDate } from "../../lib/contentful/formatDate";
export default function DateTimeComponent({ dateString, options, ...rest }) {
  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  const mergedOptions = { ...defaultOptions, ...options };
  return (
    <time dateTime={dateString} {...rest}>
      <p>{formatDate(dateString, mergedOptions)}</p>
    </time>
  );
}
