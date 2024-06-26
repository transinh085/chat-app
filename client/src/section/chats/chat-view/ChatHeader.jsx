import { Button, Flex, Space, Typography } from 'antd';
import { ExclamationCircleOutlined, PhoneOutlined } from '@ant-design/icons';
import { IoVideocamOutline } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { showMembersGroup, toggleContactInfo } from '~/store/slices/appSlice';
import { CallTypes, ConversationTypes } from '~/utils/enum';
import { v4 as uuidv4 } from 'uuid';
import AvatarImage from '~/section/users/AvatarImage';
import { useSocket } from '~/hooks/useSocket';

export const ChatHeader = () => {
  const dispatch = useDispatch();
  const { emitVideoCall, emitVoiceCall } = useSocket();
  const { contactInfo } = useSelector((state) => state.app);
  const { currentConversation } = useSelector((state) => state.chat.chat);
  const { conversations } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const handleOpenContactInfo = () => {
    dispatch(toggleContactInfo());
  };

  // handle video call
  const handleVideoCall = () => {
    const peer_id = uuidv4();
    const width = 1000;
    const height = 600;
    const leftPos = (window.innerWidth - width) / 2;
    const topPos = (window.innerHeight - height) / 2;
    window.open(
      `/call/${CallTypes.VIDEO}/${currentConversation.id}/${peer_id}`,
      '_blank',
      `width=${width}, height=${height}, left=${leftPos}, top=${topPos}`
    );
    emitVideoCall({
      conversation_id: currentConversation.id,
      peer_id
    });
  };
  const handleVoiceCall = () => {
    const peer_id = uuidv4();
    const width = 1000;
    const height = 600;
    const leftPos = (window.innerWidth - width) / 2;
    const topPos = (window.innerHeight - height) / 2;
    window.open(
      `/call/${CallTypes.AUDIO}/${currentConversation.id}/${peer_id}`,
      '_blank',
      `width=${width}, height=${height}, left=${leftPos}, top=${topPos}`
    );
    emitVoiceCall({
      conversation_id: currentConversation.id,
      peer_id
    });
  };
  const handleOpenSharedMessages = () => dispatch(showMembersGroup());

  const getConversationInfo = () => {
    if (currentConversation.type == ConversationTypes.GROUP) {
      return (
        <span className="cursor-pointer" onClick={handleOpenSharedMessages}>
          {currentConversation.members.length} members
        </span>
      );
    }
    if (currentConversation.type == ConversationTypes.FRIEND) {
      const check = currentConversation.members
        .filter((member) => member.id != user.id)
        .some((mem) => mem['status'] === true);
      return <span>{check ? 'Online' : 'Offline'}</span>;
    }
  };

  return (
    <Flex className="h-[60px] px-4" justify="space-between">
      <Space size="middle">
        <AvatarImage />
        <Flex vertical justify="center">
          <Typography className="font-bold">
            {currentConversation.title}
          </Typography>
          <Typography className="text-xs">{getConversationInfo()}</Typography>
        </Flex>
      </Space>
      <Space size={18}>
        <Button
          type="text"
          shape="circle"
          icon={<IoVideocamOutline size={20} />}
          onClick={handleVideoCall}
          disabled={conversations.some(
            (c) => c.id === currentConversation.id && c.calling
          )}
        />
        <Button
          type="text"
          shape="circle"
          icon={<PhoneOutlined />}
          onClick={handleVoiceCall}
          disabled={conversations.some(
            (c) => c.id === currentConversation.id && c.calling
          )}
        />
        {!contactInfo.open && (
          <Button
            type="text"
            shape="circle"
            icon={<ExclamationCircleOutlined />}
            size={20}
            onClick={handleOpenContactInfo}
          />
        )}
      </Space>
    </Flex>
  );
};
