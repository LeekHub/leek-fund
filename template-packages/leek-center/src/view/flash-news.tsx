import FlashNewsList from '@/components/flash-news-list';
import { NewsTreeData } from '@/constant/news.const';
import { Layout, BackTop } from 'antd';
import { Tree } from 'antd';
import React, { Key, useCallback, useRef, useState } from 'react';
const { Content, Sider } = Layout;

export default function FlashNewsView() {
  const [newsFilter, setNewsFilter] = useState<Record<string, string[]>>(() => {
    const result: any = {};
    NewsTreeData.forEach((d) => {
      result[d.key] = d.children.map((dc) => dc.key.split(':')[1]);
    });
    return result;
  });
  const checkedTempFilter = useRef(newsFilter);

  const onCheck = useCallback(
    (keys: Key[] | { checked: Key[]; halfChecked: Key[] }) => {
      if (!Array.isArray(keys)) return;
      const newFilter: Record<string, string[]> = {};
      keys.forEach((key) => {
        const keyPaths = key.toString().split(':');
        if (keyPaths.length < 2) return;
        newFilter[keyPaths[0]] = newFilter[keyPaths[0]] || [];
        newFilter[keyPaths[0]].push(keyPaths[1]);
      });
      setNewsFilter(newFilter);
      checkedTempFilter.current = newFilter;
    },
    [setNewsFilter, checkedTempFilter]
  );

  const onSelected = useCallback(
    (selectedKeys: Key[]) => {
      if (!selectedKeys.length) {
        setNewsFilter(checkedTempFilter.current);
      } else {
        const key = selectedKeys[0].toString();
        const keyPaths = key.toString().split(':');
        if (keyPaths.length === 1) {
          setNewsFilter({
            [keyPaths[0]]: checkedTempFilter.current[keyPaths[0]],
          });
        } else {
          setNewsFilter({
            [keyPaths[0]]: [keyPaths[1]],
          });
        }
      }
    },
    [checkedTempFilter, setNewsFilter]
  );

  return (
    <Layout>
      <Sider
        style={{
          overflow: 'auto',
          height: 'calc(100vh - 86px)',
          position: 'fixed',
          left: 0,
        }}
      >
        <Tree
          onSelect={onSelected}
          defaultCheckedKeys={NewsTreeData.map((d) => d.key)}
          onCheck={onCheck}
          defaultExpandAll
          checkable
          treeData={NewsTreeData}
        ></Tree>
      </Sider>
      <Content
        id="flashNewsContent"
        style={{
          height: 'calc(100vh - 86px)',
          position: 'fixed',
          left: 220,
          width: 'calc(100vw - 220px)',
          overflowY: 'auto',
        }}
      >
        <BackTop
          target={() => document.getElementById('flashNewsContent') || document}
        />
        <FlashNewsList newsFilter={newsFilter}></FlashNewsList>
      </Content>
    </Layout>
  );
}
