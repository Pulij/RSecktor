package com.example.rsecktor.Service;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class UpdateCheckerService {

    private static final String GITHUB_API_URL = "https://api.github.com/repos/Pulij/RSecktor/releases/latest";

    @RequiresApi(api = Build.VERSION_CODES.TIRAMISU)
    public static void checkForUpdate(Context context) {
        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder()
                .url(GITHUB_API_URL)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                e.printStackTrace();
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if (response.isSuccessful()) {
                    assert response.body() != null;
                    String jsonResponse = response.body().string();
                    try {
                        JSONObject jsonObject = new JSONObject(jsonResponse);
                        String latestVersion = jsonObject.getString("tag_name");
                        JSONArray assetsArray = jsonObject.getJSONArray("assets");
                        String apkUrl = assetsArray.getJSONObject(0).getString("browser_download_url");

                        if (isNewVersionAvailable(context, latestVersion)) {
                            downloadAndInstallApk(context, apkUrl);
                        }
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }
            }
        });
    }

    private static boolean isNewVersionAvailable(Context context, String latestVersion) {
        String currentVersion = getCurrentAppVersion(context);
        return !latestVersion.equals(currentVersion);
    }

    private static String getCurrentAppVersion(Context context) {
        try {
            PackageInfo packageInfo = context.getPackageManager().getPackageInfo(context.getPackageName(), 0);
            return packageInfo.versionName;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
            return "0";
        }
    }

    private static void downloadAndInstallApk(Context context, String apkUrl) {
        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder()
                .url(apkUrl)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                e.printStackTrace();
            }

            @RequiresApi(api = Build.VERSION_CODES.O)
            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if (response.isSuccessful()) {
                    File apkFile = new File(context.getExternalFilesDir(null), "update.apk");
                    assert response.body() != null;
                    try (InputStream in = response.body().byteStream();
                         OutputStream out = Files.newOutputStream(apkFile.toPath())) {
                        byte[] buffer = new byte[1024];
                        int read;
                        while ((read = in.read(buffer)) != -1) {
                            out.write(buffer, 0, read);
                        }
                    }

                    installApk(context, apkFile);
                }
            }
        });
    }

    private static void installApk(Context context, File apkFile) {
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setDataAndType(Uri.fromFile(apkFile), "application/vnd.android.package-archive");
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
    }
}