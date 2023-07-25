import styles from "./auth.module.scss";
import { IconButton } from "./button";

import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import { useAccessStore } from "../store";
import Locale from "../locales";

import BotIcon from "../icons/bot.svg";
import { useEffect, useRef, useState } from "react";
const reg = /^1\d{10}$/;
export function AuthPage() {
  const navigate = useNavigate();
  const access = useAccessStore();
  const [yzmStart, yzmStartSet] = useState<number>(0);
  const [upload, uploadSet] = useState<any>([]);
  const pageThat = useRef<any>({
    timmer: null,
    phoneNumber: "",
    yzmNumber: "",
  });

  const goHome = () => navigate(Path.Home);
  const ok = async () => {
    if (!reg.test(pageThat.current.phoneNumber)) {
      alert("请填写正确的手机号");
      return;
    }

    if (pageThat.current.yzmNumber.length !== 6) {
      alert("请填写6位验证码");
      return;
    }
    // 接口判断验证码是否正确？
    // 正确则跳转到首页
    // 错误则提示错误信息
    let params: any = {
      phoneNumber: pageThat.current.phoneNumber,
      yzm: pageThat.current.yzmNumber,
    };
    console.log("参数是", params);
    if (pageThat.current.yzmNumber === "admin0" /* 万能验证码 */) {
      // fetch("http://localhost:3100/api/getPhoneJsonFile").then((result:any)=>{
      //   return result.json();
      // }).then((result:any)=>{
      //   console.log(result)
      // })
      fetch("http://localhost:3100/api/updateFile", {
        method: "POST",
        body: JSON.stringify({
          phone: pageThat.current.phoneNumber,
          updateTime: new Date().toLocaleString(),
        }),
      })
        .then((result: any) => {
          return result.json();
        })
        .then((result: any) => {
          console.log(result);
          if (result.code === 200) {
            goHome();
          } else {
            alert(result.msg);
          }
        });
    }
    // fetch("http://localhost:3000/api/判断手机号验证码是否匹配接口",params ).then((result:any)=>{
    //   if(result.code===200){
    //     // 跳转到首页
    //     goHome();

    //   }else{
    //     // 错误提示
    //     alert(result.message)
    //   }
    // })
  };

  useEffect(() => {
    let yzmConfig = JSON.parse(localStorage.getItem("yzmConfig") || "{}");
    // console.log('yzmConfig',yzmConfig,new Date().getTime()-yzmConfig.startTime>60000,yzmStart>0)
    if (
      new Date().getTime() - yzmConfig.startTime >
        60000 /* 历史验证码倒计时周期已经完全结束 */ ||
      yzmStart > 0 /* 倒计时正在进行中 */
    ) {
      if (yzmStart > 0) {
        setTimeout(() => {
          localStorage.setItem(
            "yzmConfig",
            JSON.stringify({
              ...yzmConfig,
              time: yzmStart - 1,
            }),
          );
          yzmStartSet(yzmStart - 1);
        }, 100);
      } else {
        localStorage.setItem(
          "yzmConfig",
          JSON.stringify({
            ...yzmConfig,
            time: 0,
          }),
        );
      }
    } else {
      if (
        new Date().getTime() - yzmConfig.startTime <
          60000 /* 在历史验证码倒计时60秒周期内 */ &&
        yzmConfig.phoneNumber /* 倒计时的电话号码 */
      ) {
        pageThat.current.phoneNumber = yzmConfig.phoneNumber;
      }
      console.log("进入了else", yzmConfig);
      yzmStartSet(yzmConfig.time || 0);
    }
  }, [yzmStart]);
  return (
    <div className={styles["auth-page"]}>
      <div className={`no-dark ${styles["auth-logo"]}`}>
        <BotIcon />
      </div>

      <div className={styles["auth-title"]}>{Locale.Auth.Title}</div>
      <div className={styles["auth-tips"]}>{Locale.Auth.Tips}</div>
      <input
        className={styles["auth-input"]}
        type="text"
        placeholder={Locale.Auth.phonePlaceholder}
        value={pageThat.current.phoneNumber}
        onChange={(e) => {
          uploadSet([]);
          pageThat.current.phoneNumber = e.target.value;
        }}
      />
      <div className={styles["yzmBox"]}>
        <input
          type="text"
          placeholder={Locale.Auth.yzmInputPlaceholder}
          value={pageThat.current.yzmNumber}
          onChange={(e) => {
            uploadSet([]);
            pageThat.current.yzmNumber = e.target.value;
          }}
        />
        <span
          style={{ cursor: yzmStart > 0 ? "not-allowed" : "pointer" }}
          onClick={() => {
            if (!reg.test(pageThat.current.phoneNumber)) {
              alert("请填写正确的手机号");
              return;
            }
            if (yzmStart > 0) {
              return;
            } else {
              let yzmConfig: any = JSON.parse(
                localStorage.getItem("yzmConfig") || "{}",
              );
              yzmConfig.startTime = yzmConfig.startTime || 0;
              if (new Date().getTime() - yzmConfig.startTime > 60) {
                console.log("发送fetch获取验证码");

                localStorage.setItem(
                  "yzmConfig",
                  JSON.stringify({
                    startTime: new Date().getTime(),
                    phoneNumber: pageThat.current.phoneNumber,
                    time: 60,
                  }),
                );
                clearInterval(pageThat.current.timmer);
                yzmStartSet(60);
              } else {
                yzmStartSet(yzmConfig.time);
              }
            }
          }}
        >
          {yzmStart ? yzmStart + " s" : Locale.Auth.yzmBtnText}
        </span>
      </div>

      <div className={styles["auth-actions"]}>
        <IconButton text={Locale.Auth.Confirm} type="primary" onClick={ok} />
        <IconButton text={Locale.Auth.Later} onClick={goHome} />
      </div>
    </div>
  );
}
