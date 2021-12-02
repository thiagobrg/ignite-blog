import { format } from 'date-fns';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const router = useRouter();
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function handleLoadMorePosts(): Promise<void> {
    if (nextPage) {
      const response = await fetch(postsPagination.next_page);
      const data = await response.json();
      setNextPage(data.next_page);
      setPosts([...posts, ...data.results]);
    }
  }

  return (
    <main className={styles.main}>
      <ul>
        {posts.map(post => (
          <button
            type="button"
            key={post.uid}
            onClick={() => router.push(`/post/${post.uid}`)}
          >
            <li>
              <h3>{post.data.title}</h3>
              <h4>{post.data.subtitle}</h4>
              <div className={styles.postInfo}>
                <div className={styles.createdAt}>
                  <FiCalendar />
                  <time>
                    {format(
                      new Date(`${post.first_publication_date}`),
                      'dd MMM yyyy'
                    ).toLowerCase()}
                  </time>
                </div>
                <div className={styles.author}>
                  <FiUser />
                  <span>{post.data.author}</span>
                </div>
              </div>
            </li>
          </button>
        ))}
      </ul>
      {nextPage && (
        <button type="button" onClick={handleLoadMorePosts}>
          Carregar mais posts
        </button>
      )}
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query('', { pageSize: 1 });

  return {
    props: {
      postsPagination: postsResponse,
    },
  };
};
