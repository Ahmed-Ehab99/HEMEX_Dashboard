import Image from "next/image";
import { useEffect, useState } from "react";
import Loader from "../Loader";
import axios from "axios";

interface Certificates {
  id: number;
  attachment: string;
}

const Certificates = () => {
  const [certificates, setCertificates] = useState<Certificates[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async (url: string) => {
    if (!url) {
      console.error("No attachment URL found!");
      return;
    }

    try {
      const response = await axios.get(url, {
        responseType: "blob",
      });

      const blob = new Blob([response.data]);
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "Certificate.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const getCertificates = async () => {
    setIsLoading(true);

    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/certificates`,
        {
          params: { student: 7, track: 30 },
        }
      );
      setCertificates(data.data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCertificates();
  }, []);

  return (
    <div className="flex justify-between items-center flex-col gap-10">
      {isLoading ? (
        <Loader />
      ) : (
        certificates.map((item) => (
          <div
            key={item.id}
            className="flex flex-col items-center w-full gap-5 py-5"
          >
            <p className="font-medium text-xl mb-3 text-center lg:px-5">
              You&apos;ve successfully completed Scratch Level 1
            </p>

            <div className="flex items-center justify-center p-4 bg-[#f0f0f0] rounded-3xl">
              <Image
                src={item.attachment || "/Certificate.png"}
                alt="Certificate"
                width={600}
                height={600}
                className="w-full rounded-3xl"
              />
            </div>

            <button
              onClick={() => handleDownload(item.attachment)}
              className="bg-[#2f006c] text-white px-12 py-2 rounded-[0.65rem] font-normal md:text-xl text-base"
            >
              Download
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default Certificates;
