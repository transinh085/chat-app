import logo_light from '~/assets/icon_app.svg';
import { Flex, Row, Typography, Col, Divider, Space } from 'antd';

import { Link } from 'react-router-dom';
import FormLogin from '~/section/auth/FormLogin';
import GoogleComponent from '~/components/GoogleComponent';
import GithubComponent from '~/components/GithubComponent';

const { Text } = Typography;

const Login = () => {
  return (
    <Row justify="center" className="h-[100vh] bg-neutral-100">
      <Col
        xs={24}
        md={12}
        lg={8}
        className="flex flex-col justify-center items-center"
      >
        <Flex
          gap="small"
          vertical
          justify="center"
          align="center"
          className="w-full mx-auto bg-white rounded-lg py-3 px-8"
        >
          <Link href="/" className="cursor-pointer">
            <img src={logo_light} className="object-fill w-[100px] h-[100px]" />
          </Link>
          <Space direction="vertical">
            <GoogleComponent />
            <GithubComponent />
          </Space>
          <Divider>Or</Divider>
          <Text className="text-2xl font-medium mb-5">
            Sign in to your account
          </Text>
          <FormLogin />
        </Flex>
      </Col>
    </Row>
  );
};

export default Login;
