import React from 'react';
import { KeepAlive } from 'umi';

export default function KeepAlivePage(props: any) {
    return (
        <KeepAlive name={props.route.path} saveScrollPosition='screen'>
            {props.children}
        </KeepAlive>
    )
}
