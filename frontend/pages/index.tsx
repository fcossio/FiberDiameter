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
        <link rel='icon' href='/images/logo.ico' />
      </Head>

      <main className='flex flex-col items-center justify-center min-h-screen gap-4 p-16'>
        <Image
          src='/images/logo.png'
          alt='FiberDiameter logo'
          layout='intrinsic'
          width='250'
          height='250'
        />
        <h1 className='text-6xl text-center'>
          Welcome to{" "}
          <p className='font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500 text-7xl'>
            FiberDiameter!
          </p>
        </h1>
        <h2>
          A deep learning-assisted app to{" "}
          <span className='underline decoration-2 decoration-white-500'>
            measure
          </span>{" "}
          your{" "}
          <span className='underline decoration-2 decoration-white-500'>
            fibers
          </span>
        </h2>
        <Link href='/app'>
          <button className='p-2 m-4 rounded-md bg-gradient-to-r from-cyan-800 to-blue-800 hover:from-cyan-900 hover:to-slate-800'>
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
          Made with 💙 by
          <span className='font-mono'>
            ｛ <Contributor name='FernandoCossio' />,
            <Contributor name=' YaelSuarez' />,
            <Contributor name=' LuisCossio' />,
            <Contributor name=' AleDeLuna' /> ｝
          </span>
        </a>
      </footer>
    </div>
  );
};

const Contributor = (props: {name: string}) => {
  return <span className='font-mono font-bold'>{props.name}</span>
}

export default Home;
