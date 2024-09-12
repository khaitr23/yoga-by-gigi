export default function MapEmbed({ retreat }) {
  const { location } = retreat.fields;
  const { lon, lat } = location;
  return (
    <iframe
      width="100%"
      height="100%"
      style={{ border: 0 }}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        &q=${lat},${lon}&center=${lat},${lon}`}
    ></iframe>
  );
}
