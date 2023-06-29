import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from 'path';
const cFILE = path.join(process.cwd(), 'db.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.body.createNew && req.body?.createNew !== "createNew") {
    res.status(200).json({ code: -1, data: null, msg: "管理员密码错误" });
    return;
  }
  let content = fs.readFileSync(cFILE, "utf8");
  let arrays = JSON.parse(content);
  let currentPerson: any = arrays.find(
    (item: any) => item.invitationcode === req.body.invitationcode,
  );
  if (req.body?.createNew === "createNew" && currentPerson) {
    res.status(200).json({ code: -1, data: null, msg: "已经存在无需初始化" });
    return;
  }
    //   新增次数-找不到账号
  if (!req.body?.createNew&&!!req.body.addNum&&!currentPerson) {
    res.status(200).json({ code: -1, data: null, msg: "找不到账号" });
    return;
  }
  if (currentPerson) {
    currentPerson.canUseNum =
      parseInt(currentPerson.canUseNum) + parseInt(req.body.addNum);
    currentPerson.updateTime = new Date().toLocaleString();
  } else if (req.body?.createNew === "createNew") {
    arrays.push({
      invitationcode: req.body.invitationcode,
      canUseNum: parseInt(req.body.canUseNum),
      updateTime: new Date().toLocaleString(),
    });
  }
  fs.writeFileSync(cFILE, JSON.stringify(arrays));
  res.status(200).json({ code: 200, data: arrays });
}
