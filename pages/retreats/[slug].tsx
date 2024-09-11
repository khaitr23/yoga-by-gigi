import { useRouter } from "next/router";
import { client, previewClient } from "../../lib/contentful/client";

export default function Retreat({ retreat, preview }) {
  const router = useRouter();
  const { slug } = router.query;
  return (
    <main className="section">
      <p>Slug: {slug}</p>
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
