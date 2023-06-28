import { Button, Form, Input, InputNumber, message } from "antd";
import React from "react";
import { useAccessStore } from "../store";

export function MyApi() {
  const [form_update] = Form.useForm();
  const [form_init] = Form.useForm();
  const [form_search] = Form.useForm();
  const addOrUpdate = async (res: any) => {
    const response = await fetch("/api/updateDB", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(res),
    });
    const data = await response.json();
    console.log(data);
    if (data.code === 200) {
      message.success("操作成功");
    } else {
      message.error(`操作失败,${data.msg}`);
    }

    form_update.resetFields();
    form_init.resetFields();
  };
  return (
    <div
      style={{
        padding: "50px 10px",
        height: "clac(100vh - 200px)",
        overflow: "auto",
      }}
    >
      <h3>查询次数</h3>
      <Form
        form={form_search}
        name="basic"
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 18 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        onFinish={async (values: any) => {
          const dbStr = await fetch("/api/getNameSpace", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
          });
          const db = await dbStr.json();
          if (!db.data) {
            message.error(`请填写正确的openaiKey,${db.msg}`);
            return;
          }

          if (values.openaiKey) {
            message.info(
              `${values.openaiKey}: 剩余次数: ${db.data?.canUseNum}`,
              5,
            );
          } else {
            message.info(`打开控制台，查看全部数据`, 5);
            console.log(db.data);
          }
        }}
      >
        <Form.Item label="openaiKey" name="openaiKey">
          <Input placeholder="openaiKey，不填查询全部" />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            查询
          </Button>
        </Form.Item>
      </Form>
      <h3>新增次数</h3>
      <Form
        form={form_update}
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        onFinish={(values: any) => {
          addOrUpdate(values);
        }}
      >
        <Form.Item
          label="openaiKey"
          name="openaiKey"
          rules={[{ required: true, message: "请填写openaiKey" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="新增次数"
          name="addNum"
          rules={[{ required: true, message: "请填写" }]}
        >
          <InputNumber placeholder="可填负数" addonAfter="次" />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
      </Form>
      <h3>初始化账号</h3>
      <Form
        form={form_init}
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        onFinish={(values: any) => {
          addOrUpdate(values);
        }}
      >
        <Form.Item
          label="openaiKey"
          name="openaiKey"
          rules={[{ required: true, message: "请填写openaiKey" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="初始化次数"
          name="canUseNum"
          rules={[{ required: true, message: "请填写" }]}
        >
          <InputNumber min={0} addonAfter="次" />
        </Form.Item>

        <Form.Item
          label="管理员密码"
          name="createNew"
          rules={[{ required: true, message: "请填写" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
