import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Script from 'next/script'
import styles from '../styles/Home.module.css'
// import ModelDemo from '../components/modelDemo'
import { useState, useEffect } from 'react'
// import {}
import dynamic from "next/dynamic";

const ModelDemo = dynamic(() => import('../components/modelDemo'), { ssr: false });

declare global { // <- [reference](https://stackoverflow.com/a/56458070/11542903)
    interface Window {
        pyodide: any;
        languagePluginLoader: any;
    }
}

const Home: NextPage = () => {

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        {/* <script type="text/javascript">
          // set the pyodide files URL (packages.json, pyodide.asm.data etc)
          window.languagePluginUrl = 'https://cdn.jsdelivr.net/pyodide/v0.21.3/full/';
        </script> */}
        <Script type="application/javascript" strategy="beforeInteractive" src="https://cdn.jsdelivr.net/pyodide/"></Script>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <ModelDemo/>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}

export default Home
