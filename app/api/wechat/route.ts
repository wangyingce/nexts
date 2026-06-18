import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";

// 企业微信配置（从环境变量读取）
const config = {
  corpId: process.env.WECHAT_CORP_ID || "",
  agentId: process.env.WECHAT_AGENT_ID || "",
  secret: process.env.WECHAT_SECRET || "",
  token: process.env.WECHAT_TOKEN || "",
  encodingAESKey: process.env.WECHAT_ENCODING_AES_KEY || "",
  // ChatGPT API 配置
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  openaiBaseUrl: process.env.BASE_URL || "https://api.openai.com",
};

// access_token 缓存
let accessTokenCache = {
  token: "",
  expiresAt: 0,
};

// 获取企业微信 access_token
async function getAccessToken() {
  if (accessTokenCache.token && Date.now() < accessTokenCache.expiresAt) {
    return accessTokenCache.token;
  }

  try {
    const url = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${config.corpId}&corpsecret=${config.secret}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.errcode === 0) {
      accessTokenCache.token = data.access_token;
      accessTokenCache.expiresAt = Date.now() + (data.expires_in - 300) * 1000;
      return data.access_token;
    } else {
      console.error("获取access_token失败:", data.errmsg);
      throw new Error(`获取access_token失败: ${data.errmsg}`);
    }
  } catch (error) {
    console.error("获取access_token出错:", error);
    throw error;
  }
}

