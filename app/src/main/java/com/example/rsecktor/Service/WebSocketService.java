package com.example.rsecktor.Service;

import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.WebSocket;
import okhttp3.WebSocketListener;
import okio.ByteString;

public class WebSocketService extends Service {

    private static final int RECONNECT_DELAY = 5000;
    private static final String PREFS_NAME = "MyPrefs";
    private static final String PHONE_PREF_KEY = "phoneEditText";
    private static final String WEBSOCKET_URL = "https://9611ab7d-7f8f-4e75-96ec-7f57a023b4a7-00-zs7a3a68v09t.riker.replit.dev:8080";

    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private WebSocket webSocket;
    private OkHttpClient client;
    private boolean shouldReconnect = true;
    private ConnectivityManager connectivityManager;
    private BroadcastReceiver connectivityReceiver;

    @RequiresApi(api = Build.VERSION_CODES.O)
    @Override
    public void onCreate() {
        super.onCreate();
        connectivityManager = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        registerConnectivityReceiver();
        ForegroundService.startForegroundService(this);
    }

    @RequiresApi(api = Build.VERSION_CODES.M)
    private void setupWebSocket() {
        if (!isNetworkAvailable()) {
            showToast("Аааа, где интернет?? Я не умею работать без него...");
            return;
        }

        client = new OkHttpClient();
        Request request = new Request.Builder().url(WEBSOCKET_URL).build();
        client.newWebSocket(request, createWebSocketListener());
    }

    private WebSocketListener createWebSocketListener() {
        return new WebSocketListener() {
            @Override
            public void onOpen(@NonNull WebSocket webSocket, @NonNull Response response) {
                WebSocketService.this.webSocket = webSocket;
                showToast("WebSocket Connection Opened");

                SharedPreferences sharedPreferences = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
                String phoneNumber = sharedPreferences.getString(PHONE_PREF_KEY, null);
                if (phoneNumber != null) {
                    String sessionJidMessage = "{\"sessionAppJid\": \"" + phoneNumber + "@s.whatsapp.net\"}";
                    webSocket.send(sessionJidMessage);
                }
            }

            @Override
            public void onMessage(@NonNull WebSocket webSocket, @NonNull String text) {
                sendBroadcast(text);
            }

            @Override
            public void onMessage(@NonNull WebSocket webSocket, @NonNull ByteString bytes) {
                sendBroadcast(bytes.hex());
            }

            @Override
            public void onClosing(@NonNull WebSocket webSocket, int code, @NonNull String reason) {
                webSocket.close(1000, null);
                showToast("WebSocket Closing: " + reason);
            }

            @RequiresApi(api = Build.VERSION_CODES.M)
            @Override
            public void onFailure(@NonNull WebSocket webSocket, @NonNull Throwable t, @Nullable Response response) {
                if (shouldReconnect) {
                    if (isNetworkAvailable()) {
                        mainHandler.postDelayed(WebSocketService.this::setupWebSocket, RECONNECT_DELAY);
                    } else {
                        showToast("Аааа, где интернет?? Я не умею работать без него...");
                    }
                }
            }
        };
    }

    @RequiresApi(api = Build.VERSION_CODES.M)
    private boolean isNetworkAvailable() {
        Network network = connectivityManager.getActiveNetwork();
        if (network != null) {
            NetworkCapabilities capabilities = connectivityManager.getNetworkCapabilities(network);
            return capabilities != null && capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET);
        }
        return false;
    }

    private void registerConnectivityReceiver() {
        connectivityReceiver = new BroadcastReceiver() {
            @RequiresApi(api = Build.VERSION_CODES.M)
            @Override
            public void onReceive(Context context, Intent intent) {
                if (isNetworkAvailable() && shouldReconnect) {
                    showToast("Интернет доступен. Запускаю NodeJS сервер с ботом:)");
                    setupWebSocket();
                }
            }
        };

        IntentFilter filter = new IntentFilter(ConnectivityManager.CONNECTIVITY_ACTION);
        registerReceiver(connectivityReceiver, filter);
    }

    private void showToast(final String message) {
        mainHandler.post(() -> Toast.makeText(WebSocketService.this, message, Toast.LENGTH_SHORT).show());
    }

    private void sendBroadcast(String message) {
        Intent intent = new Intent("WebSocketMessage");
        intent.putExtra("message", message);
        LocalBroadcastManager.getInstance(this).sendBroadcast(intent);
    }

    @RequiresApi(api = Build.VERSION_CODES.M)
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        shouldReconnect = true;
        setupWebSocket();
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        shouldReconnect = false;
        if (webSocket != null) webSocket.close(1000, null);
        if (client != null) client.dispatcher().executorService().shutdown();
        unregisterReceiver(connectivityReceiver);
        stopForeground(true);
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}