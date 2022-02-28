
import React from 'react';
import * as eva from '@eva-design/eva';

import {
    ApplicationProvider,
    Layout,
    Toggle,
} from '@ui-kitten/components';
import {Alert} from "react-native";
import AndroidShell from "./utils/AndroidShell";
const V2RAY_SERVICE_NAME = "v2ray服务";
const V2RAY_TPROXY_NAME = "热点代理";
const TPROXY_TEMP_PATH = "/data/v2ray/run/tproxy.temp"
const V2RAY_SERVICE_PATH = "/data/adb/modules/v2ray/scripts/v2ray.service"
const V2RAY_TPROXY_PATH = "/data/adb/modules/v2ray/scripts/v2ray.tproxy"
const STATUS_STOP = "停止"
const STATUS_START = "启动"
const STATUS_ERROR = "出错"
const STATUS_START_TIP = "正在启动，请稍等..."
const STATUS_STOP_TIP = "正在停止，请稍等..."
const START_ERROR = "出错了，请查看log的出错原因"
const V2RAY_TPROXY_ERROR = "请先启动" + V2RAY_SERVICE_NAME
const SHELL_RUN_ERROR = ""
const V2rayServiceToggle = (props) =>{
    const [checked, setChecked] = React.useState(false);
    const [title,setTitle] = React.useState(V2RAY_SERVICE_NAME)
    const [msg, setMsg] = React.useState(STATUS_STOP);
    AndroidShell.runShell([V2RAY_SERVICE_PATH,"status"],null,true).then(log=>{
        if(log.indexOf("run") > -1){
            setChecked(true)
            setMsg(STATUS_START)
        }

    }).catch(e=>{
        //shell命令运行失败的情况
    })
    /**
     * 设置按钮事件
     * @param isChecked
     */
    const onCheckedChange = (isChecked) => {
        if(isChecked === checked){
            return;
        }
        isChecked ? start():stop();
    };
    function start (){
        setMsg(STATUS_START_TIP)
        const command = [V2RAY_SERVICE_PATH,"start"];
        AndroidShell.runShell(command,null,true).then(result=>{
            AndroidShell.runShell([V2RAY_SERVICE_PATH,"status"],null,true).then(log=>{
                if(log.indexOf("running") > -1){
                    setChecked(true);
                    setMsg(STATUS_START);
                }else{
                    //执行了shell运行命令后v2ray.service却没启动的情况
                    setChecked(false)
                    setMsg(STATUS_ERROR);
                    Alert.alert(START_ERROR)
                }
            });
        }).catch(e=>{
            //shell命令运行失败的情况
        })
    }
    function stop(){
        console.log("stop.........")
        setMsg(STATUS_STOP_TIP)
        const command = [V2RAY_SERVICE_PATH,"stop"];
        AndroidShell.runShell(command,null,true).then(result=>{
            AndroidShell.runShell([V2RAY_SERVICE_PATH,"status"],null,true).then(log=>{
                if(log.indexOf("stop") > -1){
                    setChecked(false);
                    setMsg(STATUS_STOP);
                }else{
                    //执行了shell停止命令后v2ray.service却没停止的情况
                    setChecked(false)
                    setMsg(STATUS_ERROR);
                    Alert.alert(START_ERROR)
                }
            });
        }).catch(e=>{
            //shell命令运行失败的情况
        })
    }
    return (
        <Toggle status='success' checked={checked} onChange={onCheckedChange}>
            {`${title}: ${msg}`}
        </Toggle>
    );

}

const V2rayTproxyToggle = (props) =>{
    const [checked, setChecked] = React.useState(false);

    const [title,setTitle] = React.useState(V2RAY_TPROXY_NAME)

    const [msg, setMsg] = React.useState(STATUS_STOP);
    AndroidShell.runShell([V2RAY_SERVICE_PATH,"status"],null,true).then(log=>{
        if(log.indexOf("run") > -1){
            setChecked(true)
            setMsg(STATUS_START)
        }

    }).catch(e=>{
        //shell命令运行失败的情况
    })

    /**
     * 设置按钮事件
     * @param isChecked
     */
    const onCheckedChange = (isChecked) => {
        isChecked ? start():stop();


    };
    function start (){
        setMsg(STATUS_START_TIP)

        AndroidShell.runShell([V2RAY_SERVICE_PATH,"status"],null,true).then(log=>{
            console.log(log)
            if(log.indexOf("run") < 0){
                //执行了shell运行命令后v2ray.service却没启动的情况
                setChecked(false)
                setMsg(STATUS_STOP);
                Alert.alert(V2RAY_TPROXY_ERROR)
                return;
            }
            const command = [V2RAY_TPROXY_PATH,"enable"];
            AndroidShell.runShell(command,null,true).then(log=>{
                let createFileCommand = ["touch",TPROXY_TEMP_PATH]
                AndroidShell.runShell(createFileCommand,null,true);
                setChecked(true)
                setMsg(STATUS_START)

            }).catch(e=>{
                //shell命令运行失败的情况
            })
        });

    }
    function stop(){
        setMsg(STATUS_STOP_TIP)

        const command = [V2RAY_TPROXY_PATH,"disable"];
        AndroidShell.runShell(command,null,true).then(result=>{
            let createFileCommand = ["rm","-rf",TPROXY_TEMP_PATH]
            AndroidShell.runShell(createFileCommand,null,true);
            setChecked(false)
            setMsg(STATUS_STOP)
        }).catch(e=>{
            console.log("出错了")
            //shell命令运行失败的情况
        })
    }
    return (
        <Toggle status='success' checked={checked} onChange={onCheckedChange}>
            {`${title}: ${msg}`}
        </Toggle>
    );

}
const HomeScreen = () => {



    return (

        <Layout style={{flex: 1, alignItems: 'center'}}>
            <V2rayServiceToggle></V2rayServiceToggle>
            <V2rayTproxyToggle></V2rayTproxyToggle>
        </Layout>
    )
};

export default () => (
    <ApplicationProvider {...eva} theme={eva.light}>
        <HomeScreen />
    </ApplicationProvider>
);














