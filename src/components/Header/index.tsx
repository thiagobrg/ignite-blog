import { useRouter } from 'next/router';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  const router = useRouter();
  return (
    <header className={styles.header}>
      <img src="/logo.svg" alt="logo" onClick={() => router.push('/')} />
    </header>
  );
}
