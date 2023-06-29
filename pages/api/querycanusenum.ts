import type { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('req.body.ic='+req.body.ic);
    const ic = req.body.ic;
    const connection = await mysql.createConnection({
        host: 'rm-bp143js11s2kwa179ro.mysql.rds.aliyuncs.com',
        user: 'nexts_dev',
        password: '@Walter41702956',
        database: 'nextsdb',
        port: 3306
    });
    const [rows] : any[]= await connection.execute("SELECT canUseNum FROM invitation where invitationCode='"+ic+"'");
    console.log('rows=',rows);
    console.log('rows[0].canUseNum=',rows[0].canUseNum);
    await connection.end();
    // console.log(!rows);
    // console.log(!rows[0]);
    // console.log(!rows[0].canUseNum);
    if(rows!=undefined&&rows[0]!=undefined&&rows[0].canUseNum!=undefined){
        console.log('its=true');
        res.status(200).json({code:200, canUseNum: rows[0].canUseNum });
    }else{
        console.log('its=false');
        res.status(200).json({code:200, canUseNum: null });
    }
}