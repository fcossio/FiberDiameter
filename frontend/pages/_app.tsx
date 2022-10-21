import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

function FiberDiameter({ Component, pageProps }: AppProps) {
  return <>
    <Component {...pageProps} />
    <ToastContainer/>
  </>
}

export default FiberDiameter
