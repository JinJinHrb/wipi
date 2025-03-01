import React, { useCallback, useState, useContext, useEffect } from 'react';
import { Row, Col, Form, Button, Input, Icon } from 'antd';
import Router from 'next/router';
import Link from 'next/link';
import { Helmet } from 'react-helmet';
import { Seo } from '@/components/Seo';
import { FormComponentProps } from 'antd/es/form';
import { UserProvider } from '@/providers/user';
import { GlobalContext } from '@/context/global';
import { Svg } from '@/assets/LoginSvg';
import style from './index.module.scss';

type ILoginProps = FormComponentProps;

const _Login: React.FC<ILoginProps> = ({ form }) => {
  const { getFieldDecorator } = form;
  const globalContext = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.clear();
  }, []);

  const submit = useCallback((e) => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        setLoading(true);
        UserProvider.login(values)
          .then((userInfo) => {
            localStorage.setItem('token', userInfo.token);
            setLoading(false);
            globalContext.setUser(userInfo);
            globalContext.getSetting();
            Router.push((Router.query.redirect as string) || '/');
          })
          .catch((e) => setLoading(false));
      }
    });
  }, []);

  return (
    <div className={style.wrapper}>
      <Seo />
      <Helmet>
        <title>系统登录</title>
      </Helmet>
      <Row className={style.container}>
        <Col xs={0} sm={0} md={12}>
          <Svg />
        </Col>
        <Col xs={24} sm={24} md={12}>
          <div style={{ width: '100%' }}>
            <h2>系统登录</h2>
            <Form onSubmit={submit}>
              <Form.Item label="账户">
                {getFieldDecorator('name', {
                  rules: [{ required: true, message: '请输入用户名！' }],
                })(
                  <Input
                    prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                    size="large"
                    placeholder="请输入用户名"
                  />
                )}
              </Form.Item>
              <Form.Item label="密码">
                {getFieldDecorator('password', {
                  rules: [{ required: true, message: '请输入密码！' }],
                })(
                  <Input
                    prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                    type="password"
                    size="large"
                    placeholder="请输入密码"
                  />
                )}
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  style={{ width: '100%' }}
                  loading={loading}
                  disabled={loading}
                >
                  登录
                </Button>
                Or{' '}
                <Link href="/register">
                  <a>注册用户</a>
                </Link>
              </Form.Item>
            </Form>
          </div>
        </Col>
      </Row>
      <ul className={style.bubbles}>
        {Array.from({ length: 10 }).map((_, idx) => (
          <li key={idx}></li>
        ))}
      </ul>
    </div>
  );
};

export default Form.create<ILoginProps>({ name: 'login' })(_Login);
