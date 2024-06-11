import { Button, Html, Heading, Text } from "@react-email/components";
import * as React from "react";

export const EmailVerify = (url) => {
    return (
        <Html>
            <Heading as='h2'>Xác thực tài khoản</Heading>
            <Text>Nhấn vào nút bên dưới để xác nhận email của bạn</Text>
            <Button
                href={url}
                style={{ background: "#000", color: "#fff", padding: "12px 20px" }}
            >
                Nhấn ở đây!
            </Button>
        </Html>
    );
}