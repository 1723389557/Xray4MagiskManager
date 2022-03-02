import {Alert} from "react-native";
import {Button, Layout, Text, Toggle} from "@ui-kitten/components";
import React from 'react';
import AndroidShell from "../../utils/AndroidShell";
import Storage from "../../utils/storage"
import AddOverflowMenu from "./AddOverflowMenu";
import {ConfigRadioGroup} from "./ConfigRadioGroup";
import axios from "axios";
import {style} from '../../style/common'
const AUTO_START_TPROXY_STORAGE_KEY = "autoStartTproxy"
const V2RAY_SERVICE_NAME = "xray服务";
const V2RAY_TPROXY_NAME = "Tproxy代理";
// const TPROXY_TEMP_PATH = "/data/v2ray/run/tproxy.temp"
//v2ray面具模块的配置
// const V2RAY_SERVICE_PATH = "/data/adb/modules/v2ray/scripts/v2ray.service"
// const V2RAY_TPROXY_PATH = "/data/adb/modules/v2ray/scripts/v2ray.tproxy"

//xray面具模块的配置
const V2RAY_SERVICE_PATH = "/data/adb/xray/scripts/xray.service"
const V2RAY_TPROXY_PATH = "/data/adb/xray/scripts/xray.tproxy"
const STATUS_STOP = "停止"
const STATUS_START = "启动"
const STATUS_ERROR = "出错"
const STATUS_START_TIP = "正在启动，请稍等..."
const STATUS_STOP_TIP = "正在停止，请稍等..."
const START_ERROR = "出错了，请查看log的出错原因"
const V2RAY_TPROXY_ERROR = "请先启动" + V2RAY_SERVICE_NAME
const AUTO_TITLE = "自动开启局域网/应用代理"
const AUTO_TIP = "正在设置"
const SHELL_RUN_ERROR = ""
const CONFIG_KEY = "configkey"


