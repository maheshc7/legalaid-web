import Head from 'next/head';
import FileUpload from '../components/FileUpload';
import Layout, { siteTitle } from '../components/Layout.js';

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <FileUpload/>
      </Layout>
  );
}