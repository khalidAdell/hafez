import Navbar from "../../components/Navbar";
import Banner from "../../components/Home/Banner";
import About from "../../components/Home/About";
import Services from "../../components/Home/Services";
import Blogs from "../../components/Home/Blogs";
import Contact from "../../components/Home/Contact";
import Faq from "../../components/Home/Faq";
import { Fade, Slide, Zoom, JackInTheBox } from "react-awesome-reveal";
import path from "path";
import fs from "fs/promises";

export default async function Home({ params }) {
  const { locale } = await  params;

  const messagesPath = path.join(process.cwd(), "messages", `${locale}.json`);
  let messages;
  try {
    const messagesContent = await fs.readFile(messagesPath, "utf8");
    messages = JSON.parse(messagesContent);
  } catch (error) {
    console.error("Error loading translations:", error);
    messages = {};
  }

  const t = (key) => messages[key] || key;

  const res = await fetch("https://hafez.share.net.sa/api/home", {
    headers: {
      Accept: "application/json",
      "Accept-Language": locale,
    },
    cache: "no-store",
  });
  const result = await res.json();
  const data = result.data;

  const configRes = await fetch("https://hafez.share.net.sa/api/website-configuration", {
    cache: "no-store",
  });
  const configResult = await configRes.json();
  const config = configResult.success ? configResult.data : null;

  if (!data) {
    return <div className="text-center py-20">{t("error")}</div>;
  }

  return (
    <div>
      <Navbar />
      <Banner sliders={data.sliders} />
      <Fade triggerOnce duration={1000} fraction={0.3} className="w-full">
        <About about={data.about} />
      </Fade>
      <Slide direction="right" triggerOnce duration={800} delay={200}>
        <Services services={data.services} />
      </Slide>
      <Zoom triggerOnce duration={800} delay={200}>
        <Faq />
      </Zoom>
      <JackInTheBox triggerOnce duration={1000}>
        <Blogs blogs={data.blogs} />
      </JackInTheBox>
      <Slide direction="up" triggerOnce duration={800} delay={150}>
        <Contact contactConfig={config} />
      </Slide>
    </div>
  );
}
