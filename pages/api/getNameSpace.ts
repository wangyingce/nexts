import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
const cFILE = path.join(process.cwd(), 'db.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    // console.log('req.body=',req.body);
    const content = fs.readFileSync(cFILE, 'utf8');
    let finallyData:any=JSON.parse(content);
    if(req.body.invitationcode){
        finallyData=finallyData.filter((item:any)=>item.invitationcode===req.body.invitationcode)[0];
    }
    // console.log(finallyData)
    res.status(200).json({code:200, data: finallyData });
}