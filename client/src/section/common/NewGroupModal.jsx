import {
  Avatar,
  Button,
  Empty,
  Flex,
  Input,
  Modal,
  Space,
  message
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { IoAdd, IoCloseOutline } from 'react-icons/io5';
import { useDispatch, useSelector } from '~/store';
import { getAllFriends } from '~/store/slices/relationshipSlice';
import Loader from '~/components/Loader';
import useDebounce from '~/hooks/useDebounce';
import { createConversation } from '~/store/slices/contactSlice';

const NewGroupModel = ({ isModalOpen, setIsModalOpen }) => {
  const dispatch = useDispatch();
  const { friends, isLoading } = useSelector((state) => state.relationship);
  const { isLoadingCreateConversation } = useSelector((state) => state.contact);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [search, setSearch] = useState('');
  const searchDebauce = useDebounce(search, 500);
  const [title, setTitle] = useState('');

  // effect
  useEffect(() => {
    dispatch(getAllFriends({ query: searchDebauce, sort: 'asc' }));
  }, [dispatch, searchDebauce]);

  // handle
  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async () => {
    if (title.trim().length == 0) message.error('Please enter a title');
    else if (selectedFriends.length < 2)
      message.error('Please selected friend add group!');
    else {
      await dispatch(
        createConversation({ title: title, participants: selectedFriends })
      );
      setIsModalOpen(false);
    }
  };

  return (
    <Modal
      title="Create group"
      open={isModalOpen}
      onOk={handleSubmit}
      onCancel={handleClose}
      width={500}
      confirmLoading={isLoadingCreateConversation}
    >
      <Input
        name="input-search"
        placeholder="Enter group name"
        variant="filled"
        autoComplete="nope"
        className="h-[40px]"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Flex>
        <Avatar.Group
          maxCount={2}
          maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}
        >
          {friends
            .filter((friend) => selectedFriends.includes(friend.id))
            .map((friend) => (
              <Avatar key={friend.id} src={friend.avatar} />
            ))}
        </Avatar.Group>
      </Flex>
      <Space direction="vertical" className="w-[100%]">
        <Input
          name="input-search"
          placeholder="Search your friends"
          variant="filled"
          prefix={<SearchOutlined />}
          className="mt-2"
          autoComplete="nope"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-2">Friends List</p>
        <div className="h-[240px] overflow-y-auto scrollbar relative">
          {isLoading ? (
            <Loader />
          ) : friends.length ? (
            friends.map((friend) => (
              <FriendItem
                key={friend.id}
                id={friend.id}
                avatar={friend.avatar}
                fullName={`${friend.first_name} ${friend.last_name}`}
                email={friend.email}
                selected={selectedFriends.includes(friend.id) ? true : false}
                handleSelected={setSelectedFriends}
              />
            ))
          ) : (
            <Empty description="Friends List is empty" className="py-4" />
          )}
        </div>
      </Space>
    </Modal>
  );
};

const FriendItem = ({
  id,
  avatar,
  fullName,
  email,
  selected,
  handleSelected
}) => {
  // handle
  const handleSelectedFriend = () => {
    handleSelected((pre) => [...pre, id]);
  };
  const handleRemoveFriend = () => {
    handleSelected((pre) => pre.filter((value) => value != id));
  };
  // render
  return (
    <Flex
      className={`py-2 cursor-pointer rounded`}
      align="center"
      justify="space-between"
    >
      <Space gap={12}>
        <Avatar size="large" src={avatar} />
        <Space direction="vertical" size={0}>
          <p className="m-0">{fullName}</p>
          <p className="m-0 text-xs text-gray-500">{email}</p>
        </Space>
      </Space>
      <Button
        type={`${selected ? 'text' : 'primary'}`}
        size="small"
        shape="circle"
        icon={selected ? <IoCloseOutline size={22} /> : <IoAdd size={22} />}
        onClick={selected ? handleRemoveFriend : handleSelectedFriend}
      />
    </Flex>
  );
};

export default NewGroupModel;
