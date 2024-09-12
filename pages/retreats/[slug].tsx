import { useRouter } from "next/router";
import { client, previewClient } from "../../lib/contentful/client";
import PreviewAlert from "../../components/ui/PreviewAlert";
import Skeleton from "../../components/ui/Skeleton";
import PostBody from "../../components/posts/PostBody";
import RetreatHeader from "../../components/retreats/RetreatHeader";
import MapEmbed from "../../components/ui/MapEmbed";

export default function Retreat({ retreat, preview }) {
  const router = useRouter();
  return (
    <main className="section">
      {preview && <PreviewAlert />}
      <div className="container">
        <article>
          {router.isFallback ? (
            <Skeleton />
          ) : (
            <>
              <RetreatHeader retreat={retreat} />
              <PostBody post={retreat} />
              <MapEmbed retreat={retreat} />
            </>
          )}
        </article>
      </div>
    </main>
  );
}

export async function getStaticProps({ params, preview = false }) {
  const cfClient = preview ? previewClient : client;
  const { slug } = params;
  const response = await cfClient.getEntries({
    content_type: "retreat",
    "fields.slug": slug,
  });

  if (!response?.items?.length) {
    return {
      redirect: {
        destination: "/retreats",
        permanent: false,
      },
    };
  }

  return {
    props: {
      retreat: response?.items?.[0],
      preview,
      revalidate: 60,
    },
  };
}

export async function getStaticPaths() {
  const response = await client.getEntries({ content_type: "retreat" });
  const paths = response.items.map((item) => ({
    params: { slug: item.fields.slug },
  }));

  return {
    paths,
    fallback: true,
  };
}
