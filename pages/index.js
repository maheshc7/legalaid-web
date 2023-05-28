import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout, { siteTitle } from '../components/Layout.js';
import FileUpload from '../components/FileUpload';
import { uploadFile } from '../utils/apiHelpers';
import { useAppContext } from "../context/AppContext";

export default function Home() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useAppContext();

  const handleUploadFile = () => {
    uploadFile(selectedFile).then((taskId) => {
      console.log(taskId);
      router.push({pathname:"/details", query: {taskId: taskId}});
    });
    }

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <FileUpload onUpload={handleUploadFile}/>
    </Layout>
  );
}