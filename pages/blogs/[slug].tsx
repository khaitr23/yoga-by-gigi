import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { client, previewClient } from "../../lib/contentful/client";
import PostHeader from "../../components/posts/PostHeader";
import Skeleton from "../../components/ui/Skeleton";
import PostBody from "../../components/posts/PostBody";
import PreviewAlert from "../../components/ui/PreviewAlert";
import proseStyle from "../../styles/prose.module.css";
import postStyle from "../../styles/Post.module.css";
import Link from "next/link";

export default function Post({ post, preview }) {
  const router = useRouter();

  return (
    <main>
      {preview && <PreviewAlert />}

      {/* Back navigation */}
      <nav className={postStyle.backNav}>
        <Link href="/blogs" className={postStyle.backLink}>
          <span className={postStyle.backArrow} aria-hidden="true">←</span>
          Back to Blogs
        </Link>
      </nav>

      {/* Post content */}
      <div className={postStyle.postContainer}>
        {router.isFallback ? (
          <Skeleton />
        ) : (
          <>
            <PostHeader post={post} />
            <article className={proseStyle.prose}>
              <PostBody post={post} />
            </article>
          </>
        )}
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
    params: { slug: item.fields.slug as string },
  }));

  return {
    paths,
    fallback: true,
  };
};
