import {Alert} from "react-native";
import {Button, Layout, Text, Toggle} from "@ui-kitten/components";
import React from 'react';
import AndroidShell from "../../utils/AndroidShell";
import Storage from "../../utils/storage"
import AddOverflowMenu from "./AddOverflowMenu";
import {ConfigRadioGroup} from "./ConfigRadioGroup";
import axios from "axios";
import {style} from '../../style/common'
import {TopHomeNavigation} from "../../components/TopHomeNavigation";
import {ConfigMenu} from "../../components/ConfigMenu";
const AUTO_START_TPROXY_STORAGE_KEY = "autoStartTproxy"
const V2RAY_SERVICE_NAME = "xray服务";
const V2RAY_TPROXY_NAME = "Tproxy代理";
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
    const [checkedAuto, setCheckedAuto] = React.useState(false);
    const [autoTitle,setAutoTitle] = React.useState(AUTO_TITLE)

    React.useEffect(()=>{

        async function run(){
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
            setCheckedAuto(ret)
            AndroidShell.runShell([V2RAY_SERVICE_PATH,"status"],null,true).then(log=>{

                if(log.indexOf("run") > -1){
                    setCheckedService(true)
                    setServiceMsg(STATUS_START)

                    if(ret){
                        startTproxy();
                    }else{
                        stopTproxy()
                    }

                }

            }).catch(e=>{
            })
        }
        run()

    },[checkedAuto])

    const reloadRadioGroup = (v)=>{
        setCount(v)
    }
    const onCheckedAutoChange = (isChecked) => {
        Storage.save({
            key: AUTO_START_TPROXY_STORAGE_KEY,
            data: isChecked
        }
        )
        setCheckedAuto(isChecked)
    };

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
                    setTimeout(()=>{
                        checkIP();
                    },4500)
                    if (checkedAuto){
                        startTproxy()
                    }
                }else{
                    setCheckedService(false)
                    setServiceMsg(STATUS_ERROR);
                    Alert.alert(START_ERROR)
                }
            });
        }).catch(e=>{
        })
    }
    function stopService(){
        setServiceMsg(STATUS_STOP_TIP)
        const command = [V2RAY_SERVICE_PATH,"stop"];
        AndroidShell.runShell(command,null,true).then(result=>{
            AndroidShell.runShell([V2RAY_SERVICE_PATH,"status"],null,true).then(log=>{
                if(log.indexOf("stop") > -1){
                    setCheckedService(false);
                    setServiceMsg(STATUS_STOP);

                    setTimeout(()=>{
                        checkIP();
                    },1500)
                    if (checkedAuto){
                        stopTproxy();
                    }
                }else{
                    setCheckedService(false)
                    setServiceMsg(STATUS_ERROR);
                    Alert.alert(START_ERROR)
                }
            });
        }).catch(e=>{
        })
    }
//================================================================================


    const onCheckedTProxyChange = (isChecked) => {
        return isChecked ? startTproxy():stopTproxy();

    };
    function startTproxy(){
        if(checkedTProxy){
            return;
        }
        setTproxyMsg(STATUS_START_TIP)

        AndroidShell.runShell([V2RAY_SERVICE_PATH,"status"],null,true).then(log=>{
            if(log.indexOf("run") < 0){
                setCheckedTProxy(false)
                setTproxyMsg(STATUS_STOP);
                Alert.alert(V2RAY_TPROXY_ERROR)
                return;
            }
            const command = [V2RAY_TPROXY_PATH,"enable"];
            AndroidShell.runShell(command,null,true).then(log=>{
                setCheckedTProxy(true)
                setTproxyMsg(STATUS_START)
                return;
            }).catch(e=>{
            })
        });

    }
    function stopTproxy(){
        setTproxyMsg(STATUS_STOP_TIP)

        const command = [V2RAY_TPROXY_PATH,"disable"];
        AndroidShell.runShell(command,null,true).then(result=>{
            setCheckedTProxy(false)
            setTproxyMsg(STATUS_STOP)
        }).catch(e=>{
        })
    }
    const checkIP = () => {
        setCurrentIP("正在获取IP中，请等候...")
        const check_ip_url = "http://ifconfig.me/ip";
        axios.get(check_ip_url,{timeout:8000}).then(response=>{
            setCurrentIP("当前IP："+response.data)
        }).catch(e=>{
            setCurrentIP("获取失败，请检查网络或者配置")
        })
    }
//=================================================================

    return (
        <Layout style={{flex: 1}}>
            {/*顶部导航*/}
            <TopHomeNavigation reloadRadioGroup={reloadRadioGroup.bind(this)}/>
            <Layout style={{flex: 1, alignItems: 'center'}}>
                {/*开启服务按钮*/}
                <Toggle status='success' checked={checkedService} onChange={onCheckedServiceChange}>
                    {`${serviceTitle}: ${serviceMsg}`}
                </Toggle>
                {/*开启tproxy按钮*/}
                <Toggle style={style.top} status='success'  disabled={checkedAuto}  checked={checkedTProxy} onChange={onCheckedTProxyChange}>
                    {`${tproxyTitle}: ${tproxyMsg}`}
                </Toggle>
                {/*自动配置按钮*/}
                <Toggle style={style.top} status='success'
                        checked={checkedAuto} onChange={onCheckedAutoChange}>
                    {autoTitle}
                </Toggle>
                <Layout style={style.top}>
                    <Text>{currentIP}</Text>
                    <Button style={style.top} onPress={checkIP}>获取当前IP</Button>
                </Layout>

                <ConfigRadioGroup style={{width:'100%',height:'100%'}} count={count} serviceStatus={checkedService}></ConfigRadioGroup>
                {/*<ConfigMenu count={count} serviceStatus={checkedService}></ConfigMenu>*/}
            </Layout>
        </Layout>

    )
};

export default HomeScreen
