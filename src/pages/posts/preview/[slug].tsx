import {  GetStaticProps } from "next";
import { getSession, useSession } from "next-auth/client";
import Head from "next/Head";
import { RichText } from "prismic-dom";
import { getPrismicClient } from "../../../services/prismic";
import styles from "../post.module.scss";
import Link, { LinkProps } from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/router";

interface PostPreviewtProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  };
}

export default function PostPreview({ post }: PostPreviewtProps) {

  const [session] = useSession();
  const router = useRouter();

  useEffect(()=> {
    if(session?.activeSubscription) {
      router.push(`/post/${post.slug}`)
    }
  }, [session]);

  return (
    <>
      <Head>
        <title>{post.title} | ignews</title>
      </Head>
      <main className="styles.container">
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div
            dangerouslySetInnerHTML={{ __html: post.content }}
            className={`${styles.content} ${styles.previewContent}`}
          />
          <div className={styles.continueRending} >
            Wanna continue reading?
            <Link href="/">
              <a href="">Suscribe now</a>
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({
  params,
}) => {

  const { slug } = params;


  const prismic = getPrismicClient();
  const response = await prismic.getByUID("publication", String(slug), {});
  const post = {
    slug,
    title: RichText.asText(response.data.title) ?? "se",
    content: RichText.asHtml(response.data.content.splice(0,3)),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    ),
  };
  return {
    props: { post },
    redirect: 60 * 30, // 30 minutos
  };
};
