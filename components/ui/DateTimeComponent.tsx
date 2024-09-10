import { formatDate } from "../../lib/contentful/formatDate";
export default function DateTimeComponent({ dateString, options, ...rest }) {
  return (
    <time dateTime={dateString} {...rest}>
      <p>{formatDate(dateString, options)}</p>
    </time>
  );
}
