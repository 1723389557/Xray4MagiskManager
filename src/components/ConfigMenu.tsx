import React from 'react';
import {Radio, RadioGroup, Text, Button, MenuItem, Menu} from '@ui-kitten/components';
import Storage from "../utils/storage"
import AndroidShell from '../utils/AndroidShell';
import {Toast} from "@ant-design/react-native";
import {style} from "../style/common";
import {ScrollView,View} from "react-native";
const CONFIG_KEY = "configkey"
const V2RAY_PATH = "/data/adb/xray";
const V2RAY_CONFIG_DIR = V2RAY_PATH+"/configModes"
const CURRENT_CONFIG_ID = "CURRENT-CONFIG-ID"
const V2RAY_CONF_PATH = V2RAY_PATH+"/confs"
const V2RAY_CONFIG_FILE_PATH = V2RAY_CONF_PATH+"/proxy.json"
export const ConfigMenu = (props) => {
    const [radios, setRadios] = React.useState([]);
    const [selectedIndex, setSelectedIndex] = React.useState(-1);
    const [configs,setConfigs] = React.useState([])
    const [currentMode,setCurrentMode] = React.useState({})
    //当前模式的名称
    const [currentModeName,setCurrentModeName] = React.useState("")
    const [selectedMenuIndex,setSelectedMenuIndex] = React.useState(-1)


    const [reloadFlag,setReloadFlag] = React.useState(props.count)
    //打开应用时，会出现删除按钮获取不到当前模式的情况，得渲染两次才能正常
    const [reloadCount,setReloadCount] = React.useState(0)
    React.useEffect(()=>{
        async function run(){
            // console.log("重渲染")
            //加载当前配置
            const currentMode_temp = await Storage.load({
                key:CURRENT_CONFIG_ID
            }).then(id_path1=>{
                return id_path1;

            }).catch(e=>{
                return {"id":"","path":"无"}
            })
            //设置当前模式
            // console.log("初始化,当前模式：",currentMode_temp)
            setCurrentMode(currentMode_temp)
            // console.log("获取的当前模式",currentMode)
            //加载所有配置
            const modeList = await Storage.getAllDataForKey(CONFIG_KEY).then(list=>{
                return list;
            }).catch(e=>{
                return []
            })
            // console.log("当前列表：",modeList)
            // console.log("加载配置=================")
            let radios_configs = modeList
            let tags = []
            let config_data = []
            for(let index =0;index<=radios_configs.length;index++) {
                let id_path = radios_configs[index]
                if(id_path === undefined){
                    continue
                }
                //传参给删除方法
                let obj = {"id":id_path['id'],"path":id_path['path']}
                // console.log("原始对象：",id_path)
                // console.log("复制对象",obj)
                config_data.push(obj)
                //设置默认选中的模式
                //如果当前模式的id 和 配置的id相等，设置默认选中
                if(currentMode_temp['id']===id_path['id']){
                    setSelectedIndex(index)
                }

                let name = String(id_path['path']).replace(V2RAY_CONFIG_DIR+"/","")
                //当个模式模块
                tags.push(
                    <MenuItem title={name} key={index}/>
                    // <Radio   key={index}>
                    //     <Text>{name}</Text>
                    //     <Button onPress={()=>configRemove(obj)}>删除</Button>
                    // </Radio>
                )
            }
            //设置配置列表
            setRadios(tags)
            console.log("设置。。。。。。。。。。。。。。。。。。")
            console.log(tags.length)
            //设置原始数据，给删除等共能使用
            setConfigs(config_data)
            if(reloadCount < 1){
                setReloadCount(reloadCount+1)
                // console.log("再次渲染")
            }
        }
        run();

        //所有配置列表
    },[props.count,reloadFlag,reloadCount]);

    const radioOnChang =(index)=>{
        // console.log("切换当前模式：",currentMode)
        setSelectedIndex(index)
    }

    //切换按钮的点击事件
    function configOnChang() {
        //切换xray路径下的文件 cp 配置文件 proxy.conf
        if(configs[selectedIndex] == undefined || configs[selectedIndex] == {}){
            return;
        }

        //v2ray服务开启状态下，不能切换
        if(props.serviceStatus){
            Toast.fail({
                content: '先关闭v2ray服务'
            })
            return;
        }

        //复制文件
        let changeFileCommand = ["cp",configs[selectedIndex]["path"],V2RAY_CONFIG_FILE_PATH]
        console.log(changeFileCommand)
        AndroidShell.runShell(changeFileCommand,null,true).then(log=>{
            console.log("复制日志：",log)
        }).catch(e=>{
            //执行出错的代码处理
        })
        //储存当前模式信息
        Storage.save({
            key:CURRENT_CONFIG_ID,
            data:configs[selectedIndex]
        })
        //切换当前模式显示
        setCurrentMode(configs[selectedIndex])
        //重新加载组件
        setReloadFlag(new Date().getTime().toString())
    }
    const configRemove = (id_path) => {
        //{"id": "1646151884423", "path": "/data/adb/xray/configModes/rtttt.conf"}
        // setReloadFlag("678")
        //删除前，判断是否选中的是当前模式，
        //遇到的问题：打开应用后，currentMode被设置了，但是获取时却是空对象
        console.log("当前模式：",currentMode)
        console.log("删除模式：",id_path)
        console.log("模式是否相等",id_path["id"]===currentMode["id"])
        if(id_path["id"]===currentMode["id"]){
            Toast.fail({
                content: '不能删除当前模式'
            })
            return;
        }
        // 删除储存key
        Storage.remove({
            key: CONFIG_KEY,
            id: id_path['id'],
        })
        //删除文件
        AndroidShell.runShell(["rm","-rf",id_path['path']],null,true).then(log=>{
            // console.log("shell删除命令返回：",log)
        })
        Toast.success({
            content: '删除成功'
        })
        //重新加载组件
        setReloadFlag(new Date().getTime().toString())
    }
    return (
        <React.Fragment>

            <Text style={style.top}  category='h6'>
                {`当前模式: ${new String(currentMode.path).replace(V2RAY_CONFIG_DIR+"/","")}`}
            </Text>
            <Button style={style.top}  onPress={configOnChang}>切换模式</Button>
        {/*<ScrollView  style={{width:'100%',height:'100%'}}>*/}

            <Menu style={{width:'100%',height:'100%'}}
                          selectedIndex={selectedMenuIndex}
                          onSelect={index => setSelectedMenuIndex(index)}
                    >
                        {radios}

            </Menu>
        {/*</ScrollView>*/}


        </React.Fragment>
    );
};
