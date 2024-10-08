import { useRouter } from "next/router";
import Head from "next/head";
import Layout, { siteTitle } from "../components/Layout.js";
import FileUpload from "../components/FileUpload";
import { uploadFile } from "../utils/apiHelpers";
import { useAppContext } from "../context/AppContext";
import ErrorMessage from "../components/ErrorMessage.js";

export default function Home() {
  const router = useRouter();
  const app = useAppContext();

  const handleSelectFile = (file) => {
    app.storeFile(file);
  };

  const handleUploadFile = () => {
    uploadFile(app.selectedFile).then((filename) => {
      router.push({ pathname: "/details", query: { filename: filename } });
    });
  };

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>

      <FileUpload
        selectedFile={app.selectedFile}
        onSelect={handleSelectFile}
        onUpload={handleUploadFile}
      />

      <ErrorMessage home />
    </Layout>
  );
}
