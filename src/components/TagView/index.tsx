import React from 'react';
import TagsView from './tagsView';
import styles from './index.less';

function TagView(props:any) {
  return (
    <>
    <div className={styles.tag_view}>
      <div className={styles.tabs}>
        <TagsView />
      </div>
    </div>
    </>
  );
}

export default TagView;
