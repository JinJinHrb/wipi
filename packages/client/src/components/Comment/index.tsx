import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Icon, Avatar, Pagination } from 'antd';
import cls from 'classnames';
import { CommentProvider } from '@/providers/comment';
import { LocaleTime } from '@/components/LocaleTime';
import { MarkdownReader } from '@/components/MarkdownReader';
import { getRandomColor } from '@/utils';
import { Editor } from './Editor';
import style from './index.module.scss';

export const CommentItem = ({
  comment,
  parentComment,
  hostId,
  onReply = () => {},
  subComments = [],
  isChildren = false,
}) => {
  const [visible, setVisible] = useState(false);
  const [replyComment, setReplyComment] = useState(null);

  return (
    <div className={style.commentItem}>
      <header>
        <Avatar
          size={isChildren ? 24 : 32}
          style={{ backgroundColor: getRandomColor(comment.name) }}
        >
          {('' + comment.name).charAt(0).toUpperCase()}
        </Avatar>
        <span className={style.info}>
          <strong>{comment.name}</strong>
          {comment.replyUserName ? (
            <>
              <span>回复</span>
              <strong className={style.replyUser}>{comment.replyUserName}</strong>
            </>
          ) : null}
        </span>
      </header>
      <main style={{ paddingLeft: isChildren ? 24 + 10 : 32 + 10 }}>
        <div className={style.content}>
          <MarkdownReader content={comment.html || comment.content} />
        </div>
        <div className={style.meta}>
          {comment.userAgent ? <span>{comment.userAgent}</span> : null}
          <span>
            <LocaleTime date={comment.createAt} timeago />
          </span>
          <span
            className={style.reply}
            onClick={() => {
              if (isChildren) {
                onReply();
              } else {
                setReplyComment(comment);
              }

              setVisible(true);
            }}
          >
            <Icon type="message" />
            回复
          </span>
        </div>
        {subComments && subComments.length ? (
          <div className={style.subComments}>
            {subComments.map((subComment) => (
              <CommentItem
                key={subComment.id}
                comment={subComment}
                parentComment={comment}
                hostId={hostId}
                onReply={() => {
                  setReplyComment(subComment);
                  setVisible(true);
                }}
                isChildren={true}
              />
            ))}
          </div>
        ) : null}
      </main>
      {isChildren ? null : (
        <div
          className={cls(style.editorContainer, visible ? style.isActive : false)}
          style={{ paddingLeft: isChildren ? 24 + 10 : 32 + 10 }}
        >
          <Editor
            hostId={hostId}
            parentComment={comment}
            replyComment={replyComment}
            onSuccess={() => setReplyComment(null)}
            renderFooter={({ loading, disabled, submit }) => {
              return [
                <Button
                  key="collapse"
                  style={{ marginRight: 16 }}
                  onClick={() => setVisible(false)}
                >
                  收起
                </Button>,
                <Button
                  key="comment"
                  loading={loading}
                  onClick={submit}
                  type="primary"
                  disabled={disabled}
                >
                  评论
                </Button>,
              ];
            }}
          />
        </div>
      )}
    </div>
  );
};

interface IProps {
  hostId: string;
}

export const COMMENT_DOM_ID = `js-comment-id`;

export const Comment: React.FC<IProps> = ({ hostId: articleId }) => {
  const ref = useRef(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [comments, setComments] = useState<IComment[]>([]);
  const [loading, setLoading] = useState(false);

  const getComments = useCallback(
    (page, pageSize, loadMore = false) => {
      setLoading(true);
      return CommentProvider.getArticleComments(articleId, {
        page,
        pageSize,
      })
        .then((res) => {
          setComments(res[0]);
          setTotal(res[1]);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
        });
    },
    [articleId]
  );

  const loadMore = (page) => {
    setPage(page);
    getComments(page, pageSize, true).then(() => {
      Promise.resolve().then(() => {
        ref.current.scrollIntoView();
      });
    });
  };

  useEffect(() => {
    setPage(1);
    getComments(1, pageSize, false);
  }, [articleId]);

  return (
    <div className={style.commentWrapper} id={COMMENT_DOM_ID} ref={ref}>
      <Editor hostId={articleId} parentComment={null} replyComment={null} />
      <div className={style.commentContainer}>
        {comments.map((comment, i) => {
          return (
            <CommentItem
              key={comment.id}
              comment={comment}
              parentComment={[]}
              subComments={comment.children}
              hostId={articleId}
            />
          );
        })}
      </div>
      <div className={style.pagination} style={{ padding: loading || total > 0 ? '16px 0' : 0 }}>
        {!loading && total > 0 ? (
          <Pagination
            size="small"
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={loadMore}
          />
        ) : loading ? (
          <Button type="primary" loading={true}>
            加载中
          </Button>
        ) : null}
      </div>
    </div>
  );
};
