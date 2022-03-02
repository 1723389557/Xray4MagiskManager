export class ProxyConfig{
    outbounds(address,port,id,alterId,network,security,allowInsecure=true,sni){
        return {
            "outbounds": [
                {
                    "tag": "proxy",
                    "protocol": "vmess",
                    "settings": {
                        "vnext": [
                            {
                                "address": address,
                                "port": port,
                                "users": [
                                    {
                                        //没有这个
                                        "encryption": "",
                                        //没有这个
                                        "flow": "",
                                        //没有这个
                                        "level": 8,
                                        "id": id,
                                        "alterId": alterId,
                                        "email": "t@t.tt",
                                        "security": "auto"
                                    }
                                ]
                            }
                        ]
                    },
                    "streamSettings": {
                        "network": network,
                        "security": security,
                        "tlsSettings": {
                            "allowInsecure": allowInsecure,
                            "serverName": sni
                        },
                        "tcpSettings": {}
                    },
                    "mux": {
                        "enabled": false,
                        "concurrency": 8
                    }
                }
            ]
        }
    }

    tcpSettings(type,path,Host){
        return {
            "header": {
                "type": type,
                "request": {
                    "version": "1.1",
                    "method": "GET",
                    "path": [
                        path
                    ],
                    "headers": {
                        "Host": [
                            Host
                        ],
                        "User-Agent": [
                            "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.75 Safari/537.36",
                            "Mozilla/5.0 (iPhone; CPU iPhone OS 10_0_2 like Mac OS X) AppleWebKit/601.1 (KHTML, like Gecko) CriOS/53.0.2785.109 Mobile/14A456 Safari/601.1.46"
                        ],
                        "Accept-Encoding": [
                            "gzip, deflate"
                        ],
                        "Connection": [
                            "keep-alive"
                        ],
                        "Pragma": "no-cache"
                    }
                }
            }
        }
    }
}


