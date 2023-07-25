const path = require('path');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const lockfile = require('proper-lockfile');
const app = express();

// 允许跨域请求
app.use(cors());

// 监听接口
// const filePath = path.join(__dirname, './db/phone.json'); // 文件路径
const filePath = path.join(__dirname, './db/phone.json'); // 文件路径
console.log(path.join(__dirname, './db/phone.json'));
app.get('/api/getPhoneJsonFile', async (req, res) => {
  // 读取文件内容，并发送响应
  let release;
  try {
    res.setHeader('Content-Type', 'application/json');
    // release = await lockfile.lock(filePath);
    const data = await fs.promises.readFile(filePath, {
      encoding: 'utf8'
    });
    console.log(data);
    console.log(JSON.parse(data));

    res.send({ code: 200, data: JSON.parse(data) });
    // await lockfile.unlock(release);
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.send({ code: -1, data: error });
    // await lockfile.unlock(release);
  }
});
app.get('/api/getPhoneInfo', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    const data = await fs.promises.readFile(filePath, {
      encoding: 'utf8'
    });
    let fileJson=JSON.parse(data);
    let phoneInfo=fileJson.phones.find(item=>{
      return item.phone===req.query.phone
    })||{};
    res.send({ code: 200, data: phoneInfo });
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.send({ code: -1, data: error });
  }
});

app.post('/api/updateFile', async (req, res) => {
  // 更新文件，并发送响应
  let chunks = '';
  req.on('data', (chunk) => {
    chunks += chunk;
  });
  req.on('end', async () => {
    let release;
    try {
      const newData = JSON.parse(chunks);
      // 判断手机号验证码是否匹配
      if (true/* 验证码匹配 */) {
        // release = await lockfile.lock(filePath);
        const data = await fs.promises.readFile(filePath, {
          encoding: 'utf8'
        });
        let oldFile = JSON.parse(data);
        let phoneIndex = oldFile.phones.findIndex(item => {
          return item.phone === newData.phone
        })
        if (phoneIndex >= 0) {
          oldFile.phones[phoneIndex] = {
            ...oldFile.phones[phoneIndex],
            ...newData
          }

        } else {
          oldFile.phones.push({ ...newData, canUseTime: 10, usedTime: 0 });
        }
        console.log(oldFile);
        await fs.promises.writeFile(filePath, JSON.stringify(oldFile));
        res.statusCode = 200;
        res.send({
          code: 200,
          msg: '修改成功'
        });
        // await lockfile.unlock(release);
      }else{
        res.send({
          code: -1,
          msg: '验证码错误'
        });
      }

    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.send({ code: -1, data: error });
      // await lockfile.unlock(release);
    }
  });
});

app.listen(3100, () => {
  console.log('Server is running at http://localhost:3100');
});
