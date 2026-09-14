import Image from "next/image";

// fm=jpg forces Contentful to re-encode the source (fixes CMYK / exotic color profiles
// that some browsers can't decode). fl=progressive helps perceived load speed.
const contentfulLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}&q=${quality || 80}&fm=jpg&fl=progressive`;
};

export default function ContentfulImage(props) {
  return <Image loader={contentfulLoader} {...props} />;
}
