import Head from 'next/head';
import Image from 'next/image';

export const siteTitle = 'LegalAid - Make Scheduling Easy';

export default function Layout({ children, home }) {
  return (
    <>
    <Head>
        <link rel="icon" href="/legal.png" />
          <meta
            name="LegalAid"
            content="Process scheduling order in seconds"
          />
          <meta name="og:title" content={siteTitle} />
          <meta name="twitter:card" content="summary_large_image" />
        </Head>
        <header>
          <center>
          <Image
              priority
              src="/logo.png"
              height={64}
              width={256}
              alt="LegalAid"
            />
          </center>
        </header>
        <main>{children}</main>
        </>
  );
}