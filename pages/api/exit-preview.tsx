import { NextApiResponse } from "next";

export default function handler(_, res: NextApiResponse) {
  res.clearPreviewData();
  res.writeHead(307, { Location: "/" });
  res.end();
}
