import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>FiberDiameter</title>
        <meta
          name='description'
          content='Measure the diameter of really tiny fibers assisted by deep learning models'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <Image src='images/logo.png/' alt='FiberDiameter logo' width='10%' />
        <h1 className={styles.title}>
          Welcome to <p className='text-blue-500'>FiberDiameter!</p>
        </h1>
        <h2>A deep learning-assisted app to measure your fibers</h2>
        <Link href='/app'>
          <button className='p-2 m-4 bg-blue-900 rounded-md hover:bg-slate-900'>
            Start measuring 🪄
          </button>
        </Link>
      </main>

      <footer className={styles.footer}>
        <a
          href='https://github.com/fcossio/FiberDiameter'
          target='_blank'
          rel='noopener noreferrer'
        >
          Made with 💙 by｛ FernandoCossio, YaelSuarez, LuisCossio, AleDeLuna ｝
        </a>
      </footer>
    </div>
  );
};

export default Home;
