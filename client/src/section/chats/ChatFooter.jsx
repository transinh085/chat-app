import { Button, Dropdown, Flex, Input } from 'antd';
import { useState } from 'react';
import { IoIosLink } from 'react-icons/io';
import {
  IoDocumentAttachOutline,
  IoHappyOutline,
  IoImageOutline,
  IoMic,
  IoSendSharp
} from 'react-icons/io5';
import { useSocket } from '~/hooks/useSocket';
import { useSelector } from '~/store';
const { TextArea } = Input;
import { CloseOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { setForwardMessage } from '~/store/slices/chatSlice';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

export const ChatFooter = () => {
  const { chat, conversations, forwardMessage } = useSelector(
    (state) => state.chat
  );
  const { emitMessage } = useSocket();

  const [text, setText] = useState('');
  const [isOpenEmojiPicker, setOpenEmojiPicker] = useState(false);

  // handle
  const handleEmojiClick = (emoji) => {
    setText((pre) => pre + emoji.native);
  };

  // handle send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (text.trim()) {
      emitMessage({
        conversation_id: chat.currentConversation.id,
        conversation:
          conversations.find((con) => con.id == chat.currentConversation.id) ==
          null
            ? chat.currentConversation
            : null,
        message: text,
        message_type: 1
      });
      // reset text
      setText('');
    }
  };

  const items = [
    {
      key: '1',
      label: <p>Photo or Video</p>,
      icon: <IoImageOutline size={17} />
    },
    {
      key: '2',
      label: <p>Document</p>,
      icon: <IoDocumentAttachOutline size={16} />
    }
  ];

  return (
    <>
      {forwardMessage && <ForwardMessage {...forwardMessage} />}
      <form onSubmit={(e) => handleSendMessage(e)}>
        <Flex className="relative p-3" align="center" gap="small">
          <Dropdown
            menu={{
              items
            }}
            trigger={['click']}
          >
            <Button
              type="text"
              shape="circle"
              icon={<IoIosLink size={24} />}
              size="large"
              className="text-blue-500 hover:bg-blue-700"
            />
          </Dropdown>

          <Button
            type="text"
            shape="circle"
            icon={<IoHappyOutline size={24} />}
            size="large"
            className=" text-blue-500 hover:bg-blue-700"
            onClick={() => {
              setOpenEmojiPicker(!isOpenEmojiPicker);
            }}
          />
          {isOpenEmojiPicker && (
            <div className="absolute bottom-[60px] left-[60px]">
              <Picker data={data} onEmojiSelect={handleEmojiClick} />
            </div>
          )}
          <TextArea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Aa..."
            className="h-full rounded-3xl bg-neutral-100 border-none focus:shadow-none hover:bg-neutral-100 focus:bg-neutral-100"
            autoSize={{
              maxRows: 3
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          {text.trim() ? (
            <Button
              type="text"
              shape="circle"
              icon={<IoSendSharp size={20} />}
              size="large"
              className="text-blue-500 hover:text-blue-500"
              onClick={(e) => handleSendMessage(e)}
            />
          ) : (
            <Button
              type="text"
              shape="circle"
              icon={<IoMic size={20} />}
              size="large"
              className="text-blue-500 hover:text-blue-500"
              onClick={(e) => handleSendMessage(e)}
            />
          )}
        </Flex>
      </form>
    </>
  );
};

const ForwardMessage = ({ message, sender }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  return (
    <Flex className="w-full px-4 pt-2" justify="space-between">
      <div>
        <p className="text-sm mb-[2px]">
          Replying to{' '}
          {`${sender.id === user.id ? 'yourself' : sender.last_name}`}
        </p>
        <p className="text-xs text-gray-500">{message}</p>
      </div>
      <Button
        type="text"
        shape="circle"
        size="small"
        icon={<CloseOutlined className="text-gray-500" />}
        onClick={() => dispatch(setForwardMessage(null))}
      />
    </Flex>
  );
};
