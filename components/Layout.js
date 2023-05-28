import { Button, Stack } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import logo from "../public/logo.png";
import { login } from '../utils/authService';

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
          <Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"} marginX={2}>
            <Image
                src={logo}
                height={64}
                width={256}
                alt="LegalAid"
              />
            <Button variant='contained' onClick={login}>Login</Button>
          </Stack>
        </header>
        <main>{children}</main>
        </>
  );
}