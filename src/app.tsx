import React from 'react';
import type { Settings as LayoutSettings } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import { notification } from 'antd';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { history } from 'umi';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import type { RequestOptionsInit, ResponseError } from 'umi-request';
import defaultSettings from '../config/defaultSettings';
import routes from '../config/routes'


const formatRoutes = (routes: any, name = 'menu') => {
  return routes = routes.map((item: any) => {
    const obj = { ...item }
    if (name && obj.name) {
      obj.name = `${name}.${obj.name}`
    }
    if (obj?.routes?.length) {
      obj.routes = formatRoutes(obj.routes, obj.name)
    }
    return obj
  })
}
const flatten = (data: any) => {
  return data.reduce((arr: any, { routes = [], ...rest }) =>
    arr.concat([{ ...rest }], flatten(routes)), [])
}
console.log(flatten(formatRoutes(JSON.parse(JSON.stringify(routes)))))
const filterRoutes = flatten(formatRoutes(JSON.parse(JSON.stringify(routes)))).filter((f: { layout?: boolean, path?: string }) => f.layout !== false && f.path)
/**
 * 获取用户信息比较慢的时候会展示一个 loading
 */
export const initialStateConfig = {
  loading: <PageLoading />,
};

export function getInitialState(): {
  settings?: LayoutSettings;
  currentUser?: API.CurrentUser;
  routes?: any
} {
  // 如果是登录页面，不执行
  if (history.location.pathname !== '/user/login') {
    const userInfoStore = localStorage.getItem('userInfo')
    const currentUser = userInfoStore ? JSON.parse(userInfoStore) : undefined
    return {
      currentUser,
      settings: defaultSettings,
      routes: filterRoutes
    };
  }
  return {
    settings: defaultSettings,
    routes: filterRoutes
  };
}

export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser?.token && location.pathname !== '/user/login') {
        history.push('/user/login');
      }
    },
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    ...initialState?.settings,
  };
};

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  405: '请求方法不被允许。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

/**
 * 异常处理程序
 */
const errorHandler = (error: ResponseError) => {
  const { response, data } = error;
  console.log(response)
  if (response && response.status) {
    const errorText = codeMessage[response.status] || response.statusText;
    const { status, url } = response;

    notification.error({
      message: `请求错误 ${status}: ${url}`,
      description: errorText,
    });
  }

  if (!response && !data) {
    notification.error({
      description: '您的网络发生异常，无法连接服务器',
      message: '网络异常',
    });
  }

  if (data?.code) {
    notification.error({
      description: data.msg || data.message,
      message: '',
    });
    // token失效
    if ([401].includes(data.code)) {
      localStorage.removeItem('userInfo')
      history.push('/user/login')
    }
  } else if (data?.status) {
    notification.error({
      description: data.msg || data.message,
      message: data.error || data.status,
    });
  }
  throw error;
};
// console.log(process.env.NODE_ENV)

const prefix = process.env.NODE_ENV === 'production' ? window.baseUrl : ''

// 请求拦截
const authHeaderInterceptor = (url: string, options: RequestOptionsInit) => {
  console.log(url)
  const userInfoStore = localStorage.getItem('userInfo')
  const currentUser = userInfoStore ? JSON.parse(userInfoStore) : undefined
  if (process.env.NODE_ENV !== 'production') {
    url = `/api${url}`
  }
  return {
    url: `${url}`,
    options: { ...options, interceptors: true, headers: { ...options.headers, Authorization: currentUser?.token } },
  };
}
// 响应拦截
const responseInterceptors = async (response: Response, options: RequestOptionsInit) => {
  console.log(response)
  const data = await response.clone().json();
  if (data.code !== 0) {
    // success: false 可进入到错误处理 error.data访问
    return { ...data, success: false }
  }
  return response;

}

export const request: RequestConfig = {
  errorHandler,
  // baseUrl
  prefix,
  requestInterceptors: [authHeaderInterceptor],
  responseInterceptors: [responseInterceptors],
};
