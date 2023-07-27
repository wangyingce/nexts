import { useDebouncedCallback } from "use-debounce";
import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
} from "react";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import SendWhiteIcon from "../icons/send-white.svg";
import BrainIcon from "../icons/brain.svg";
import RenameIcon from "../icons/rename.svg";
import Upload from "../icons/upload.svg";
import ExportIcon from "../icons/share.svg";
import ReturnIcon from "../icons/return.svg";
import CopyIcon from "../icons/copy.svg";
import LoadingIcon from "../icons/three-dots.svg";
import PromptIcon from "../icons/prompt.svg";
import MaskIcon from "../icons/mask.svg";
import MaxIcon from "../icons/max.svg";
import MinIcon from "../icons/min.svg";
import ResetIcon from "../icons/reload.svg";
import BreakIcon from "../icons/break.svg";
import AnPdf from "../icons/anPDF.svg";
import AnLoading from "../icons/loading.svg";
import SettingsIcon from "../icons/chat-settings.svg";

import LightIcon from "../icons/light.svg";
import DarkIcon from "../icons/dark.svg";
import AutoIcon from "../icons/auto.svg";
import BottomIcon from "../icons/bottom.svg";
import StopIcon from "../icons/pause.svg";
import "./chat.scss";
import {
  ChatMessage,
  SubmitKey,
  useChatStore,
  BOT_HELLO,
  createMessage,
  useAccessStore,
  Theme,
  useAppConfig,
  DEFAULT_TOPIC,
} from "../store";

import {
  copyToClipboard,
  downloadAs,
  selectOrCopy,
  autoGrowTextArea,
  useMobileScreen,
} from "../utils";

import dynamic from "next/dynamic";

import { ChatControllerPool } from "../client/controller";
import { Prompt, usePromptStore } from "../store/prompt";
import Locale from "../locales";

import { IconButton } from "./button";
import styles from "./home.module.scss";
import chatStyle from "./chat.module.scss";

import { ListItem, Modal } from "./ui-lib";
import { useLocation, useNavigate } from "react-router-dom";
import { LAST_INPUT_KEY, Path, REQUEST_TIMEOUT_MS } from "../constant";
import { Avatar } from "./emoji";
import { MaskAvatar, MaskConfig } from "./mask";
import { useMaskStore } from "../store/mask";
import { useCommand } from "../command";
import { prettyObject } from "../utils/format";
import { ExportMessageModal } from "./exporter";
import { getClientConfig } from "../config/client";

const Markdown = dynamic(async () => (await import("./markdown")).Markdown, {
  loading: () => <LoadingIcon />,
});

export function SessionConfigModel(props: { onClose: () => void }) {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const maskStore = useMaskStore();
  const navigate = useNavigate();

  return (
    <div className="modal-mask">
      <Modal
        title={Locale.Context.Edit}
        onClose={() => props.onClose()}
        actions={[
          <IconButton
            key="reset"
            icon={<ResetIcon />}
            bordered
            text={Locale.Chat.Config.Reset}
            onClick={() => {
              if (confirm(Locale.Memory.ResetConfirm)) {
                chatStore.updateCurrentSession(
                  (session) => (session.memoryPrompt = ""),
                );
              }
            }}
          />,
          <IconButton
            key="copy"
            icon={<CopyIcon />}
            bordered
            text={Locale.Chat.Config.SaveAs}
            onClick={() => {
              navigate(Path.Masks);
              setTimeout(() => {
                maskStore.create(session.mask);
              }, 500);
            }}
          />,
        ]}
      >
        <MaskConfig
          mask={session.mask}
          updateMask={(updater) => {
            const mask = { ...session.mask };
            updater(mask);
            chatStore.updateCurrentSession((session) => (session.mask = mask));
          }}
          shouldSyncFromGlobal
          extraListItems={
            session.mask.modelConfig.sendMemory ? (
              <ListItem
                title={`${Locale.Memory.Title} (${session.lastSummarizeIndex} of ${session.messages.length})`}
                subTitle={session.memoryPrompt || Locale.Memory.EmptyContent}
              ></ListItem>
            ) : (
              <></>
            )
          }
        ></MaskConfig>
      </Modal>
    </div>
  );
}

