import Image from "next/image";

// fm=jpg forces Contentful to re-encode the source (fixes CMYK / exotic color profiles
// that some browsers can't decode). fl=progressive helps perceived load speed.
const contentfulLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}&q=${quality || 80}&fm=jpg&fl=progressive`;
};

// Leaves the source format alone so transparency survives (logos, PNGs with alpha).
const transparentLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}&q=${quality || 80}`;
};

export default function ContentfulImage({ preserveTransparency = false, ...props }: any) {
  return (
    <Image
      loader={preserveTransparency ? transparentLoader : contentfulLoader}
      {...props}
    />
  );
}
