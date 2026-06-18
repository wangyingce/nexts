import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

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

// 验证签名
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
export async function GET(req: NextRequest) {
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
      console.log("URL验证成功");
      return new NextResponse(echostr, { status: 200 });
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

export const runtime = "edge";
