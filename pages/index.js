import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout, { siteTitle } from '../components/layout';
import FileUpload from '../components/FileUpload';
import { uploadFile } from '../utils/apiHelpers';
import { useAppContext } from "../context/AppContext";
import { ThemeProvider } from '@mui/material/styles';
import theme from "../styles/Theme";

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
      <ThemeProvider theme={theme}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <FileUpload onUpload={handleUploadFile}/>
      </ThemeProvider>
    </Layout>
  );
}