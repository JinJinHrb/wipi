import React, { useState, useCallback, useEffect, useRef } from 'react';
import cls from 'classnames';
import Router from 'next/router';
import { Spin, Input, Icon } from 'antd';
import Link from 'next/link';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { SearchProvider } from '@/providers/search';
import { TagProvider } from '@/providers/tag';
import { Tags } from '@components/Tags';
import style from './index.module.scss';

const { Search: AntdSearch } = Input;

interface IProps {
  visible: boolean;
  onClose: () => void;
}

export const Search: React.FC<IProps> = ({ visible = true, onClose }) => {
  const ref = useRef(null);
  const container = useRef(null);
  const [tags, setTags] = useState([]);
  const [articles, setArticles] = useState<IArticle[]>([]);
  const [loading, setLoading] = useState(false);

  const close = useCallback(() => {
    document.body.style.overflow = '';
    onClose();
  }, []);

  const getArticles = useCallback((keyword) => {
    if (!keyword) {
      setArticles([]);
      return;
    }
    setLoading(true);
    SearchProvider.searchArticles(keyword)
      .then((res) => {
        const ret = res.filter((r) => r.status === 'publish' && !r.needPassword);
        setArticles(ret);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    TagProvider.getTags({ articleStatus: 'publish' }).then((res) => {
      setTags(res);
    });
  }, []);

  useEffect(() => {
    const listener = (e) => {
      const el = container.current;
      if (el && !el.contains(e.target)) {
        close();
      }
    };
    const listener2 = (e) => {
      // ESC
      if (e.which === 27 || e.keyCode === 27) {
        close();
      }
    };
    document.body.addEventListener('click', listener);
    document.body.addEventListener('touchend', listener);
    document.body.addEventListener('keydown', listener2);

    return () => {
      document.body.removeEventListener('click', listener);
      document.body.removeEventListener('touchend', listener);
      document.body.removeEventListener('keydown', listener2);
    };
  }, []);

  useEffect(() => {
    Router.events.on('routeChangeStart', close);

    return () => {
      Router.events.off('routeChangeStart', close);
    };
  }, []);

  useEffect(() => {
    if (!visible || !ref.current) {
      return;
    }
    ref.current.focus();
    document.body.style.overflow = 'hidden';
  }, [visible]);

  return (
    <>
      {visible ? (
        <div className={cls(style.wrapper)} ref={container}>
          <div className={cls('container', style.innerWrapper)}>
            <Icon className={style.closeBtn} type="close" onClick={close} />
            <AntdSearch
              ref={ref}
              size="large"
              placeholder="输入关键字，搜索文章"
              onSearch={getArticles}
              style={{ width: '100%' }}
            />
            <div className={style.tagWrapper}>
              <Tags tags={tags} needTitle={false} style={{ marginBottom: 0, boxShadow: 'none' }} />
            </div>
            {loading && (
              <div className={style.loading}>
                <Spin tip="正在搜索中..." spinning={true} />
              </div>
            )}
            <div
              className={cls(
                style.articleWrapper,
                articles && articles.length ? style.active : false
              )}
            >
              <TransitionGroup className="todo-list">
                {articles.map((article, idx) => {
                  return (
                    <CSSTransition key={article.id} timeout={300} classNames="item">
                      <Link
                        key={article.id}
                        href={`/article/[id]`}
                        as={`/article/${article.id}`}
                        scroll={false}
                      >
                        <a className={style.articleListItem}>
                          <span className={style.title}>{article.title}</span>
                        </a>
                      </Link>
                    </CSSTransition>
                  );
                })}
              </TransitionGroup>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
