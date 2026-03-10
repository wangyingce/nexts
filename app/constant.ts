export const OWNER = "Yidadaa";
export const REPO = "ChatGPT-Next-Web";
export const REPO_URL = `https://github.com/${OWNER}/${REPO}`;
export const ISSUE_URL = `https://github.com/${OWNER}/${REPO}/issues`;
export const UPDATE_URL = `${REPO_URL}#keep-updated`;
export const RELEASE_URL = `${REPO_URL}/releases`;
export const FETCH_COMMIT_URL = `https://api.github.com/repos/${OWNER}/${REPO}/commits?per_page=1`;
export const FETCH_TAG_URL = `https://api.github.com/repos/${OWNER}/${REPO}/tags?per_page=1`;
export const RUNTIME_CONFIG_DOM = "danger-runtime-config";
export const DEFAULT_CORS_HOST = "https://a.nextweb.fun";
export const DEFAULT_API_HOST = `${DEFAULT_CORS_HOST}/api/proxy`;
export const OPENAI_BASE_URL = "https://api.openai.com";

export const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/";

export enum Path {
  Home = "/",
  Chat = "/chat",
  Settings = "/settings",
  NewChat = "/new-chat",
  Masks = "/masks",
  Auth = "/auth",
  Lunar = "/lunar",
}

export enum ApiPath {
  Cors = "/api/cors",
  OpenAI = "/api/openai",
}

export enum SlotID {
  AppBody = "app-body",
  CustomModel = "custom-model",
}

export enum FileName {
  Masks = "masks.json",
  Prompts = "prompts.json",
}

export enum StoreKey {
  Chat = "chat-next-web-store",
  Access = "access-control",
  Config = "app-config",
  Mask = "mask-store",
  Prompt = "prompt-store",
  Update = "chat-update",
  Sync = "sync",
}

export const DEFAULT_SIDEBAR_WIDTH = 300;
export const MAX_SIDEBAR_WIDTH = 500;
export const MIN_SIDEBAR_WIDTH = 230;
export const NARROW_SIDEBAR_WIDTH = 100;

export const ACCESS_CODE_PREFIX = "nk-";

export const LAST_INPUT_KEY = "last-input";
export const UNFINISHED_INPUT = (id: string) => "unfinished-input-" + id;

export const STORAGE_KEY = "chatgpt-next-web";

export const REQUEST_TIMEOUT_MS = 60000;

export const EXPORT_MESSAGE_CLASS_NAME = "export-markdown";

export enum ServiceProvider {
  OpenAI = "OpenAI",
  Azure = "Azure",
  Google = "Google",
}

export enum ModelProvider {
  GPT = "GPT",
  GeminiPro = "GeminiPro",
}

export const OpenaiPath = {
  ChatPath: "v1/chat/completions",
  UsagePath: "dashboard/billing/usage",
  SubsPath: "dashboard/billing/subscription",
  ListModelPath: "v1/models",
};

export const Azure = {
  ExampleEndpoint: "https://{resource-url}/openai/deployments/{deploy-id}",
};

export const Google = {
  ExampleEndpoint: "https://generativelanguage.googleapis.com/",
  ChatPath: "v1beta/models/gemini-pro:generateContent",

  // /api/openai/v1/chat/completions
};

export const DEFAULT_INPUT_TEMPLATE = `{{input}}`; // input / time / model / lang
export const DEFAULT_SYSTEM_TEMPLATE = `
You are ChatGPT, a large language model trained by OpenAI.
Knowledge cutoff: {{cutoff}}
Current model: {{model}}
Current time: {{time}}
Latex inline: $x^2$ 
Latex block: $$e=mc^2$$
`;

export const SUMMARIZE_MODEL = "gpt-5-nano";

export const KnowledgeCutOffDate: Record<string, string> = {
  default: "2024-01",
  // OpenAI 模型（无需前缀）
  "gpt-5.4": "2025-06",
  "gpt-5.4-pro": "2025-06",
  "gpt-5-mini": "2025-06",
  "gpt-5-nano": "2025-06",
  // Google 模型
  "google/gemini-3-flash-preview": "2025-06",
  "google/gemini-2.5-pro": "2025-01",
  "google/gemini-2.5-flash": "2025-01",
  "google/gemini-2.5-flash-lite": "2025-01",
  // Claude 模型
  "anthropic/claude-opus-4-6": "2025-04",
  "anthropic/claude-sonnet-4-6": "2025-04",
  "anthropic/claude-haiku-4-5": "2025-01",
  // xAI Grok 模型
  "x-ai/grok-4-fast": "2025-06",
  "x-ai/grok-3": "2024-12",
  "x-ai/grok-3-mini": "2024-12",
  // DeepSeek 模型
  "deepseek/deepseek-v3.2": "2025-03",
  "deepseek/deepseek-r1": "2025-01",
  // MiniMax 模型
  "minimax/minimax-m2.5": "2025-12",
  "minimax/minimax-m2.1": "2025-06",
};