function PromptToast(props: {
  showToast?: boolean;
  showModal?: boolean;
  setShowModal: (_: boolean) => void;
}) {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const context = session.mask.context;

  return (
    <div className={chatStyle["prompt-toast"]} key="prompt-toast">
      {props.showToast && (
        <div
          className={chatStyle["prompt-toast-inner"] + " clickable"}
          role="button"
          onClick={() => props.setShowModal(true)}
        >
          <BrainIcon />
          <span className={chatStyle["prompt-toast-content"]}>
            {Locale.Context.Toast(context.length)}
          </span>
        </div>
      )}
      {props.showModal && (
        <SessionConfigModel onClose={() => props.setShowModal(false)} />
      )}
    </div>
  );
}

function useSubmitHandler() {
  const config = useAppConfig();
  const submitKey = config.submitKey;

  const shouldSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return false;
    if (e.key === "Enter" && e.nativeEvent.isComposing) return false;
    return (
      (config.submitKey === SubmitKey.AltEnter && e.altKey) ||
      (config.submitKey === SubmitKey.CtrlEnter && e.ctrlKey) ||
      (config.submitKey === SubmitKey.ShiftEnter && e.shiftKey) ||
      (config.submitKey === SubmitKey.MetaEnter && e.metaKey) ||
      (config.submitKey === SubmitKey.Enter &&
        !e.altKey &&
        !e.ctrlKey &&
        !e.shiftKey &&
        !e.metaKey)
    );
  };

  return {
    submitKey,
    shouldSubmit,
  };
}

export function PromptHints(props: {
  prompts: Prompt[];
  onPromptSelect: (prompt: Prompt) => void;
}) {
  const noPrompts = props.prompts.length === 0;
  const [selectIndex, setSelectIndex] = useState(0);
  const selectedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectIndex(0);
  }, [props.prompts.length]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (noPrompts) return;
      if (e.metaKey || e.altKey || e.ctrlKey) {
        return;
      }
      // arrow up / down to select prompt
      const changeIndex = (delta: number) => {
        e.stopPropagation();
        e.preventDefault();
        const nextIndex = Math.max(
          0,
          Math.min(props.prompts.length - 1, selectIndex + delta),
        );
        setSelectIndex(nextIndex);
        selectedRef.current?.scrollIntoView({
          block: "center",
        });
      };

      if (e.key === "ArrowUp") {
        changeIndex(1);
      } else if (e.key === "ArrowDown") {
        changeIndex(-1);
      } else if (e.key === "Enter") {
        const selectedPrompt = props.prompts.at(selectIndex);
        if (selectedPrompt) {
          props.onPromptSelect(selectedPrompt);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.prompts.length, selectIndex]);

  if (noPrompts) return null;
  return (
    <div className={styles["prompt-hints"]}>
      {props.prompts.map((prompt, i) => (
        <div
          ref={i === selectIndex ? selectedRef : null}
          className={
            styles["prompt-hint"] +
            ` ${i === selectIndex ? styles["prompt-hint-selected"] : ""}`
          }
          key={prompt.title + i.toString()}
          onClick={() => props.onPromptSelect(prompt)}
          onMouseEnter={() => setSelectIndex(i)}
        >
          <div className={styles["hint-title"]}>{prompt.title}</div>
          <div className={styles["hint-content"]}>{prompt.content}</div>
        </div>
      ))}
    </div>
  );
}

function ClearContextDivider() {
  const chatStore = useChatStore();

  return (
    <div
      className={chatStyle["clear-context"]}
      onClick={() =>
        chatStore.updateCurrentSession(
          (session) => (session.clearContextIndex = undefined),
        )
      }
    >
      <div className={chatStyle["clear-context-tips"]}>
        {Locale.Context.Clear}
      </div>
      <div className={chatStyle["clear-context-revert-btn"]}>
        {Locale.Context.Revert}
      </div>
    </div>
  );
}