// 调用 AI API 获取回复（使用 DeepSeek-R1 模型）
async function getChatGPTReply(userMessage: string): Promise<string> {
  try {
    const url = `${config.openaiBaseUrl}/v1/chat/completions`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1",
        messages: [
          {
            role: "system",
            content: "你是途阳科技的智能客服助手，主要帮助客户了解积分兑换相关的问题。请用友好、专业的语气回复客户。",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    } else {
      console.error("ChatGPT API 返回格式错误:", data);
      return "抱歉，我暂时无法回复，请稍后再试。";
    }
  } catch (error) {
    console.error("调用 ChatGPT API 出错:", error);
    return "抱歉，我暂时无法回复，请稍后再试。";
  }
}

// 发送消息给企业微信客户
async function sendTextMessage(
  accessToken: string,
  userId: string,
  content: string
) {
  try {
    const url = `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${accessToken}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        touser: userId,
        msgtype: "text",
        agentid: config.agentId,
        text: {
          content: content,
        },
      }),
    });

    const data = await response.json();

    if (data.errcode !== 0) {
      console.error("发送消息失败:", data.errmsg);
    }

    return data;
  } catch (error) {
    console.error("发送消息出错:", error);
    throw error;
  }
}

// 验证签名（使用 Node.js crypto）
function verifySignature(
  signature: string,
  timestamp: string,
  nonce: string,
  echostr: string
): boolean {
  const arr = [config.token, timestamp, nonce, echostr].sort();
  const str = arr.join("");
  const hash = crypto.createHash("sha1").update(str).digest("hex");
  return hash === signature;
}

// 解密 echostr（使用 Node.js crypto）
function decryptEchostr(echostr: string): string {
  try {
    console.log("开始解密 echostr");

    // 1. AESKey = Base64_Decode(EncodingAESKey + "=")
    const aesKey = Buffer.from(config.encodingAESKey + "=", "base64");
    console.log("AES Key 长度:", aesKey.length, "字节");

    if (aesKey.length !== 32) {
      throw new Error(`AES Key 长度错误: ${aesKey.length}，应该是 32 字节`);
    }

    // 2. IV = AESKey 的前 16 字节
    const iv = aesKey.slice(0, 16);

    // 3. 解码 echostr
    const encryptedData = Buffer.from(echostr, "base64");
    console.log("加密数据长度:", encryptedData.length, "字节");

    // 4. AES-256-CBC 解密
    const decipher = crypto.createDecipheriv("aes-256-cbc", aesKey, iv);
    decipher.setAutoPadding(false); // 手动处理 PKCS7 填充

    let decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final()
    ]);

    console.log("解密后总长度:", decrypted.length, "字节");

    // 5. 去除 PKCS7 填充
    const padLength = decrypted[decrypted.length - 1];
    console.log("填充长度:", padLength);

    if (padLength < 1 || padLength > 32) {
      throw new Error(`PKCS7 填充长度错误: ${padLength}`);
    }

    // 验证填充
    for (let i = 0; i < padLength; i++) {
      if (decrypted[decrypted.length - 1 - i] !== padLength) {
        throw new Error("PKCS7 填充格式错误");
      }
    }

    const unpadded = decrypted.slice(0, decrypted.length - padLength);
    console.log("去填充后长度:", unpadded.length, "字节");

    // 6. 解析结构: random(16B) + msg_len(4B) + msg + receiveid

    if (unpadded.length < 20) {
      throw new Error(`解密后数据太短: ${unpadded.length} 字节`);
    }

    // 跳过前 16 字节随机数
    const afterRandom = unpadded.slice(16);

    // 读取消息长度（网络字节序 = 大端序）
    const msgLength = afterRandom.readUInt32BE(0);
    console.log("消息长度:", msgLength, "字节");

    if (msgLength < 0 || msgLength > afterRandom.length - 4) {
      throw new Error(`消息长度异常: ${msgLength}`);
    }

    // 提取 msg
    const msg = afterRandom.slice(4, 4 + msgLength).toString("utf-8");

    // 提取 receiveid
    const receiveid = afterRandom.slice(4 + msgLength).toString("utf-8");

    console.log("解密成功 - msg:", msg);
    console.log("receiveid:", receiveid);
    console.log("receiveid 应该是:", config.corpId);

    if (receiveid !== config.corpId) {
      console.warn("警告: receiveid 不匹配！");
    }

    return msg;
  } catch (error) {
    console.error("解密 echostr 失败:", error);
    throw error;
  }
}

// 解析 XML 消息
function parseXML(xml: string) {
  try {
    const msgType =
      xml.match(/<MsgType><!\[CDATA\[(.*?)\]\]><\/MsgType>/)?.[1] || "";
    const content =
      xml.match(/<Content><!\[CDATA\[(.*?)\]\]><\/Content>/)?.[1] || "";
    const fromUser =
      xml.match(/<FromUserName><!\[CDATA\[(.*?)\]\]><\/FromUserName>/)?.[1] ||
      "";
    const event =
      xml.match(/<Event><!\[CDATA\[(.*?)\]\]><\/Event>/)?.[1] || "";
    const changeType =
      xml.match(/<ChangeType><!\[CDATA\[(.*?)\]\]><\/ChangeType>/)?.[1] || "";

    return {
      MsgType: msgType,
      Content: content,
      FromUserName: fromUser,
      Event: event,
      ChangeType: changeType,
    };
  } catch (error) {
    console.error("解析XML出错:", error);
    return {
      MsgType: "",
      Content: "",
      FromUserName: "",
      Event: "",
      ChangeType: "",
    };
  }
}

// GET 请求：URL 验证
export function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const msg_signature = searchParams.get("msg_signature") || "";
    const timestamp = searchParams.get("timestamp") || "";
    const nonce = searchParams.get("nonce") || "";
    const echostr = searchParams.get("echostr") || "";

    console.log("收到URL验证请求:", {
      msg_signature,
      timestamp,
      nonce,
      echostr,
    });

    // 验证签名
    if (verifySignature(msg_signature, timestamp, nonce, echostr)) {
      console.log("URL验证成功，开始解密 echostr");
      // 解密 echostr
      const decryptedEchostr = decryptEchostr(echostr);
      console.log("解密后的 echostr:", decryptedEchostr);
      return new NextResponse(decryptedEchostr, { status: 200 });
    } else {
      console.log("URL验证失败：签名不匹配");
      return new NextResponse("验证失败", { status: 403 });
    }
  } catch (error) {
    console.error("GET 请求处理出错:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST 请求：接收消息
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const msg_signature = searchParams.get("msg_signature") || "";
    const timestamp = searchParams.get("timestamp") || "";
    const nonce = searchParams.get("nonce") || "";

    // 获取 XML 数据
    const xmlData = await req.text();
    console.log("收到消息:", xmlData);

    // 解析消息
    const message = parseXML(xmlData);
    console.log("解析后的消息:", message);

    // 处理文本消息
    if (message.MsgType === "text" && message.Content) {
      // 调用 ChatGPT 获取回复
      const replyContent = await getChatGPTReply(message.Content);
      console.log("ChatGPT 回复:", replyContent);

      // 获取 access_token
      const accessToken = await getAccessToken();

      // 发送回复
      await sendTextMessage(accessToken, message.FromUserName, replyContent);
      console.log("已发送回复给客户");
    }

    // 处理客户添加事件（发送欢迎语）
    if (
      message.Event === "change_external_contact" &&
      message.ChangeType === "add_external_contact"
    ) {
      const welcomeMessage =
        "您好！欢迎添加途阳科技企业微信。\n\n我是智能客服助手，可以帮您解答关于积分兑换的问题。请问有什么可以帮助您的吗？";

      const accessToken = await getAccessToken();
      await sendTextMessage(accessToken, message.FromUserName, welcomeMessage);
      console.log("已发送欢迎语");
    }

    return new NextResponse("success", { status: 200 });
  } catch (error) {
    console.error("POST 请求处理出错:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export const runtime = "nodejs";
