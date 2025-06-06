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

export const SUMMARIZE_MODEL = "gpt-3.5-turbo";

export const KnowledgeCutOffDate: Record<string, string> = {
  default: "2021-09",
  "gpt-4-turbo-preview": "2023-04",
  "gpt-4-1106-preview": "2023-04",
  "gpt-4-0125-preview": "2023-04",
  "gpt-4-vision-preview": "2023-04",
  "gpt-4o": "2023-10",
  "gpt-4o-2024-05-13": "2023-10",
  "o1-preview": "2024-04",
  "o1-mini": "2025-01",
  "o3-mini": "2025-02",
  "gpt-4.1": "2025-04"
};

export const DEFAULT_MODELS = [
  // {
  //   name: "gpt-4",
  //   available: true,
  //   provider: {
  //     id: "openai",
  //     providerName: "OpenAI",
  //     providerType: "openai",
  //   },
  // },
  // {
  //   name: "gpt-4-0314",
  //   available: true,
  //   provider: {
  //     id: "openai",
  //     providerName: "OpenAI",
  //     providerType: "openai",
  //   },
  // },
  // {
  //   name: "gpt-4-0613",
  //   available: true,
  //   provider: {
  //     id: "openai",
  //     providerName: "OpenAI",
  //     providerType: "openai",
  //   },
  // },
  // {
  //   name: "gpt-4-32k",
  //   available: true,
  //   provider: {
  //     id: "openai",
  //     providerName: "OpenAI",
  //     providerType: "openai",
  //   },
  // },
  // {
  //   name: "gpt-4-32k-0314",
  //   available: true,
  //   provider: {
  //     id: "openai",
  //     providerName: "OpenAI",
  //     providerType: "openai",
  //   },
  // },
  // {
  //   name: "gpt-4-32k-0613",
  //   available: true,
  //   provider: {
  //     id: "openai",
  //     providerName: "OpenAI",
  //     providerType: "openai",
  //   },
  // },
  // {
  //   name: "gpt-4-turbo-preview",
  //   available: true,
  //   provider: {
  //     id: "openai",
  //     providerName: "OpenAI",
  //     providerType: "openai",
  //   },
  // },
  {
    name: "gpt-4o",
    available: true,
    provider: {
      id: "openai",
      providerName: "OpenAI",
      providerType: "openai",
    },
  },
  {
    name: "gpt-4o-2024-05-13",
    available: true,
    provider: {
      id: "openai",
      providerName: "OpenAI",
      providerType: "openai",
    },
  },
  {
    name: "gpt-4-1106-preview",
    available: true,
    provider: {
      id: "openai",
      providerName: "OpenAI",
      providerType: "openai",
    },
  },
  {
    name: "gpt-4-0125-preview",
    available: true,
    provider: {
      id: "openai",
      providerName: "OpenAI",
      providerType: "openai",
    },
  },
  {
    name: "gpt-4-vision-preview",
    available: true,
    provider: {
      id: "openai",
      providerName: "OpenAI",
      providerType: "openai",
    },
  },
  {
    name: "gpt-3.5-turbo",
    available: true,
    provider: {
      id: "openai",
      providerName: "OpenAI",
      providerType: "openai",
    },
  },
  {
    name: "gpt-3.5-turbo-0125",
    available: true,
    provider: {
      id: "openai",
      providerName: "OpenAI",
      providerType: "openai",
    },
  },
  {
    name: "gpt-3.5-turbo-0301",
    available: true,
    provider: {
      id: "openai",
      providerName: "OpenAI",
      providerType: "openai",
    },
  },
  {
    name: "gpt-3.5-turbo-0613",
    available: true,
    provider: {
      id: "openai",
      providerName: "OpenAI",
      providerType: "openai",
    },
  },
  {
    name: "gpt-3.5-turbo-1106",
    available: true,
    provider: {
      id: "openai",
      providerName: "OpenAI",
      providerType: "openai",
    },
  },
  {
    name: "gpt-3.5-turbo-16k",
    available: true,
    provider: {
      id: "openai",
      providerName: "OpenAI",
      providerType: "openai",
    },
  },
  {
    name: "gpt-3.5-turbo-16k-0613",
    available: true,
    provider: {
      id: "openai",
      providerName: "OpenAI",
      providerType: "openai",
    },
  },
  {
    name: "gemini-pro",
    available: true,
    provider: {
      id: "google",
      providerName: "Google",
      providerType: "google",
    },
  },
  {
    name: "google/gemma-3-27b-it",
    available: true,
    provider: {
      id: "google",
      providerName: "google",
      providerType: "google",
    },
  },
  {
    name: "google/gemini-2.5-pro-preview-03-25 ",
    available: true,
    provider: {
      id: "google",
      providerName: "google",
      providerType: "google",
    },
  },
  {
    name: "anthropic/claude-3.5-sonnet",
    available: true,
    provider: {
      id: "anthropic",
      providerName: "anthropic",
      providerType: "anthropic",
    },
  },
  {
    name: "anthropic/claude-3.7-sonnet",
    available: true,
    provider: {
      id: "anthropic",
      providerName: "anthropic",
      providerType: "anthropic",
    },
  },
  {
    name: "anthropic/claude-3.7-sonnet:thinking",
    available: true,
    provider: {
      id: "anthropic",
      providerName: "anthropic",
      providerType: "anthropic",
    },
  },
  {
    name: "anthropic/claude-sonnet-4",
    available: true,
    provider: {
      id: "anthropic",
      providerName: "anthropic",
      providerType: "anthropic",
    },
  },
  {
    name: "x-ai/grok-3-beta",
    available: true,
    provider: {
      id: "x-ai",
      providerName: "x-ai",
      providerType: "x-ai",
    },
  },
  {
    name: "deepseek/deepseek-r1",
    available: true,
    provider: {
      id: "deepseek",
      providerName: "deepseek",
      providerType: "deepseek",
    },
  },
  {
    name: "o1-preview",
    available: true,
    provider: {
      id: "openai",
      providerName: "OpenAI",
      providerType: "OpenAI",
    },
  },
  {
    name: "o1-mini",
    available: true,
    provider: {
      id: "openai",
      providerName: "OpenAI",
      providerType: "OpenAI",
    },
  },
  {
    name: "o3-mini",
    available: true,
    provider: {
      id: "openai",
      providerName: "OpenAI",
      providerType: "OpenAI",
    },
  },
  {
    name: "gpt-4.1",
    available: true,
    provider: {
      id: "openai",
      providerName: "OpenAI",
      providerType: "OpenAI",
    },
  }
] as const;

export const CHAT_PAGE_SIZE = 15;
export const MAX_RENDER_MSG_COUNT = 45;
