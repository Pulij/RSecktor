package com.example.rsecktor;

import android.app.Service;
import android.content.Intent;
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
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private WebSocket webSocket;
    private OkHttpClient client;
    private boolean shouldReconnect = true;

    @RequiresApi(api = Build.VERSION_CODES.O)
    @Override
    public void onCreate() {
        super.onCreate();
        ForegroundService.startForegroundService(this);
        setupWebSocket();
    }

    private void setupWebSocket() {
        client = new OkHttpClient();
        Request request = new Request.Builder().url("ws://192.168.8.104:8080").build();
        WebSocketListener webSocketListener = new WebSocketListener() {
            @Override
            public void onOpen(@NonNull WebSocket webSocket, @NonNull Response response) {
                WebSocketService.this.webSocket = webSocket;
                showToast("WebSocket Connection Opened");
            }

            @Override
            public void onMessage(@NonNull WebSocket webSocket, @NonNull String text) {
                sendBroadcast(text);
            }

            @Override
            public void onMessage(@NonNull WebSocket webSocket, @NonNull ByteString bytes) {
                String hexString = bytes.hex();
                sendBroadcast(hexString);
            }

            @Override
            public void onClosing(@NonNull WebSocket webSocket, int code, @NonNull String reason) {
                webSocket.close(1000, null);
                showToast("WebSocket Closing: " + reason);
            }

            @Override
            public void onFailure(@NonNull WebSocket webSocket, @NonNull Throwable t, @Nullable Response response) {
                showToast("WebSocket Failure: " + t.getMessage());
                if (shouldReconnect) {
                    mainHandler.postDelayed(WebSocketService.this::setupWebSocket, RECONNECT_DELAY);
                }
            }
        };
        client.newWebSocket(request, webSocketListener);
    }

    private void showToast(final String message) {
        mainHandler.post(() -> Toast.makeText(WebSocketService.this, message, Toast.LENGTH_SHORT).show());
    }

    private void sendBroadcast(String message) {
        Intent intent = new Intent("WebSocketMessage");
        intent.putExtra("message", message);
        LocalBroadcastManager.getInstance(this).sendBroadcast(intent);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        shouldReconnect = true;
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        shouldReconnect = false;
        if (webSocket != null) {
            webSocket.close(1000, null);
        }
        if (client != null) {
            client.dispatcher().executorService().shutdown();
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}