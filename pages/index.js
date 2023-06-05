import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout, { siteTitle } from '../components/Layout.js';
import FileUpload from '../components/FileUpload';
import { uploadFile } from '../utils/apiHelpers';
import { useAppContext } from "../context/AppContext";
import ErrorMessage from '../components/ErrorMessage.js';

export default function Home() {
  const router = useRouter();
  const app = useAppContext();

  const handleSelectFile = (file) => {
    console.log("Calling handleSelectFile");
    app.storeFile(file);
  }

  const handleUploadFile = () => {
    uploadFile(app.selectedFile).then((taskId) => {
      console.log(taskId);
      router.push({pathname:"/details", query: {taskId: taskId}});
    });
  }

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      
      <FileUpload selectedFile={app.selectedFile} onSelect={handleSelectFile} onUpload={handleUploadFile}/>

      <ErrorMessage/>
    </Layout>
  );
}