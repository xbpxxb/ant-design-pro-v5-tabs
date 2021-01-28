import React, {useEffect} from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { history } from 'umi';

export default (): React.ReactNode => {
  const { query, state } =  history.location
  const queryStr = JSON.stringify(query)
  const stateStr = JSON.stringify(state)
  useEffect(() => {
    // EventEmitter.on('routerChange', onChange);
    console.log('render')
  }, []);
  return (
    <PageHeaderWrapper>
      详情页面 {queryStr}
      <p>{stateStr}</p>
    </PageHeaderWrapper>
  );
};
