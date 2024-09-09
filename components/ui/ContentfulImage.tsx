import Image from "next/image";

const contentfulLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}&q=${quality || 80}`;
};

export default function ContentfulImage(props) {
  return <Image loader={contentfulLoader} {...props} />;
}
