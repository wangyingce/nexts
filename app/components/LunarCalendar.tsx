import React, { useState, useEffect } from 'react';

const LunarCalendar = () => {
  const [result, setResult] = useState({
    className: '',
    message: '正在计算……'
  });
  const [lunarDate, setLunarDate] = useState({ month: 0, day: 0 });
  const [solarDate, setSolarDate] = useState({ month: 0, day: 0 });

  // 农历数据
  const lunarInfo = [
    0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0,
    0x09ad0, 0x055d2, 0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540,
    0x0d6a0, 0x0ada2, 0x095b0, 0x14977, 0x04970, 0x0a4b0, 0x0b4b5, 0x06a50,
    0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, 0x06566, 0x0d4a0,
    0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
    0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2,
    0x0a950, 0x0b557, 0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573,
    0x052d0, 0x0a9a8, 0x0e950, 0x06aa0, 0x0aea6, 0x0ab50, 0x04b60, 0x0aae4,
    0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, 0x096d0, 0x04dd5,
    0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46,
    0x0ab60, 0x09570, 0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58,
    0x05ac0, 0x0ab60, 0x096d5, 0x092e0, 0x0c960, 0x0d954, 0x0d4a0, 0x0da50,
    0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, 0x0a950, 0x0b4a0,
    0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260,
    0x0ea65, 0x0d530, 0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0,
    0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, 0x0b5a0, 0x056d0, 0x055b2, 0x049b0,
    0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0
  ];

  // 安全获取农历数据
  const getLunarInfo = (year: number) => {
    const idx = year - 1900;
    if (idx < 0 || idx >= lunarInfo.length) {
      return 0x04bd8;
    }
    return lunarInfo[idx];
  };

  const leapMonth = (year: number) => {
    return getLunarInfo(year) & 0xf;
  };

  const leapDays = (year: number) => {
    if (leapMonth(year)) {
      return (getLunarInfo(year) & 0x10000) ? 30 : 29;
    }
    return 0;
  };

  const monthDays = (year: number, month: number) => {
    return (getLunarInfo(year) & (0x10000 >> month)) ? 30 : 29;
  };

  const yearDays = (year: number) => {
    let sum = 348;
    for (let i = 0x8000; i > 0x8; i >>= 1) {
      sum += (getLunarInfo(year) & i) ? 1 : 0;
    }
    return sum + leapDays(year);
  };

  const solar2lunar = (year: number, month: number, day: number) => {
  const baseDate = new Date(1900, 0, 31);
  const objDate = new Date(year, month - 1, day);
  let offset = Math.floor((objDate.getTime() - baseDate.getTime()) / 86400000);
  
  // 确保 days 变量有初始值
  let days = 0;
  let isLeap = false;
  let leap = 0;
  let i;

  for (i = 1900; i < 2100 && offset > 0; i++) {
    days = yearDays(i);
    offset -= days;
  }
  
  // 现在 days 肯定有值
  if (offset < 0) {
    offset += days;
    i--;
  }

  const lunarYear = i!; // 使用非空断言
  leap = leapMonth(lunarYear);
  let lunarMonth;
  
  // 重置变量用于第二个循环
  days = 0;
  for (i = 1; i <= 12 && offset > 0; i++) {
    if (leap > 0 && i === leap + 1 && !isLeap) {
      --i;
      isLeap = true;
      days = leapDays(lunarYear);
    } else {
      days = monthDays(lunarYear, i);
    }

    if (isLeap && i === leap + 1) isLeap = false;
    offset -= days;
  }
  
  // 再次确保 days 有值
  if (offset < 0) {
    offset += days;
    i!--;
  }

  lunarMonth = i!; // 使用非空断言
  const lunarDay = offset + 1;

  return {
    lunarYear,
    lunarMonth,
    lunarDay,
    isLeap
  };
};

  // 检查是否是十斋日
  const checkIfTenZhaiDay = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    // 设置公历日期状态
    setSolarDate({ month, day });
    
    try {
      const lunar = solar2lunar(year, month, day);
      const lunarDay = lunar.lunarDay;
      const tenZhaiDays = [1, 8, 14, 15, 18, 23, 24, 28, 29, 30];
      
      // 设置农历日期状态
      setLunarDate({ month: lunar.lunarMonth, day: lunarDay });

      if (tenZhaiDays.includes(lunarDay)) {
        setResult({
          className: 'result yes',
          message: `是的，今天是十斋日（公历${month}月${day}日，农历${lunar.lunarMonth}月${lunarDay}日）！`
        });
      } else {
        setResult({
          className: 'result no',
          message: `不是，今天不是十斋日（公历${month}月${day}日，农历${lunar.lunarMonth}月${lunarDay}日）。`
        });
      }
    } catch (e) {
      setResult({
        className: 'result error',
        message: '计算错误，请稍后再试'
      });
    }
  };

  useEffect(() => {
    checkIfTenZhaiDay();
  }, []);

  // 页面样式
  const pageStyle: React.CSSProperties = {
    fontFamily: 'sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f6f6f6',
    padding: '20px',
    boxSizing: 'border-box'
  };

  const headerStyle: React.CSSProperties = {
    color: '#333',
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '2rem'
  };

  const resultStyle: React.CSSProperties = {
    fontSize: '1.2rem',
    marginTop: '20px',
    padding: '15px 30px',
    borderRadius: '10px',
    textAlign: 'center',
    maxWidth: '90%',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
  };

  const yesStyle: React.CSSProperties = {
    ...resultStyle,
    backgroundColor: '#d4edda',
    color: '#155724',
    animation: 'pulse 2s infinite'
  };

  const noStyle: React.CSSProperties = {
    ...resultStyle,
    backgroundColor: '#f8d7da',
    color: '#721c24'
  };

  const lunarDisplayStyle: React.CSSProperties = {
    marginTop: '30px',
    padding: '15px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    textAlign: 'center',
    width: '100%',
    maxWidth: '350px'
  };

  const lunarTitleStyle: React.CSSProperties = {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#666',
    marginBottom: '10px'
  };

  const dateInfoStyle: React.CSSProperties = {
    fontSize: '1.2rem',
    color: '#333',
    margin: '5px 0'
  };

  // 动画样式
  const keyframes = `
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.03); }
      100% { transform: scale(1); }
    }
  `;

  return (
    <div style={pageStyle}>
      <style>{keyframes}</style>
      <h1 style={headerStyle}>今天是十斋日吗？</h1>
      
      <div style={result.className.includes('yes') ? yesStyle : 
                  result.className.includes('no') ? noStyle : resultStyle}>
        {result.message}
      </div>
      
      <div style={lunarDisplayStyle}>
        <div style={lunarTitleStyle}>当前日期信息</div>
        <div style={dateInfoStyle}>公历: {solarDate.month}月{solarDate.day}日</div>
        <div style={dateInfoStyle}>农历: {lunarDate.month}月{lunarDate.day}日</div>
      </div>
      
      <div style={{ 
        marginTop: '20px', 
        fontSize: '0.85rem', 
        color: '#666',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <p>十斋日是指佛教中每月固定的十天持斋修行的日子</p>
        <p>包括农历每月的一日、八日、十四日、十五日、十八日、廿三日、廿四日、廿八日、廿九日、三十日</p>
      </div>
    </div>
  );
};

export default LunarCalendar;