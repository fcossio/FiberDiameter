import '../styles/globals.css'
import type { AppProps } from 'next/app'


function FiberDiameter({ Component, pageProps }: AppProps) {
  return <>
  <Component {...pageProps} />;
  </>
}

export default FiberDiameter
