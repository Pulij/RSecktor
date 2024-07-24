package com.example.rsecktor;

import android.annotation.SuppressLint;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.res.AssetManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.HandlerThread;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Objects;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.FormBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class MainActivity extends AppCompatActivity {

    static {
        System.loadLibrary("native-lib");
        System.loadLibrary("node");
    }

    private static final String PREFS_NAME = "MyPrefs";
    private static final String FIRST_LAUNCH_KEY = "firstLaunch";
    private static final String NODE_PROJECT_DIR = "nodejs-project";
    private static final String NODE_JS_CLIENT = "lib/client.js";
    private static final String NODE_SERVER_URL = "http://localhost:3000/";
    private static boolean startedNodeAlready = false;

    private final BroadcastReceiver messageReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String message = intent.getStringExtra("message");
            if (message != null) {
                TextView systemHealthTextView = findViewById(R.id.systemHealthTextView);
                systemHealthTextView.setText(message);
            }
        }
    };

    @SuppressLint("QueryPermissionsNeeded")
    @RequiresApi(api = Build.VERSION_CODES.O)
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        checkFirstLaunch();
        setContentView(R.layout.activity_main);

        initializeUI();
    }

    @Override
    protected void onResume() {
        super.onResume();
        LocalBroadcastManager.getInstance(this).registerReceiver(messageReceiver, new IntentFilter("WebSocketMessage"));
    }

    @Override
    protected void onPause() {
        super.onPause();
        LocalBroadcastManager.getInstance(this).unregisterReceiver(messageReceiver);
    }

    private void checkFirstLaunch() {
        SharedPreferences sharedPreferences = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        boolean isFirstLaunch = sharedPreferences.getBoolean(FIRST_LAUNCH_KEY, true);
        if (isFirstLaunch) {
            startActivity(new Intent(this, FirstLaunchActivity.class));
            finish();
        }
    }

    private void startWebSocketService() {
        Intent serviceIntent = new Intent(this, WebSocketService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            ContextCompat.startForegroundService(this, serviceIntent);
        } else {
            startService(serviceIntent);
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    private void initializeUI() {
        getWindow().setStatusBarColor(Color.parseColor("#3A2A5A"));

        Button buttonStartNode = findViewById(R.id.startNodeButton);
        Button buttonStopNode = findViewById(R.id.stopNodeButton);

        buttonStartNode.setOnClickListener(v -> startNodeServer());
        buttonStopNode.setOnClickListener(v -> stopNodeServer());
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    private void startNodeServer() {
        if (startedNodeAlready) {
            Toast.makeText(getApplicationContext(), "NodeJS сервер уже запущен", Toast.LENGTH_SHORT).show();
            return;
        }

        startWebSocketService();
        HandlerThread handlerThread = new HandlerThread("NodeHandlerThread");
        handlerThread.start();
        new Handler(handlerThread.getLooper()).post(() -> {
            String nodeDir = getApplicationContext().getFilesDir().getAbsolutePath() + "/" + NODE_PROJECT_DIR;

            if (wasAPKUpdated()) {
                File nodeDirFile = new File(nodeDir);
                if (nodeDirFile.exists()) {
                    deleteFolderRecursively(nodeDirFile);
                }
                copyAssetFolder(getApplicationContext().getAssets(), NODE_PROJECT_DIR, nodeDir);
                saveLastUpdateTime();
            }

            try {
                startNodeWithArguments(new String[]{"node", nodeDir + "/" + NODE_JS_CLIENT});
                runOnUiThread(() -> Toast.makeText(getApplicationContext(), "NodeJS сервер был запущен на " + NODE_SERVER_URL, Toast.LENGTH_SHORT).show());

                // Получение номера телефона из SharedPreferences
                SharedPreferences sharedPreferences = getSharedPreferences("MyPrefs", MODE_PRIVATE);
                String phoneNumber = sharedPreferences.getString("phoneEditText", null);

                // Отправка номера телефона на сервер
                if (phoneNumber != null) {
                    sendPhoneNumberToServer(phoneNumber);
                }
            } catch (Exception e) {
                e.printStackTrace();
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "Ошибка запуска NodeJS сервера", Toast.LENGTH_SHORT).show());
            }
        });

        startedNodeAlready = true;
    }

    private void sendPhoneNumberToServer(String phoneNumber) {
        OkHttpClient client = new OkHttpClient();
        String url = "http://localhost:3000/"; // Замените на ваш реальный URL

        RequestBody body = new FormBody.Builder()
                .add("phoneNumber", phoneNumber)
                .build();

        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                e.printStackTrace();
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "Ошибка отправки номера телефона", Toast.LENGTH_SHORT).show());
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) {
                if (response.isSuccessful()) {
                    runOnUiThread(() -> Toast.makeText(MainActivity.this, "Номер телефона успешно отправлен", Toast.LENGTH_SHORT).show());
                } else {
                    runOnUiThread(() -> Toast.makeText(MainActivity.this, "Ошибка ответа от сервера", Toast.LENGTH_SHORT).show());
                }
            }
        });
    }

    private void stopNodeServer() {
        if (!startedNodeAlready) {
            Toast.makeText(getApplicationContext(), "NodeJS сервер не был запущен", Toast.LENGTH_SHORT).show();
            return;
        }

        finish();
        System.exit(0);
    }

    private static boolean deleteFolderRecursively(File file) {
        try {
            boolean res = true;
            for (File childFile : Objects.requireNonNull(file.listFiles())) {
                if (childFile.isDirectory()) {
                    res &= deleteFolderRecursively(childFile);
                } else {
                    res &= childFile.delete();
                }
            }
            res &= file.delete();
            return res;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    private static boolean copyAssetFolder(AssetManager assetManager, String fromAssetPath, String toPath) {
        try {
            String[] files = assetManager.list(fromAssetPath);
            boolean res = true;

            assert files != null;
            if (files.length == 0) {
                res &= copyAsset(assetManager, fromAssetPath, toPath);
            } else {
                new File(toPath).mkdirs();
                for (String file : files)
                    res &= copyAssetFolder(assetManager, fromAssetPath + "/" + file, toPath + "/" + file);
            }
            return res;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    private static boolean copyAsset(AssetManager assetManager, String fromAssetPath, String toPath) {
        InputStream in;
        OutputStream out;
        try {
            in = assetManager.open(fromAssetPath);
            new File(toPath).createNewFile();
            out = Files.newOutputStream(Paths.get(toPath));
            copyFile(in, out);
            in.close();
            out.flush();
            out.close();
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    private static void copyFile(InputStream in, OutputStream out) throws IOException {
        byte[] buffer = new byte[1024];
        int read;
        while ((read = in.read(buffer)) != -1) {
            out.write(buffer, 0, read);
        }
    }

    private boolean wasAPKUpdated() {
        SharedPreferences prefs = getApplicationContext().getSharedPreferences("NODEJS_MOBILE_PREFS", Context.MODE_PRIVATE);
        long previousLastUpdateTime = prefs.getLong("NODEJS_MOBILE_APK_LastUpdateTime", 0);
        long lastUpdateTime = 1;
        try {
            PackageInfo packageInfo = getApplicationContext().getPackageManager().getPackageInfo(getApplicationContext().getPackageName(), 0);
            lastUpdateTime = packageInfo.lastUpdateTime;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
        return (lastUpdateTime != previousLastUpdateTime);
    }

    private void saveLastUpdateTime() {
        long lastUpdateTime = 1;
        try {
            PackageInfo packageInfo = getApplicationContext().getPackageManager().getPackageInfo(getApplicationContext().getPackageName(), 0);
            lastUpdateTime = packageInfo.lastUpdateTime;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
        SharedPreferences prefs = getApplicationContext().getSharedPreferences("NODEJS_MOBILE_PREFS", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putLong("NODEJS_MOBILE_APK_LastUpdateTime", lastUpdateTime);
        editor.apply();
    }

    public native Integer startNodeWithArguments(String[] arguments);
}