import ContentfulImage from "./ContentfulImage";

export default function Avatar({ name, picture }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div
        style={{
          position: "relative",
          width: "40px",
          height: "40px",
          marginRight: "1rem",
        }}
      >
        <ContentfulImage
          src={picture.fields.file.url}
          fill
          style={{ borderRadius: "9999px", margin: "0px" }}
          alt={name}
        />
      </div>
      <div>
        <h3>{name}</h3>
      </div>
    </div>
  );
}
