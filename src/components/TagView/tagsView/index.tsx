import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore
import { Scrollbars } from 'react-custom-scrollbars';
import { history, useAliveController, useModel, useIntl } from 'umi';
import styles from './index.less';

type Route = {
  title: string;
  path: string;
  closable: boolean;
  query?: any;
  state?: any;
};

const TagsView = () => {
  const ScrollbarsRef = useRef<any>();
  const tagContainerRef = useRef<any>();
  const { dropScope, clear, refreshScope, getCachingNodes } = useAliveController()
  const { initialState } = useModel('@@initialState');
  const intl = useIntl();
  const affix = {
    title: 'menu.home',
    path: '/welcome',
    closable: false,
  };

  //设置本地缓存
  const setSessionStorage = (visitedViews: Route[]) => {
    sessionStorage.setItem('visitedViews', JSON.stringify(visitedViews));
  };

  // 读取本地缓存
  const getSessionStorage = () => {
    let str = sessionStorage.getItem('visitedViews');
    if (str) {
      return JSON.parse(str);
    } else {
      return [affix];
    }
  };

  // tabs状态
  const [visitedViews, setVisitedViews] = useState<Route[]>(getSessionStorage());

  //关闭标签
  const closeSelectedTag = (tag: Route) => {
    let active = isActive(tag);
    let arr = getSessionStorage();
    const num = arr.findIndex((item: Route) => item.path === tag.path)
    if (num !== 0) {
      arr.splice(num, 1);
    }
    setVisitedViews(arr);
    setSessionStorage(arr);
    if (active) {
      const { path, query, state } = arr[arr.length - 1];
      const timer = setTimeout(() => {
        clearTimeout(timer)
        history.push({
          pathname: path,
          state,
          query
        });
      }, 10)

      const unlisten = history.listen(() => {
        unlisten()
        const dropTimer = setTimeout(() => {
          clearTimeout(dropTimer)
          dropScope(tag.path)
        }, 10)
      })
    } else {
      dropScope(tag.path)
    }
  };

  // 判断是不是当前页
  const isActive = (item: Route) => {
    return item.path === history.location.pathname
  };

  // 监听路由改变
  // const routerList = JSON.parse(sessionStorage.getItem('routerList') || '[]');
  const onChange = () => {
    const { pathname, query, state } = history.location;
    // 不需要展示的tab页
    const noShowList = initialState?.routes.filter((f: { hiddenTab?: boolean }) => f?.hiddenTab === true).map((item: any) => item.path)
    if (noShowList.includes(pathname)) {
      return;
    }
    let arr = getSessionStorage();
    let num = 0;
    const t = arr.some((t: Route, index: number) => {
      if (t.path === pathname) {
        num = index;
        return true;
      }
      return false;
    });

    // let title = titles[pathname];
    let title = initialState?.routes.find((f: { path: string }) => f.path === pathname)?.name;
    // title && (title = intl.formatMessage({
    //   id: title
    // }))
    // if (JSON.stringify(query) !== '{}') {
    //   title = title.replace('新增', '编辑');
    // }
    const obj = {
      title: title || pathname,
      path: pathname,
      query,
      state,
      closable: true,
    };

    if (!t) {
      // 添加
      arr.push(obj);
      setTimeout(() => {
        ScrollbarsRef?.current?.scrollToRight();
      }, 100);
    } else {
      // 替换(首页不更新)
      if (num !== 0) {
        arr.splice(num, 1, obj);
      }
    }

    setVisitedViews(arr);
    setSessionStorage(arr);
  };

  // 路由改变新增tab
  useEffect(() => {
    onChange()
    return () => {
      if (history.location.pathname === '/user/login') {
        clear()
        sessionStorage.removeItem('visitedViews')
        // setSessionStorage([affix]);
      }
    };
  }, [history.location.pathname]);

  const [selectedTag, setSelectedTag] = useState<Route | null>(null);
  const [left, setLeft] = useState(0);

  // 关闭其他
  const closeOthersTags = (selectedTag: any) => {
    let arr = getSessionStorage();
    const needDelete = arr.filter((item: Route) => item.closable && selectedTag.path !== item.path);
    arr = arr.filter((item: Route) => !item.closable || selectedTag.path === item.path);
    let active = isActive(selectedTag);
    if (!active) {
      const { path, query, state } = selectedTag;
      const timer = setTimeout(() => {
        clearTimeout(timer)
        history.push({
          pathname: path,
          state,
          query
        });
      }, 10)
      const unlisten = history.listen(() => {
        unlisten()
        const dropTimer = setTimeout(() => {
          clearTimeout(dropTimer)
          needDelete.forEach((item: Route) => dropScope(item.path));
        }, 10)
      })
    } else {
      needDelete.forEach((item: Route) => dropScope(item.path));
    }

    setVisitedViews(arr);
    setSessionStorage(arr);
  };

  // 关闭所有
  const closeAllTags = () => {
    setVisitedViews([affix]);
    setSessionStorage([affix]);
    const unlisten = history.listen(() => {
      unlisten()
      const dropTimer = setTimeout(() => {
        clearTimeout(dropTimer)
        clear()
      }, 10)
    })
    const timer = setTimeout(() => {
      clearTimeout(timer)
      history.push("/")
    }, 10)
  };

  // 刷新页面
  const refreshTag = (selectedTag: any) => {
    const cacheTags = getCachingNodes().map(item => item.name)
    if (cacheTags.includes(selectedTag.path)) {
      refreshScope(selectedTag.path)
    } else {
      history.push({
        pathname: '/redirect',
        query: { ...selectedTag.query, redirectPath: selectedTag.path },
        state: selectedTag.state
      })
    }

  }
  const [visible, setVisible] = useState(false);

  // 右键显示三个按钮
  const openMenu = (e: any, t: Route) => {
    const tagContainerEl = tagContainerRef.current
    const offsetLeft = tagContainerEl.getBoundingClientRect().left // container margin left
    const left = e.clientX - offsetLeft + 15 // 15: margin right
    e.preventDefault();
    setSelectedTag(t);
    setLeft(left);
    // setLeft(e.target.offsetLeft);
    setVisible(true);
  };

  // 关闭右键显示的内容
  const closeMenu = () => {
    setVisible(false);
  };

  useEffect(() => {
    if (visible) {
      document.body.addEventListener('click', closeMenu);
    } else {
      document.body.removeEventListener('click', closeMenu);
    }
    return () => {
      document.body.removeEventListener('click', closeMenu);
    }
  }, [visible]);

  return (
    <div ref={tagContainerRef} className={styles.tags_view_container}>
      <div className={styles.tags_view_wrapper}>
        <Scrollbars
          autoHide
          ref={ScrollbarsRef}
          style={{ width: '100%', height: 34, whiteSpace: 'nowrap' }}
        >
          {visitedViews.map((tag) => (
            <a
              className={
                isActive(tag) ? `${styles.tags_view_item} ${styles.active}` : styles.tags_view_item
              }
              key={tag.path}
              onClick={() => {
                history.push({
                  pathname: tag.path,
                  state: tag.query,
                  query: tag.query
                });
              }}
              onContextMenu={() => openMenu(event, tag)}
            >
              {
                intl.formatMessage({
                  id: tag.title,
                  defaultMessage: tag.path
                })
              }
              {tag.closable && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    closeSelectedTag(tag);
                  }}
                  className={styles.el_icon_close}
                >
                  ×
                </span>
              )}
            </a>
          ))}
        </Scrollbars>
      </div>

      {visible && (
        <ul style={{ left: left + 'px', top: '30px' }} className={styles.contextmenu}>
          {selectedTag?.closable && (
            <li onClick={() => closeSelectedTag(selectedTag)}>关闭</li>
          )}
          <li onClick={() => closeOthersTags(selectedTag)}>关闭其他</li>
          <li onClick={() => closeAllTags()}>关闭所有</li>
          {selectedTag?.path === history.location.pathname && <li onClick={() => refreshTag(selectedTag)}>刷新当前页面</li>}
        </ul>
      )}
    </div>
  );
};

export default TagsView;