const HomeScreen = () => {
    const [checkedService, setCheckedService] = React.useState(false);
    const [serviceTitle,setServiceTitle] = React.useState(V2RAY_SERVICE_NAME)
    const [serviceMsg, setServiceMsg] = React.useState(STATUS_STOP);
    const [currentIP,setCurrentIP] = React.useState("")

    const [checkedTProxy, setCheckedTProxy] = React.useState(false);
    const [tproxyTitle,setTproxyTitle] = React.useState(V2RAY_TPROXY_NAME)
    const [tproxyMsg, setTproxyMsg] = React.useState(STATUS_STOP);
    const [count,setCount] = React.useState("");
    //局域网开关
    const [checkedAuto, setCheckedAuto] = React.useState(false);
    const [autoTitle,setAutoTitle] = React.useState(AUTO_TITLE)
    const [autoMsg, setAutoMsg] = React.useState(AUTO_TIP);

    React.useEffect(()=>{

        async function run(){
            //加载自动开启tproxy按钮的配置
            let ret = await Storage
                .load({
                    key: AUTO_START_TPROXY_STORAGE_KEY,
                    autoSync: false,
                    syncInBackground: false,
                })
                .then(ret => {
                    return ret;
                })
                .catch(err => {
                    return false;
                });
            //设置自动开启tproxy按钮状态
            setCheckedAuto(ret)
            //检查v2ray服务是否运行，是的话设置按钮
            AndroidShell.runShell([V2RAY_SERVICE_PATH,"status"],null,true).then(log=>{

                if(log.indexOf("run") > -1){
                    console.log(V2RAY_SERVICE_NAME+"已运行")
                    //设置服务
                    setCheckedService(true)
                    setServiceMsg(STATUS_START)

                    //有自动开启tproxy的话，开启tproxy
                    if(ret){
                        console.log("自动开启tproxy选项为开，开启tproxy......")
                        startTproxy();
                    }else{
                        //关闭tproxy
                        console.log("自动开启tproxy选项为关，关闭tproxy......")
                        stopTproxy()
                    }

                }

            }).catch(e=>{
                //shell命令运行失败的情况
            })
        }
        run()

    },[checkedAuto])

    const reloadRadioGroup = (v)=>{
        setCount(v)
    }
    const onCheckedAutoChange = (isChecked) => {
        Storage.save({
            key: AUTO_START_TPROXY_STORAGE_KEY, // 注意:请不要在key中使用_下划线符号!
            data: isChecked
        }
        )
        setCheckedAuto(isChecked)
    };

    /**
     * 设置按钮事件
     * @param isChecked
     */
    const onCheckedServiceChange = (isChecked) => {
        if(isChecked === checkedService){
            return;
        }
        isChecked ? startService():stopService();
    };
    function startService (){
        setServiceMsg(STATUS_START_TIP)
        const command = [V2RAY_SERVICE_PATH,"start"];
        AndroidShell.runShell(command,null,true).then(result=>{
            AndroidShell.runShell([V2RAY_SERVICE_PATH,"status"],null,true).then(log=>{
                if(log.indexOf("running") > -1){
                    setCheckedService(true);
                    setServiceMsg(STATUS_START);
                    //设置当前IP
                    setTimeout(()=>{
                        checkIP();
                    },4500)
                    //如果是自动开启tproxy，则开启
                    if (checkedAuto){
                        startTproxy()
                    }
                }else{
                    //执行了shell运行命令后v2ray.service却没启动的情况
                    setCheckedService(false)
                    setServiceMsg(STATUS_ERROR);
                    Alert.alert(START_ERROR)
                }
            });
        }).catch(e=>{
            //shell命令运行失败的情况
        })
    }
    function stopService(){
        console.log("stop.........")
        setServiceMsg(STATUS_STOP_TIP)
        const command = [V2RAY_SERVICE_PATH,"stop"];
        AndroidShell.runShell(command,null,true).then(result=>{
            AndroidShell.runShell([V2RAY_SERVICE_PATH,"status"],null,true).then(log=>{
                if(log.indexOf("stop") > -1){
                    setCheckedService(false);
                    setServiceMsg(STATUS_STOP);
                    //设置当前IP

                    setTimeout(()=>{
                        checkIP();
                    },1500)
                    //如果是自动开启tproxy，则关闭
                    if (checkedAuto){
                        stopTproxy();
                    }
                }else{
                    //执行了shell停止命令后v2ray.service却没停止的情况
                    setCheckedService(false)
                    setServiceMsg(STATUS_ERROR);
                    Alert.alert(START_ERROR)
                }
            });
        }).catch(e=>{
            //shell命令运行失败的情况
        })
    }
//================================================================================



    /**
     * 设置按钮事件
     * @param isChecked
     */
    const onCheckedTProxyChange = (isChecked) => {
        return isChecked ? startTproxy():stopTproxy();

    };
    function startTproxy(){
        if(checkedTProxy){
            return;
        }
        setTproxyMsg(STATUS_START_TIP)

        AndroidShell.runShell([V2RAY_SERVICE_PATH,"status"],null,true).then(log=>{
            console.log(log)
            if(log.indexOf("run") < 0){
                //执行了shell运行命令后v2ray.service却没启动的情况
                setCheckedTProxy(false)
                setTproxyMsg(STATUS_STOP);
                Alert.alert(V2RAY_TPROXY_ERROR)
                return;
            }
            const command = [V2RAY_TPROXY_PATH,"enable"];
            AndroidShell.runShell(command,null,true).then(log=>{
                // let createFileCommand = ["touch",TPROXY_TEMP_PATH]
                // AndroidShell.runShell(createFileCommand,null,true);
                setCheckedTProxy(true)
                setTproxyMsg(STATUS_START)
                return;
            }).catch(e=>{
                //shell命令运行失败的情况
            })
        });

    }
    function stopTproxy(){
        setTproxyMsg(STATUS_STOP_TIP)

        const command = [V2RAY_TPROXY_PATH,"disable"];
        AndroidShell.runShell(command,null,true).then(result=>{
            // let createFileCommand = ["rm","-rf",TPROXY_TEMP_PATH]
            // AndroidShell.runShell(createFileCommand,null,true);
            setCheckedTProxy(false)
            setTproxyMsg(STATUS_STOP)
        }).catch(e=>{
            console.log("出错了")
            //shell命令运行失败的情况
        })
    }
    //v2ray服务开启后查询IP
    const checkIP = () => {
        setCurrentIP("正在获取IP中，请等候...")
        const check_ip_url = "http://ifconfig.me/ip";
        axios.get(check_ip_url,{timeout:8000}).then(response=>{
            console.log("查询IP的返回数据：",response.data)
            setCurrentIP("当前IP："+response.data)
        }).catch(e=>{
            setCurrentIP("获取失败，请检查网络或者配置")
        })
    }
//=================================================================

    return (

        <Layout style={{flex: 1, alignItems: 'center'}}>
            <Toggle status='success' checked={checkedService} onChange={onCheckedServiceChange}>
                {`${serviceTitle}: ${serviceMsg}`}
            </Toggle>
            <Toggle style={style.top} status='success'  disabled={checkedAuto}  checked={checkedTProxy} onChange={onCheckedTProxyChange}>
                {`${tproxyTitle}: ${tproxyMsg}`}
            </Toggle>
            <Toggle style={style.top} status='success'
            checked={checkedAuto} onChange={onCheckedAutoChange}>
                {autoTitle}
            </Toggle>
            <Layout style={style.top}>
                <Text>{currentIP}</Text>
                <Button style={style.top} onPress={checkIP}>获取当前IP</Button>
            </Layout>



            <AddOverflowMenu style={style.top}   reloadRadioGroup={reloadRadioGroup.bind(this)}/>
            <ConfigRadioGroup style={style.top} count={count} serviceStatus={checkedService}></ConfigRadioGroup>
        </Layout>
    )
};

export default HomeScreen
