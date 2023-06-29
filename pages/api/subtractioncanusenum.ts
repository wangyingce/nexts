import type { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const ic = req.body.ic;
    try {
        const connection = await mysql.createConnection({
            host: 'rm-bp143js11s2kwa179ro.mysql.rds.aliyuncs.com',
            user: 'nexts_dev',
            password: '@Walter41702956',
            database: 'nextsdb',
            port: 3306
        });
        await connection.execute("UPDATE invitation SET canUseNum = CAST(canUseNum AS UNSIGNED) - 1 WHERE invitationCode = '"+ic+"'");
        await connection.end();
        console.log("sus = UPDATE invitation SET canUseNum = CAST(canUseNum AS UNSIGNED) - 1 WHERE invitationCode = '"+ic+"'")
        res.status(200).json({code:200, exmsg: 'sus' });
    } catch (error) {
        res.status(500).json({code:500, exmsg: error });
    }
}