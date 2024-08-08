package com.example.rsecktor.Service;

import android.annotation.SuppressLint;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import androidx.core.app.NotificationCompat;

import com.example.rsecktor.MainActivity;
import com.example.rsecktor.R;

public class ForegroundService {

    private static final String CHANNEL_ID = "websocket_service_channel";
    private static final String CHANNEL_NAME = "WebSocket Service Channel";

    @SuppressLint("ForegroundServiceType")
    public static void startForegroundService(Service service) {
        createNotificationChannel(service);
        Intent notificationIntent = new Intent(service, MainActivity.class);
        notificationIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        PendingIntent pendingIntent = PendingIntent.getActivity(service, 0, notificationIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        Notification notification = new NotificationCompat.Builder(service, CHANNEL_ID)
                .setContentTitle("RSecktor Running!!")
                .setContentText("Бот и NodeJS сервер запущены на вашем устройстве :)")
                .setContentIntent(pendingIntent)
                .setSmallIcon(R.drawable.duck)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setOngoing(true)
                .build();

        service.startForeground(1, notification);
    }

    private static void createNotificationChannel(Service service) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    CHANNEL_NAME,
                    NotificationManager.IMPORTANCE_HIGH
            );
            NotificationManager manager = (NotificationManager) service.getSystemService(Context.NOTIFICATION_SERVICE);
            manager.createNotificationChannel(channel);
        }
    }

    public static void stopForegroundService(Context context) {
        if (context instanceof Service) {
            Service service = (Service) context;
            service.stopForeground(true);
            service.stopSelf();
        }
    }
}