import React from 'react';
import {Radio, RadioGroup, Text, Button, Divider} from '@ui-kitten/components';
import Storage from "../../utils/storage"
import AndroidShell from '../../utils/AndroidShell';
import {Toast} from "@ant-design/react-native";
import {style} from "../../style/common";
import {ScrollView,View} from "react-native";
const CONFIG_KEY = "configkey"
const V2RAY_PATH = "/data/adb/xray";
const V2RAY_CONFIG_DIR = V2RAY_PATH+"/configModes"
const CURRENT_CONFIG_ID = "CURRENT-CONFIG-ID"
const V2RAY_CONF_PATH = V2RAY_PATH+"/confs"
const V2RAY_CONFIG_FILE_PATH = V2RAY_CONF_PATH+"/proxy.json"
export const ConfigRadioGroup = (props) => {
    const [radios, setRadios] = React.useState([]);
    const [selectedIndex, setSelectedIndex] = React.useState(-1);
    const [configs,setConfigs] = React.useState([])
    const [currentMode,setCurrentMode] = React.useState({})

    const [reloadFlag,setReloadFlag] = React.useState(props.count)
    const [reloadCount,setReloadCount] = React.useState(0)
    React.useEffect(()=>{
        async function run(){
            const currentMode_temp = await Storage.load({
                key:CURRENT_CONFIG_ID
            }).then(id_path1=>{
                return id_path1;

            }).catch(e=>{
                return {"id":"","path":"无"}
            })
            setCurrentMode(currentMode_temp)
            const modeList = await Storage.getAllDataForKey(CONFIG_KEY).then(list=>{
                return list;
            }).catch(e=>{
                return []
            })
            let radios_configs = modeList
            let tags = []
            let config_data = []
            for(let index =0;index<=radios_configs.length;index++) {
                let id_path = radios_configs[index]
                if(id_path === undefined){
                    continue
                }
                let obj = {"id":id_path['id'],"path":id_path['path']}
                config_data.push(obj)
                if(currentMode_temp['id']===id_path['id']){
                    setSelectedIndex(index)
                }

                let name = String(id_path['path']).replace(V2RAY_CONFIG_DIR+"/","")

                tags.push(
                    <Radio  style={{width:"100%",height:50,borderWidth:2,borderColor:"#eee",backgroundColor:"#efefef"}} key={index}>
                        <View>
                            <Text style={{width:100,height:50,fontSize:25,textAlign:'center',lineHeight:50,position: 'relative',right:-10,top:20}}>{name}</Text>
                            <Button style={{width:80,height:50,position: 'relative',right:-230,top:-27}} onPress={()=>configRemove(obj)}>删除</Button>
                        </View>
                    </Radio>
                )
            }
            setRadios(tags)
            console.log(tags)
            setConfigs(config_data)
            if(reloadCount < 1){
                setReloadCount(reloadCount+1)
            }
        }
        run();
        console.log("重新加载")
    },[props.count,reloadFlag,reloadCount]);

    const radioOnChang =(index)=>{
        console.log("被点击了")
        console.log(index)
        setSelectedIndex(index)
    }

    function configOnChang() {
        console.log(configs)
        console.log(selectedIndex)
        if(configs[selectedIndex] == undefined || configs[selectedIndex] == {}){
            return;
        }

        if(props.serviceStatus){
            Toast.fail({
                content: '先关闭v2ray服务'
            })
            return;
        }

        let changeFileCommand = ["cp",configs[selectedIndex]["path"],V2RAY_CONFIG_FILE_PATH]
        AndroidShell.runShell(changeFileCommand,null,true).then(log=>{
        }).catch(e=>{
        })
        Storage.save({
            key:CURRENT_CONFIG_ID,
            data:configs[selectedIndex]
        })
        setCurrentMode(configs[selectedIndex])
        setReloadFlag(new Date().getTime().toString())
    }
    const configRemove = (id_path) => {

        if(props.serviceStatus){
            Toast.fail({
                content: '先关闭v2ray服务'
            })
            return;
        }
        if(id_path["id"]===currentMode["id"]){
           setCurrentMode({"id":"","path":"无"})

            Storage.remove({
                key: CURRENT_CONFIG_ID
            })
        }

        Storage.remove({
            key: CONFIG_KEY,
            id: id_path['id'],
        })
        AndroidShell.runShell(["rm","-rf",id_path['path']],null,true).then(log=>{
        })
        Toast.success({
            content: '删除成功',

        })

        setReloadFlag(new Date().getTime().toString())
    }
    return (
        <React.Fragment>

            <Text style={style.top}  category='h6'>
                {`当前模式: ${new String(currentMode.path).replace(V2RAY_CONFIG_DIR+"/","")}`}
            </Text>
            <Button style={style.top}  onPress={configOnChang}>切换模式</Button>
            <ScrollView style={{width:'100%',height:'100%'}}>
                <RadioGroup
                    style={{width:'100%',height:'100%',marginLeft:15}}
                    selectedIndex={selectedIndex}
                    onChange={radioOnChang}
                >
                    {radios}
                </RadioGroup>
            </ScrollView>
        </React.Fragment>
    );
};
