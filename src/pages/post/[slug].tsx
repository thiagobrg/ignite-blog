import { format } from 'date-fns';
import {
  GetStaticPaths,
  GetStaticProps,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import path from 'path';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  if (!post) {
    return <h1>Carregando...</h1>;
  }

  const html = post.data.content.reduce((acc, item) => {
    let temp = acc;
    temp += `<h3>${item.heading}</h3>`;
    temp += RichText.asHtml(item.body);
    return temp;
  }, '');

  const totalWords = post.data.content.reduce((acc, item) => {
    const title = item.heading;
    const body = RichText.asText(item.body);
    const words = title.split(' ').length + body.split(' ').length;
    return acc + words;
  }, 0);

  const readingTime = Math.ceil(totalWords / 200);

  return (
    <main className={styles.container}>
      <img src={post.data.banner.url} alt={post.data.title} />
      <article>
        <h1>{post.data.title}</h1>
        <div className={styles.postInfo}>
          <div>
            <FiCalendar />
            <time>
              {format(
                new Date(`${post.first_publication_date}`),
                'dd MMM yyyy'
              ).toLowerCase()}
            </time>
          </div>
          <div>
            <FiUser />
            <span>{post.data.author}</span>
          </div>
          <div>
            <FiClock />
            <span>{`${readingTime} min`}</span>
          </div>
        </div>
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{
            __html: html,
          }}
        />
      </article>
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query('', { pageSize: 1 });

  const paths = postsResponse.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    fallback: true,
    paths,
  };
};

type Params = {
  params: {
    slug: string;
  };
};

export async function getStaticProps({ params }) {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  return {
    props: {
      post: response,
    },
  };
}
