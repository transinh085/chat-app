import { faker } from '@faker-js/faker';
import {
  Avatar,
  Button,
  Dropdown,
  Flex,
  Space,
  Typography,
  message
} from 'antd';
import { IoEllipsisHorizontal } from 'react-icons/io5';

export const FriendItem = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const handleDeleteFriend = () => {
    // logic here
    messageApi.open({
      type: 'success',
      content: 'Delete friend successfully!'
    });
  };

  const items = [
    {
      key: '1',
      label: <p className="m-0 p-1">Chat now</p>
    },
    {
      key: '2',
      label: <p className="m-0 p-1">View details</p>
    },
    {
      key: '3',
      label: (
        <p onClick={handleDeleteFriend} className="text-red-500 m-0 p-1">
          Delete
        </p>
      )
    }
  ];

  return (
    <Flex
      align="center"
      justify="space-between"
      className="w-full py-2 px-4 hover:bg-blue-50 cursor-pointer rounded"
    >
      {contextHolder}
      <Space align="center" className="font-semibold">
        <Avatar size={40} src={faker.image.avatarLegacy()} />
        <Typography>{faker.person.fullName()}</Typography>
      </Space>
      <Dropdown menu={{ items }} placement="bottomLeft">
        <Button
          type="text"
          icon={<IoEllipsisHorizontal />}
          size="middle"
          className="text-gray-500"
        />
      </Dropdown>
    </Flex>
  );
};
