package com.example.rsecktor;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

@SuppressLint("CustomSplashScreen")
public class FirstLaunchActivity extends AppCompatActivity {
    private static final int REQUEST_NOTIFICATION_PERMISSION = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Проверка и запрос разрешения на уведомления
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQUEST_NOTIFICATION_PERMISSION);
            }
        }

        getWindow().setStatusBarColor(Color.parseColor("#3A2A5A"));
        setContentView(R.layout.first_launch);

        @SuppressLint({"MissingInflatedId", "LocalSuppress"}) Button buttonContinue = findViewById(R.id.buttonContinue);
        buttonContinue.setOnClickListener(v -> {
            SharedPreferences sharedPreferences = getSharedPreferences("MyPrefs", MODE_PRIVATE);
            SharedPreferences.Editor editor = sharedPreferences.edit();
            editor.putBoolean("firstLaunch", false);
            editor.apply();


            String phone = sharedPreferences.getString("phoneEditText", null);
            Intent intent;
            if (phone == null) {
                intent = new Intent(FirstLaunchActivity.this, AuthActivity.class);
            } else {
                intent = new Intent(FirstLaunchActivity.this, MainActivity.class);
            }
            startActivity(intent);
            finish();
        });
    }
}