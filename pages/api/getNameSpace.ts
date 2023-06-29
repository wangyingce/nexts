import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    // console.log('req.body=',req.body);
    // path 拼接路径
    const content = fs.readFileSync(path.join(process.cwd(), 'public/db.json'), 'utf8');
    // const content = fs.readFileSync('../../public/db.json', 'utf8');
    let finallyData:any=JSON.parse(content);
    if(req.body.invitationcode){
        finallyData=finallyData.filter((item:any)=>item.invitationcode===req.body.invitationcode)[0];
    }
    // console.log(finallyData)
    res.status(200).json({code:200, data: finallyData });
}