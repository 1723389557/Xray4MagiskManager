import React from 'react';
import {PermissionsAndroid, Platform, StyleSheet} from 'react-native';
import {Button, Layout, MenuItem, OverflowMenu, TopNavigationAction} from '@ui-kitten/components';
import Storage from "../../utils/storage"
import {style} from '../../style/common'

import { Clipboard } from 'react-native';
import {
    Modal,
    Toast,
    Provider,
} from '@ant-design/react-native';
import {Buffer} from 'buffer';
import {ProxyConfig} from '../../assets/json/proxy_config';
import AndroidShell from '../../utils/AndroidShell';
import {AddIcon} from "../../assets/constants/Icons";
const ADD_BUTTON_NAME = "添加节点";
const ADD_VMESS_LINK_MENU_ITEM = "从剪切板导入VMESS链接";
const ADD_CONFIG_MENU_ITEM = "从剪切板导入完整配置";
const V2RAY_PATH = "/data/adb/xray";
const V2RAY_CONFIG_DIR = V2RAY_PATH+"/configModes"

const CONFIG_KEY = "configkey"
export const AddOverflowMenu = (props) => {
    const [selectedIndex, setSelectedIndex] = React.useState(null);
    const [visible, setVisible] = React.useState(false);
    React.useEffect(()=>{
        mkdir()
        requestReadPermission()
    },[])

    const onItemSelect = (index) => {
        // setSelectedIndex(index);
        // console.log(index)
        addConfig()
        //选中菜单
        // if(index["row"] === 0){
        //     //想到有V2rayNG就可以实现很多导入，这个软件就留一个完整配置导入，这个类型的导入泛用性强一点
        //     //添加VMESS链接导入
        //     addVmess()
        // }else if(index["row"] === 1){
        //     addConfig()
        // }
        setVisible(false);
    };
    function mkdir(){
        AndroidShell.runShell(["mkdir","-p",V2RAY_CONFIG_DIR],null,true)
    }
    const renderToggleButton = () => (
        <TopNavigationAction
            icon={AddIcon}
            onPress={() => setVisible(true)}
        />
        // <Button style={style.top}  onPress={() => setVisible(true)}>
        //     {ADD_BUTTON_NAME}
        // </Button>
    );
    async function requestReadPermission(){
        try {
            const os = Platform.OS; // android or ios
            if(os === 'android'){
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        //第一次请求【拒绝】后提示用户你为什么要这个权限
                        'title': '我要读写权限',
                        'message': '没权限我不能工作，同意就好了'
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('true');
                    // 继续运行其它代码
                } else {
                    console.log('error');
                }
            }else{
                console.log('你已获取了读写权限');
                // 继续运行其它代码
            }
        } catch (err) {
            console.log(err.toString());
        }
    }


    const addVmess = async () => {
        let vmessLink = await Clipboard.getString();
        vmessLink = vmessLink.replace("vmess://","");
        let vmess_obj = JSON.parse(new Buffer(vmessLink, 'base64').toString());
        let proxy_config = ProxyConfig.prototype.outbounds(
            vmess_obj['add'],parseInt(vmess_obj['port']),vmess_obj['id'],parseInt(vmess_obj['aid']),
            vmess_obj['net'],vmess_obj['tls'],true,vmess_obj['host']
        );
        if(vmess_obj['type'] != "none" && vmess_obj['type'] != ""){
            let tcpSettings = ProxyConfig.prototype.tcpSettings(vmess_obj['type'],vmess_obj['path'],vmess_obj['host'])
            proxy_config["outbounds"][0]["streamSettings"]["tcpSettings"] = tcpSettings
        }
        console.log("vmess配置文件对象：",JSON.stringify(proxy_config))
        addConfigFile(JSON.stringify(proxy_config));
    }
    const addConfig = async () =>{
        let config = await Clipboard.getString();
        // const outbounds = "{" + config + "}";
        // const outbounds = {"outbounds":JSON.parse(config)["outbounds"]}
        let outbounds = {}
        console.log("导入的剪切板内容：",config)
        //如果导入的不是完整配置，return
        try{
            outbounds = JSON.parse(config)["outbounds"]
        }catch (e){
            Toast.fail({
                content:"剪切板没有完整配置"
            })
            return
        }
        // console.log("没有完整配置的返回值：",outbounds)
        let config_str = '{"outbounds":'+JSON.stringify(outbounds)+"}";
        // console.log("AddOverflowMenu.tsx的addConfig方法：",config_str)
        addConfigFile(config_str)
    }
    //出现对话框，输入名称，用shell添加配置文件
    const addConfigFile = (config_str) =>{
        Modal.prompt(
            '添加名称',
            '',
            (configName)=>{
                async function run(){
                    let save_path = V2RAY_CONFIG_DIR+"/"+configName+".conf"
                    const commant = ["echo","'"+config_str+"'"+">"+save_path]
                    console.log("保存地址：",save_path)

                    let result = await AndroidShell.runShell(commant,null,true).then(log=>{
                        let save_id = new Date().getTime().toString();
                        //添加配置文件成功
                        Storage.save({
                            key: CONFIG_KEY, // 注意:请不要在key中使用_下划线符号!
                            id: save_id, // 注意:请不要在id中使用_下划线符号!
                            data: {
                                "id":save_id,
                                "path":save_path}
                        });
                        return true;
                    })
                    if(result){
                        Toast.success({
                            content: '添加成功'
                        })
                        props.reloadRadioGroup(new Date().getTime().toString())
                    }
                }
                run()
            },
            'default',
            null,
            ['输入名称']
        );
    }
    return (
        <Layout>

                <OverflowMenu
                    anchor={renderToggleButton}
                    visible={visible}
                    selectedIndex={selectedIndex}
                    onSelect={onItemSelect}
                    onBackdropPress={() => setVisible(false)}>
                    {/*<MenuItem title={ADD_VMESS_LINK_MENU_ITEM}/>*/}
                    <MenuItem title={ADD_CONFIG_MENU_ITEM}/>

                </OverflowMenu>
        </Layout>
    );
};



export default AddOverflowMenu;
