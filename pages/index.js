import Head from 'next/head';
import Layout, { siteTitle } from '../components/layout';
import FileUpload from '../components/FileUpload';

export default function Home() {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <FileUpload/>
    </Layout>
  );
}