function ChatAction(props: {
  text?: any;
  el?: any;
  pdfNameSpace?: any;
  icon: JSX.Element;
  onClick: any;
}) {
  const iconRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const elRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState({
    full: 20,
    icon: 20,
  });

  function updateWidth() {
    if (!iconRef.current || (!textRef.current && !elRef.current)) return;
    const getWidth = (dom: any) => dom.getBoundingClientRect().width;

    console.log(props.text);
    console.log(props.el);
    const textWidth = getWidth(props.text ? textRef.current : elRef.current);
    console.log("textWidth-", textWidth);
    const iconWidth = getWidth(iconRef.current);
    setWidth({
      full: textWidth + iconWidth,
      icon: iconWidth,
    });
  }

  useEffect(() => {
    updateWidth();
  }, []);

  return (
    <div
      className={`${chatStyle["chat-input-action"]} clickable`}
      onClick={() => {
        props.onClick();
        setTimeout(() => {
          updateWidth();
        }, 1);
      }}
      onMouseEnter={() => {
        props.el && updateWidth();
      }}
      style={
        {
          "--icon-width": `${width.icon}px`,
          "--full-width": `${width.full}px`,
        } as React.CSSProperties
      }
    >
      <div
        ref={iconRef}
        className={chatStyle["icon"]}
        style={{ fill: props.pdfNameSpace ? "blue" : "" }}
      >
        {props.icon}
      </div>
      {props.text ? (
        <div className={chatStyle["text"]} ref={textRef}>
          {props.text}
        </div>
      ) : null}
      {props.el ? (
        <div className={chatStyle["el"]} ref={elRef}>
          {props.el}
        </div>
      ) : null}
    </div>
  );
}

function useScrollToBottom() {
  // for auto-scroll
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollToBottom = () => {
    const dom = scrollRef.current;
    if (dom) {
      setTimeout(() => (dom.scrollTop = dom.scrollHeight), 1);
    }
  };

  // auto scroll
  useLayoutEffect(() => {
    autoScroll && scrollToBottom();
  });

  return {
    scrollRef,
    autoScroll,
    setAutoScroll,
    scrollToBottom,
  };
}

