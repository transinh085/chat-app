import { Avatar, Button, Col, Flex } from 'antd';
import { IoChatbubblesOutline } from 'react-icons/io5';

const FriendRequestItem = ({
  avatar,
  fullName,
  invitationMessage,
  time,
  isSended = true
}) => {
  // handle
  function timeFormat(inputTime) {
    const time = new Date(inputTime);

    const day = time.getDate();
    const month = time.getMonth() + 1;
    const year = time.getFullYear();

    const timeFormatted = `${day < 10 ? '0' : ''}${month}/${
      year < 10 ? '0' : ''
    }${month}/${year}`;

    return timeFormatted;
  }
  return (
    <Col sm={12} md={8} lg={8} xl={6}>
      <div className="bg-white p-4 rounded-md">
        <Flex align="center" justify="space-between">
          <Flex align="center" gap={10}>
            <Avatar size={40} src={avatar} />
            <div>
              <p className="my-1 font-semibold">{fullName}</p>
              <p className="m-0 text-[12px]">{timeFormat(time)}</p>
            </div>
          </Flex>
          <Button
            type="text"
            shape="circle"
            icon={<IoChatbubblesOutline size={20} />}
          />
        </Flex>
        <div className="h-[60px] p-2  bg-gray-50 my-4 rounded border-[1px] border-gray-200 border-solid">
          <p className="m-0 line-clamp-2 text-ellipsis overflow-hidden">
            {invitationMessage}
          </p>
        </div>
        <Flex align="center" justify="space-between">
          {isSended ? (
            <Button type="text" className="w-[100%] bg-neutral-200">
              Cancel
            </Button>
          ) : (
            <>
              <Button type="text" className="w-[48%] bg-neutral-200">
                Reject
              </Button>
              <Button type="primary" className="w-[48%]">
                Accept
              </Button>
            </>
          )}
        </Flex>
      </div>
    </Col>
  );
};

export default FriendRequestItem;