export const DEFAULT_MODELS = [
  // ===== OpenAI 模型（无需前缀，项目原生支持）=====
  {
    name: "gpt-5.4",
    available: true,
    provider: {
      id: "openai",
      providerName: "OpenAI",
      providerType: "openai",
    },
  },
  {
    name: "gpt-5.4-pro",
    available: true,
    provider: {
      id: "openai",
      providerName: "OpenAI",
      providerType: "openai",
    },
  },
  {
    name: "gpt-5-mini",
    available: true,
    provider: {
      id: "openai",
      providerName: "OpenAI",
      providerType: "openai",
    },
  },
  {
    name: "gpt-5-nano",
    available: true,
    provider: {
      id: "openai",
      providerName: "OpenAI",
      providerType: "openai",
    },
  },
  // ===== Google 模型（需加 google/ 前缀）=====
  {
    name: "google/gemini-3-flash-preview",
    available: true,
    provider: {
      id: "google",
      providerName: "Google",
      providerType: "google",
    },
  },
  {
    name: "google/gemini-2.5-pro",
    available: true,
    provider: {
      id: "google",
      providerName: "Google",
      providerType: "google",
    },
  },
  {
    name: "google/gemini-2.5-flash",
    available: true,
    provider: {
      id: "google",
      providerName: "Google",
      providerType: "google",
    },
  },
  {
    name: "google/gemini-2.5-flash-lite",
    available: true,
    provider: {
      id: "google",
      providerName: "Google",
      providerType: "google",
    },
  },
  // ===== Claude 模型（需加 anthropic/ 前缀）=====
  {
    name: "anthropic/claude-opus-4-6",
    available: true,
    provider: {
      id: "anthropic",
      providerName: "Anthropic",
      providerType: "anthropic",
    },
  },
  {
    name: "anthropic/claude-sonnet-4-6",
    available: true,
    provider: {
      id: "anthropic",
      providerName: "Anthropic",
      providerType: "anthropic",
    },
  },
  {
    name: "anthropic/claude-haiku-4-5",
    available: true,
    provider: {
      id: "anthropic",
      providerName: "Anthropic",
      providerType: "anthropic",
    },
  },
  // ===== xAI Grok 模型（需加 x-ai/ 前缀）=====
  {
    name: "x-ai/grok-4-fast",
    available: true,
    provider: {
      id: "x-ai",
      providerName: "xAI",
      providerType: "x-ai",
    },
  },
  {
    name: "x-ai/grok-3",
    available: true,
    provider: {
      id: "x-ai",
      providerName: "xAI",
      providerType: "x-ai",
    },
  },
  {
    name: "x-ai/grok-3-mini",
    available: true,
    provider: {
      id: "x-ai",
      providerName: "xAI",
      providerType: "x-ai",
    },
  },
  // ===== DeepSeek 模型（需加 deepseek/ 前缀）=====
  {
    name: "deepseek/deepseek-v3.2",
    available: true,
    provider: {
      id: "deepseek",
      providerName: "DeepSeek",
      providerType: "deepseek",
    },
  },
  {
    name: "deepseek/deepseek-r1",
    available: true,
    provider: {
      id: "deepseek",
      providerName: "DeepSeek",
      providerType: "deepseek",
    },
  },
  // ===== MiniMax 模型（需加 minimax/ 前缀）=====
  {
    name: "minimax/minimax-m2.5",
    available: true,
    provider: {
      id: "minimax",
      providerName: "MiniMax",
      providerType: "minimax",
    },
  },
  {
    name: "minimax/minimax-m2.1",
    available: true,
    provider: {
      id: "minimax",
      providerName: "MiniMax",
      providerType: "minimax",
    },
  },
  // ===== 兼容性保留（供内部逻辑判断使用，不对外展示）=====
  {
    name: "gemini-pro",
    available: false,
    provider: {
      id: "google",
      providerName: "Google",
      providerType: "google",
    },
  },
] as const;

export const CHAT_PAGE_SIZE = 15;
export const MAX_RENDER_MSG_COUNT = 45;
