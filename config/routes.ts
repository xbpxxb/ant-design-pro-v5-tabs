/**
 * 高亮菜单，比如进入详情页面高亮列表页parentKeys: ['/list']
 * 多级菜单component同时使用，需要在父级添加{props.children}，类似vue的router-view，否则只会渲染父级
 * 路由权限access，在src/access.ts配置
 * 路由重定向示例{
    path: "/order",
    name: "order",
    icon: "crown",
    routes: [
      { path: "/", redirect: "/order/list" },
      {
        path: '/order',//菜单分割，切换顶部菜单自动选中子菜单
        redirect: '/order/list',
      },
      {
        path: "/order/list",
        name: "list",
        icon: "smile",
        component: "./order/list",
      },
    ],
  }
  * hideInMenu: true, //隐藏菜单
  * 缓存页面：wrappers: ['@/components/KeepAlive']，默认不缓存，详情页面只能打开一个，详情页请不要缓存
  * 隐藏tab: hiddenTab: true，默认不隐藏
 */
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './User/login',
          },
        ],
      },
    ],
  },
  {
    path: '/welcome',
    name: 'welcome',
    icon: 'smile',
    component: './Welcome',
  },
  {
    path: '/admin',
    name: 'admin',
    icon: 'crown',
    access: 'canAdmin',
    component: './Admin',
    wrappers: ['@/components/KeepAlive'],
    routes: [
      {
        path: '/admin/sub-page',
        name: 'sub-page',
        icon: 'smile',
        component: './Welcome',
        wrappers: ['@/components/KeepAlive'],
      },
    ],
  },
  {
    path: '/system',
    name: 'system',
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      {
        path: '/system',
        redirect:'/system/user'
      },
      {
        path: '/system/user',
        name: 'permissions',
        hiddenTab: true,
        icon: 'smile',
        routes: [
          {
            path: '/system/user',
            redirect:'/system/user/permission'
          },
          {
            path: '/system/user/permission',
            name: 'user',
            icon: 'smile',
            component: './SystemManage/UserPermission',
            wrappers: ['@/components/KeepAlive'],
          },
          {

            path: '/system/user/role',
            name: 'role',
            icon: 'smile',
            component: './SystemManage/Role',
            wrappers: ['@/components/KeepAlive'],
          },
        ],
      },
    ],
  },
  {
    name: 'list.table-list',
    icon: 'table',
    path: '/list',
    component: './TableList',
    wrappers: ['@/components/KeepAlive'],
  },
  {
    name: 'test.detail',
    hideInMenu: true,
    path: '/detail',
    component: './detail',
    parentKeys: ['/list'],
  },
  {
    // 刷新页面用
    path: '/redirect',
    hiddenTab: true,
    component: './redirect',
  },
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    component: './404',
  },
];
