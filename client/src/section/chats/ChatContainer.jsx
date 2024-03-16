import { Flex, Space, Spin } from 'antd';
import { ChatHeader } from './ChatHeader';
import { ChatFooter } from './ChatFooter';
import { TextMessage } from './MessageTypes';
import { useDispatch, useSelector } from '~/store';
import { useEffect } from 'react';
import { getMessagesOfConversation, setPage } from '~/store/slices/chatSlice';
import InfiniteScroll from 'react-infinite-scroll-component';

const MessageTypes = {
  TEXT: 1,
  IMAGE: 2,
  VIDEO: 3,
  AUDIO: 4,
  FILE: 5
};

export const ChatContainer = () => {
  const dispatch = useDispatch();
  const { chat } = useSelector((state) => state.chat);
  // effect
  useEffect(() => {
    if (chat.currentConversation.id) {
      dispatch(
        getMessagesOfConversation({
          conversation_id: chat.currentConversation.id,
          page: chat.currentPage
        })
      );
    }
  }, [dispatch, chat.currentConversation, chat.currentPage]);

  const fetchMoreData = () => {
    if (chat.currentPage < chat.lastPage) {
      dispatch(setPage(chat.currentPage + 1));
    }
  };

  return (
    <Flex vertical className="h-full flex-1">
      <ChatHeader />
      <div
        className="p-4 overflow-auto custom-scrollbar"
        style={{
          height: 'calc(100vh - 120px)',
          boxShadow:
            '0px 2px 2px -2px rgba(0,0,0,.2), 0px -2px 2px -2px rgba(0,0,0,.2)',
          display: 'flex',
          flexDirection: 'column-reverse'
        }}
        id="scrollableDiv"
      >
        <InfiniteScroll
          dataLength={chat.messages.length}
          next={fetchMoreData}
          className="flex flex-col-reverse"
          inverse={true}
          hasMore={chat.currentPage < chat.lastPage}
          loader={<Spin className="py-2" />}
          scrollableTarget="scrollableDiv"
        >
          <Space direction="vertical">
            {chat.messages.map((message, index) => {
              if (
                index < chat.messages.length - 1 &&
                chat.messages.length >= 2
              ) {
                const currentMessageTime = new Date(message.created_at);
                const nextMessageTime = new Date(
                  chat.messages[index + 1].created_at
                );
                const timeDiff = Math.abs(nextMessageTime - currentMessageTime);
                const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));

                if (hoursDiff >= 1) {
                  return (
                    <TextMessage
                      key={message.id}
                      {...message}
                      created={message.created_at}
                    />
                  );
                }
              }
              switch (message.message_type) {
                case MessageTypes.TEXT:
                  return <TextMessage key={message.id} {...message} />;
                default:
                  return null;
              }
            })}
          </Space>
        </InfiniteScroll>
      </div>
      <ChatFooter />
    </Flex>
  );
};
