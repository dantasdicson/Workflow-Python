import '../styles/globals.css'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>WorkFlow - Plataforma de Freelancers</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <meta name="description" content="Conecte-se a freelancers e contrate seu serviço com rapidez e segurança" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}