package com.v2raygui.shell;

import static android.content.ContentValues.TAG;

import android.os.Build;
import android.util.Log;

import androidx.annotation.RequiresApi;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;


public class AndroidShellModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public AndroidShellModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "AndroidShell";
    }
   @ReactMethod
   public void runShell(ReadableArray command, String dir, Boolean isRoot, Promise promise){
        new Thread(new Runnable() {
            @RequiresApi(api = Build.VERSION_CODES.N)
            @Override
            public void run() {
                WritableMap map = Arguments.createMap();
                List commodArrayList = command.toArrayList().stream()

                        .map(object -> Objects.toString(object, null))

                        .collect(Collectors.toList());
                System.out.println(commodArrayList);
                StringBuffer sb = new StringBuffer("");
                InputStream inputStream = null;

                if(isRoot){
                    commodArrayList.add(0,"su");
                    commodArrayList.add(1,"-c");
                }
                try {
                    ProcessBuilder processBuilder = new ProcessBuilder(commodArrayList);
                    if (dir != null && !"".equals(dir)){
                        processBuilder.directory(new File(dir));
                    }
                    //把错误信息与成功信息合并输出
                    processBuilder.redirectErrorStream(true);
                    inputStream = processBuilder.start().getInputStream();
                    BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
                    String line;
                    while ((line = bufferedReader.readLine()) != null){
                        sb.append(line);
                    }
                    promise.resolve(sb.toString());
                } catch (IOException e) {
                    promise.reject(sb.toString());
                }finally {
                    if (inputStream != null){
                        try {
                            inputStream.close();
                        } catch (IOException e) {
                            e.printStackTrace();
                        }

                    }
                }
            }
        }).start();

   }
    @ReactMethod
    public void executeCommand(final String command, final Callback callback) {
    // To avoid UI freezes run in thread
        new Thread(new Runnable() {
            public void run() {
                OutputStream out = null;
                InputStream in = null;
                try {
                    // Send script into runtime process
//                    Process child = Runtime.getRuntime().exec(command);
                    //v2ray.service status
                    String[] arr = {"su", "/data/adb/modules/v2ray/scripts/v2ray.service status > log.txt && cat log.txt"} ;
                    Process child = Runtime.getRuntime().exec(arr);

                    // Get input and output streams
                    out = child.getOutputStream();
                    in = child.getInputStream();
                    // Input stream can return anything
                    BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(in));
                    String line;
                    String result = "";
                    while ((line = bufferedReader.readLine()) != null){
                        result += line+"\n";
                    }


                    Log.i(TAG, "测试："+result);

                    // Handle input stream returned message
                    callback.invoke(result);
                } catch (IOException e) {
                    e.printStackTrace();
                } finally {
                    if (in != null) {
                        try {
                            in.close();
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    }
                    if (out != null) {
                        try {
                            out.flush();
                            out.close();
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    }
                }
            }
        }).start();
    }
}
