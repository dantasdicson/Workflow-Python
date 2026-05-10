import '../styles/globals.css'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Workflow - Cadastro e Gerenciamento de Servicos</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <meta name="description" content="Conecte-se a freelancers e contrate seu serviço com rapidez e segurança" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
