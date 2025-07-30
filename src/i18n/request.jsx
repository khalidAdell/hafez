import path from "path";
import fs from "fs/promises";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {
  const validLocale = locale && ["ar", "en"].includes(locale) ? locale : "ar";

  const filePath = path.join(process.cwd(), "messages", `${validLocale}.json`);

  const fileContents = await fs.readFile(filePath, "utf8");

  return {
    locale: validLocale,
    messages: JSON.parse(fileContents),
  };
});
