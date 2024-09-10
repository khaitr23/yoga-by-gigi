import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { client, previewClient } from "../../lib/contentful/client";
import PostHeader from "../../components/posts/PostHeader";
import Skeleton from "../../components/ui/Skeleton";
import PostBody from "../../components/posts/PostBody";
import PreviewAlert from "../../components/ui/PreviewAlert";

export default function Post({ post, preview }) {
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
              <PostHeader post={post} />
              <PostBody post={post} />
            </>
          )}
        </article>
      </div>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
}) => {
  const cfClient = preview ? previewClient : client;
  const { slug } = params;
  const response = await cfClient.getEntries({
    content_type: "post",
    "fields.slug": slug,
  });

  if (!response?.items?.length) {
    return {
      redirect: {
        destination: "/posts",
        permanent: false,
      },
    };
  }

  return {
    props: {
      post: response?.items?.[0],
      preview,
      revalidate: 60,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const response = await client.getEntries({ content_type: "post" });
  const paths = response.items.map((item) => ({
    params: { slug: item.fields.slug },
  }));

  return {
    paths,
    fallback: true,
  };
};