export function ChatActions(props: {
  showPromptModal: () => void;
  scrollToBottom: () => void;
  showPromptHints: () => void;
  hitBottom: boolean;
  pdfLists: any;
  uploadin?: any;
  uploadPDF?: any;
}) {
  const { pdfLists } = props;
  const config = useAppConfig();
  const navigate = useNavigate();
  const chatStore = useChatStore();

  // switch themes
  const theme = config.theme;
  function nextTheme() {
    const themes = [Theme.Auto, Theme.Light, Theme.Dark];
    const themeIndex = themes.indexOf(theme);
    const nextIndex = (themeIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    config.update((config) => (config.theme = nextTheme));
  }

  // stop all responses
  const couldStop = ChatControllerPool.hasPending();
  const stopAll = () => ChatControllerPool.stopAll();

  const [pdfNameSpace, pdfNameSpaceSet] = useState<any>("");
  return (
    <>
      <div className={chatStyle["chat-input-actions"]}>
        {couldStop && (
          <ChatAction
            onClick={stopAll}
            text={Locale.Chat.InputActions.Stop}
            icon={<StopIcon />}
          />
        )}
        {!props.hitBottom && (
          <ChatAction
            onClick={props.scrollToBottom}
            text={Locale.Chat.InputActions.ToBottom}
            icon={<BottomIcon />}
          />
        )}
        {props.hitBottom && (
          <ChatAction
            onClick={props.showPromptModal}
            text={Locale.Chat.InputActions.Settings}
            icon={<SettingsIcon />}
          />
        )}

        <ChatAction
          onClick={nextTheme}
          text={Locale.Chat.InputActions.Theme[theme]}
          icon={
            <>
              {theme === Theme.Auto ? (
                <AutoIcon />
              ) : theme === Theme.Light ? (
                <LightIcon />
              ) : theme === Theme.Dark ? (
                <DarkIcon />
              ) : null}
            </>
          }
        />

        <ChatAction
          onClick={props.showPromptHints}
          text={Locale.Chat.InputActions.Prompt}
          icon={<PromptIcon />}
        />

        <ChatAction
          onClick={() => {
            navigate(Path.Masks);
          }}
          text={Locale.Chat.InputActions.Masks}
          icon={<MaskIcon />}
        />

        <ChatAction
          text={Locale.Chat.InputActions.Clear}
          icon={<BreakIcon />}
          onClick={() => {
            chatStore.updateCurrentSession((session) => {
              if (session.clearContextIndex === session.messages.length) {
                session.clearContextIndex = undefined;
              } else {
                session.clearContextIndex = session.messages.length;
                session.memoryPrompt = ""; // will clear memory
              }
            });
          }}
        />
      </div>
      <div className="pdfBox">
        <div
          className="window-action-button uploadPDF"
          title={Locale.Home.upload}
        >
          {props.uploadin ? (
            <IconButton
              className="anLoading"
              text="上传中"
              icon={<AnLoading />}
              bordered
            />
          ) : (
            <IconButton icon={<Upload />} text="上传PDF" bordered />
          )}

          {/* 只允许上传pdf */}
          <input
            id="uploadPDFinputEl"
            type="file"
            disabled={props.uploadin}
            accept=".pdf"
            onChange={props.uploadPDF}
          ></input>
        </div>
        <div className="pdfListBox">
          <ChatAction
            pdfNameSpace={pdfNameSpace}
            icon={<AnPdf />}
            onClick={(e: any) => {}}
          />
          <div>
            <select
              id="pdfSelect"
              title={pdfNameSpace}
              onChange={(e: any) => {
                console.log(e.target.value);
                pdfNameSpaceSet(e.target.value);
                sessionStorage.setItem("pdfNameSpace", e.target.value);
                enqueueSnackbar(
                  e.target.value
                    ? `对话将围绕PDF进行回复，PDF：${e.target.value}`
                    : "后续对话恢复为日常对话模式",
                  { autoHideDuration: 4000 },
                );
              }}
            >
              <option value="">请选择</option>
              {pdfLists.map((item: any) => {
                return (
                  <option title={item} key={item} value={item}>
                    {item}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>
    </>
  );
}

export function Chat() {
  type RenderMessage = ChatMessage & { preview?: boolean };

  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);
  const config = useAppConfig();
  const fontSize = config.fontSize;

  const [showExport, setShowExport] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { submitKey, shouldSubmit } = useSubmitHandler();
  const { scrollRef, setAutoScroll, scrollToBottom } = useScrollToBottom();
  const [hitBottom, setHitBottom] = useState(true);
  const isMobileScreen = useMobileScreen();
  const navigate = useNavigate();

  const onChatBodyScroll = (e: HTMLElement) => {
    const isTouchBottom = e.scrollTop + e.clientHeight >= e.scrollHeight - 100;
    setHitBottom(isTouchBottom);
  };

  // prompt hints
  const promptStore = usePromptStore();
  const [promptHints, setPromptHints] = useState<Prompt[]>([]);
  const onSearch = useDebouncedCallback(
    (text: string) => {
      setPromptHints(promptStore.search(text));
    },
    100,
    { leading: true, trailing: true },
  );

  const onPromptSelect = (prompt: Prompt) => {
    setPromptHints([]);
    inputRef.current?.focus();
    setTimeout(() => setUserInput(prompt.content), 60);
  };

  // auto grow input
  const [inputRows, setInputRows] = useState(2);
  const measure = useDebouncedCallback(
    () => {
      const rows = inputRef.current ? autoGrowTextArea(inputRef.current) : 1;
      const inputRows = Math.min(
        20,
        Math.max(2 + Number(!isMobileScreen), rows),
      );
      setInputRows(inputRows);
    },
    100,
    {
      leading: true,
      trailing: true,
    },
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(measure, [userInput]);

  // only search prompts when user input is short
  const SEARCH_TEXT_LIMIT = 30;
  const onInput = (text: string) => {
    setUserInput(text);
    const n = text.trim().length;

    // clear search results
    if (n === 0) {
      setPromptHints([]);
    } else if (!config.disablePromptHint && n < SEARCH_TEXT_LIMIT) {
      // check if need to trigger auto completion
      if (text.startsWith("/")) {
        let searchText = text.slice(1);
        onSearch(searchText);
      }
    }
  };

  const doSubmit = (userInput: string) => {
    if (userInput.trim() === "") return;
    // setIsLoading(true);
    chatStore
      .onUserInput(userInput)
      .then((res: any) => {
        console.log("回调回来了123kjadf", res);
        // setIsLoading(false)
      })
      .catch((err: any) => {
        console.log("err8786876h", err);
      });
    localStorage.setItem(LAST_INPUT_KEY, userInput);
    setUserInput("");
    setPromptHints([]);
    if (!isMobileScreen) inputRef.current?.focus();
    setAutoScroll(true);
  };

  // stop response
  const onUserStop = (messageId: number) => {
    ChatControllerPool.stop(sessionIndex, messageId);
  };

  useEffect(() => {
    getNameSpace();
    chatStore.updateCurrentSession((session) => {
      const stopTiming = Date.now() - REQUEST_TIMEOUT_MS;
      session.messages.forEach((m) => {
        // check if should stop all stale messages
        if (m.isError || new Date(m.date).getTime() < stopTiming) {
          if (m.streaming) {
            m.streaming = false;
          }

          if (m.content.length === 0) {
            m.isError = true;
            m.content = prettyObject({
              error: true,
              message: "empty response",
            });
          }
        }
      });

      // auto sync mask config from global config
      if (session.mask.syncGlobalConfig) {
        console.log("[Mask] syncing from global, name = ", session.mask.name);
        session.mask.modelConfig = { ...config.modelConfig };
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // check if should send message
  const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // if ArrowUp and no userInput, fill with last input
    if (
      e.key === "ArrowUp" &&
      userInput.length <= 0 &&
      !(e.metaKey || e.altKey || e.ctrlKey)
    ) {
      setUserInput(localStorage.getItem(LAST_INPUT_KEY) ?? "");
      e.preventDefault();
      return;
    }
    if (shouldSubmit(e) && promptHints.length === 0) {
      doSubmit(userInput);
      e.preventDefault();
    }
  };
  const onRightClick = (e: any, message: ChatMessage) => {
    // copy to clipboard
    if (selectOrCopy(e.currentTarget, message.content)) {
      e.preventDefault();
    }
  };

  const findLastUserIndex = (messageId: number) => {
    // find last user input message and resend
    let lastUserMessageIndex: number | null = null;
    for (let i = 0; i < session.messages.length; i += 1) {
      const message = session.messages[i];
      if (message.id === messageId) {
        break;
      }
      if (message.role === "user") {
        lastUserMessageIndex = i;
      }
    }

    return lastUserMessageIndex;
  };

  const deleteMessage = (userIndex: number) => {
    chatStore.updateCurrentSession((session) =>
      session.messages.splice(userIndex, 2),
    );
  };

  const onDelete = (botMessageId: number) => {
    const userIndex = findLastUserIndex(botMessageId);
    if (userIndex === null) return;
    deleteMessage(userIndex);
  };

  const onResend = (botMessageId: number) => {
    // find last user input message and resend
    const userIndex = findLastUserIndex(botMessageId);
    if (userIndex === null) return;

    setIsLoading(true);
    const content = session.messages[userIndex].content;
    deleteMessage(userIndex);
    chatStore.onUserInput(content).then(() => setIsLoading(false));
    inputRef.current?.focus();
  };

  const context: RenderMessage[] = session.mask.hideContext
    ? []
    : session.mask.context.slice();

  const accessStore = useAccessStore();

  if (
    context.length === 0 &&
    session.messages.at(0)?.content !== BOT_HELLO.content
  ) {
    const copiedHello = Object.assign({}, BOT_HELLO);
    if (!accessStore.isAuthorized()) {
      copiedHello.content = Locale.Error.Unauthorized;
    }
    context.push(copiedHello);
  }

  // clear context index = context length + index in messages
  const clearContextIndex =
    (session.clearContextIndex ?? -1) >= 0
      ? session.clearContextIndex! + context.length
      : -1;
  // console.log(context);
  // console.log(session.messages);
  // preview messages
  const messages = context
    .concat(session.messages as RenderMessage[])
    .concat(
      isLoading
        ? [
            {
              ...createMessage({
                role: "assistant",
                content: "……",
              }),
              preview: true,
            },
          ]
        : [],
    )
    .concat(
      userInput.length > 0 && config.sendPreviewBubble
        ? [
            {
              ...createMessage({
                role: "user",
                content: userInput,
              }),
              preview: true,
            },
          ]
        : [],
    );
  // console.log(messages)
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [pdfLists, pdfListsSet] = useState<any>([]);

  const renameSession = () => {
    const newTopic = prompt(Locale.Chat.Rename, session.topic);
    if (newTopic && newTopic !== session.topic) {
      chatStore.updateCurrentSession((session) => (session.topic = newTopic!));
    }
  };
  const getNameSpace = () => {
    fetch(
      `https://talk-to-joker-nodejs.vercel.app/api/indexNameSpace?code=${accessStore.accessCode}`,
    )
      .then((response) => response.json())
      .then((result: any) => {
        console.log(result);
        pdfListsSet(result.data);
      });
  };
  function validateNamespace(namespace: string) {
    const regex = /^[a-zA-Z0-9_]{1,64}$/;
    if (regex.test(namespace)) {
      return true;
    } else {
      return false;
    }
  }
  const [uploadin, uploadinSet] = useState<any>(false);
  const clearPDFInput = () => {
    const inputEl: any = document.getElementById("uploadPDFinputEl");
    inputEl.value = "";
  };
  const uploadPDF = (e: any) => {
    if (uploadin) {
      enqueueSnackbar("文件上传中。。。请勿稍等", { autoHideDuration: 3000 });
      clearPDFInput();
      return;
    }
    const file: any = e.target.files[0];
    console.log(file);
    // 限制上传三兆
    if (file.size > 1024 * 4 * 1000) {
      enqueueSnackbar("文件大小不能超过 4兆", { autoHideDuration: 3000 });
      clearPDFInput();
      return;
    }
    const formData: any = new FormData();
    if (!validateNamespace(file.name.slice(0, file.name.lastIndexOf(".")))) {
      enqueueSnackbar("文件名不符合规范,只能含有英文和数字", {
        autoHideDuration: 4000,
      });
      clearPDFInput();
      return;
    }
    formData.append("file", file);
    uploadinSet(true);
    fetch(
      `https://talk-to-joker-nodejs.vercel.app/api/nextPdf?fileName=${
        accessStore.accessCode + "_" + file.name
      }`,
      {
        method: "POST",
        body: formData,
      },
    )
      .then((response) => response.json())
      .then((result: any) => {
        clearPDFInput();
        uploadinSet(false);
        console.log(result);
        enqueueSnackbar("文件上传成功", { autoHideDuration: 4000 });

        getNameSpace();
      })
      .catch((err) => {
        clearPDFInput();
        console.log("err", err);
        uploadinSet(false);
      });
  };

  const clientConfig = useMemo(() => getClientConfig(), []);

  const location = useLocation();
  const isChat = location.pathname === Path.Chat;

  const autoFocus = !isMobileScreen || isChat; // only focus in chat page
  const showMaxIcon = !isMobileScreen && !clientConfig?.isApp;

  useCommand({
    fill: setUserInput,
    submit: (text) => {
      doSubmit(text);
    },
  });

  return (
    <SnackbarProvider>
      <div className={styles.chat} key={session.id}>
        <div className="window-header" data-tauri-drag-region>
          <div className="window-header-title">
            <div
              className={`window-header-main-title " ${styles["chat-body-title"]}`}
              onClickCapture={renameSession}
            >
              {!session.topic ? DEFAULT_TOPIC : session.topic}
            </div>
            <div className="window-header-sub-title">
              {Locale.Chat.SubTitle(session.messages.length)}
            </div>
          </div>
          <div className="window-actions">
            <div className={"window-action-button" + " " + styles.mobile}>
              <IconButton
                icon={<ReturnIcon />}
                bordered
                title={Locale.Chat.Actions.ChatList}
                onClick={() => navigate(Path.Home)}
              />
            </div>
            <div className="window-action-button">
              <IconButton
                icon={<RenameIcon />}
                bordered
                onClick={renameSession}
              />
            </div>
            <div className="window-action-button">
              <IconButton
                icon={<ExportIcon />}
                bordered
                title={Locale.Chat.Actions.Export}
                onClick={() => {
                  setShowExport(true);
                }}
              />
            </div>
            {showMaxIcon && (
              <div className="window-action-button">
                <IconButton
                  icon={config.tightBorder ? <MinIcon /> : <MaxIcon />}
                  bordered
                  onClick={() => {
                    config.update(
                      (config) => (config.tightBorder = !config.tightBorder),
                    );
                  }}
                />
              </div>
            )}
          </div>

          <PromptToast
            showToast={!hitBottom}
            showModal={showPromptModal}
            setShowModal={setShowPromptModal}
          />
        </div>

        <div
          className={styles["chat-body"]}
          ref={scrollRef}
          onScroll={(e) => onChatBodyScroll(e.currentTarget)}
          onMouseDown={() => inputRef.current?.blur()}
          onWheel={(e) => setAutoScroll(hitBottom && e.deltaY > 0)}
          onTouchStart={() => {
            inputRef.current?.blur();
            setAutoScroll(false);
          }}
        >
          {messages.map((message, i) => {
            const isUser = message.role === "user";
            const showActions =
              !isUser &&
              i > 0 &&
              !(message.preview || message.content.length === 0);
            const showTyping = message.preview || message.streaming;

            const shouldShowClearContextDivider = i === clearContextIndex - 1;

            return (
              <React.Fragment key={i}>
                <div
                  className={
                    isUser
                      ? styles["chat-message-user"]
                      : styles["chat-message"]
                  }
                >
                  <div className={styles["chat-message-container"]}>
                    <div className={styles["chat-message-avatar"]}>
                      {message.role === "user" ? (
                        <Avatar avatar={config.avatar} />
                      ) : (
                        <MaskAvatar mask={session.mask} />
                      )}
                    </div>
                    {showTyping && (
                      <div className={styles["chat-message-status"]}>
                        {Locale.Chat.Typing}
                      </div>
                    )}
                    <div className={styles["chat-message-item"]}>
                      {showActions && (
                        <div className={styles["chat-message-top-actions"]}>
                          {message.streaming ? (
                            <div
                              className={styles["chat-message-top-action"]}
                              onClick={() => onUserStop(message.id ?? i)}
                            >
                              {Locale.Chat.Actions.Stop}
                            </div>
                          ) : (
                            <>
                              <div
                                className={styles["chat-message-top-action"]}
                                onClick={() => onDelete(message.id ?? i)}
                              >
                                {Locale.Chat.Actions.Delete}
                              </div>
                              <div
                                className={styles["chat-message-top-action"]}
                                onClick={() => onResend(message.id ?? i)}
                              >
                                {Locale.Chat.Actions.Retry}
                              </div>
                            </>
                          )}

                          <div
                            className={styles["chat-message-top-action"]}
                            onClick={() => copyToClipboard(message.content)}
                          >
                            {Locale.Chat.Actions.Copy}
                          </div>
                        </div>
                      )}
                      <Markdown
                        content={message.content}
                        loading={
                          (message.preview || message.content.length === 0) &&
                          !isUser
                        }
                        // loading={true}
                        onContextMenu={(e) => onRightClick(e, message)}
                        onDoubleClickCapture={() => {
                          if (!isMobileScreen) return;
                          setUserInput(message.content);
                        }}
                        fontSize={fontSize}
                        parentRef={scrollRef}
                        defaultShow={i >= messages.length - 10}
                      />
                    </div>
                    {!isUser && !message.preview && (
                      <div className={styles["chat-message-actions"]}>
                        <div className={styles["chat-message-action-date"]}>
                          {message.date.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {shouldShowClearContextDivider && <ClearContextDivider />}
              </React.Fragment>
            );
          })}
        </div>

        <div className={styles["chat-input-panel"]}>
          <PromptHints prompts={promptHints} onPromptSelect={onPromptSelect} />

          <ChatActions
            uploadPDF={uploadPDF}
            uploadin={uploadin}
            pdfLists={pdfLists}
            showPromptModal={() => setShowPromptModal(true)}
            scrollToBottom={scrollToBottom}
            hitBottom={hitBottom}
            showPromptHints={() => {
              // Click again to close
              if (promptHints.length > 0) {
                setPromptHints([]);
                return;
              }

              inputRef.current?.focus();
              setUserInput("/");
              onSearch("");
            }}
          />
          <div className={styles["chat-input-panel-inner"]}>
            <textarea
              ref={inputRef}
              className={styles["chat-input"]}
              placeholder={Locale.Chat.Input(submitKey)}
              onInput={(e) => onInput(e.currentTarget.value)}
              value={userInput}
              onKeyDown={onInputKeyDown}
              onFocus={() => setAutoScroll(true)}
              onBlur={() => setAutoScroll(false)}
              rows={inputRows}
              autoFocus={autoFocus}
            />
            <IconButton
              icon={<SendWhiteIcon />}
              text={Locale.Chat.Send}
              className={styles["chat-input-send"]}
              type="primary"
              onClick={() => doSubmit(userInput)}
            />
          </div>
        </div>

        {showExport && (
          <ExportMessageModal onClose={() => setShowExport(false)} />
        )}
      </div>
    </SnackbarProvider>
  );
}
