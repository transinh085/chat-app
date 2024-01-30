import { Avatar, Badge, Button, Flex, Space, Typography } from 'antd';
import { SearchOutlined, ExclamationCircleOutlined, PhoneOutlined } from '@ant-design/icons';
import { IoVideocamOutline } from 'react-icons/io5';
import { faker } from '@faker-js/faker';
import { useDispatch, useSelector } from 'react-redux';
import { toggleContactInfo } from '~/store/slices/appSlice';
export const ChatHeader = () => {
  const dispatch = useDispatch();
  const { contactInfo } = useSelector((state) => state.app);
  // handle
  const handleOpenContactInfo = () => {
    dispatch(toggleContactInfo());
  };
  return (
    <Flex className="h-[60px] px-4" justify="space-between">
      <Space size={18}>
        <Badge size="default" dot={true} color="green" offset={[0, 28]}>
          <Avatar className="bg-[#fde3cf] text-[#f56a00]">
            {faker.person.fullName()[0].toUpperCase()}
          </Avatar>
        </Badge>
        <Flex vertical justify="center">
          <Typography className="font-bold">{faker.person.fullName()}</Typography>
          <Typography className="text-[12px]">Online</Typography>
        </Flex>
      </Space>
      <Space size={18}>
        <Button type="text" shape="circle" icon={<IoVideocamOutline size={20} />} />
        <Button type="text" shape="circle" icon={<PhoneOutlined />} />
        <Button type="text" shape="circle" icon={<SearchOutlined />} />
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
