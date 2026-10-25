package com.tz.photoedit;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.View;
import android.webkit.*;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.webkit.WebViewAssetLoader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

public class MainActivity extends AppCompatActivity {
    private static final int REQ_FILE = 11, REQ_PERM = 12;
    private static final String HOME = "https://appassets.androidplatform.net/assets/index.html";
    private static final String DIR = "TZ phot edit";
    private WebView web;
    private ValueCallback<Uri[]> filePathCb;
    private long lastBack = 0;

    private static final String HOOK =
        "(function(){if(window.__tzHook)return;window.__tzHook=true;"
        + "var oc=HTMLAnchorElement.prototype.click;"
        + "function h(a){var u=a.href||'';if(a.hasAttribute('download')&&(u.indexOf('blob:')===0||u.indexOf('data:')===0)){"
        + "fetch(u).then(function(r){return r.blob()}).then(function(b){var f=new FileReader();f.onload=function(){var s=f.result;"
        + "Android.saveFile(a.getAttribute('download')||'tz-export',b.type||'application/octet-stream',s.substring(s.indexOf(',')+1));};"
        + "f.readAsDataURL(b);});return true;}return false;}"
        + "HTMLAnchorElement.prototype.click=function(){if(!h(this))oc.call(this);};"
        + "document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[download]');if(a&&h(a)){e.preventDefault();}},true);"
        + "})();";

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        web = new WebView(this);
        setContentView(web);
        if (Build.VERSION.SDK_INT < 29 && checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED)
            requestPermissions(new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, REQ_PERM);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setTextZoom(100);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.addJavascriptInterface(new Bridge(), "Android");

        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this)).build();
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) {
                return loader.shouldInterceptRequest(r.getUrl());
            }
            @Override public void onPageStarted(WebView v, String u, android.graphics.Bitmap f) { v.evaluateJavascript(HOOK, null); }
            @Override public void onPageFinished(WebView v, String u) { v.evaluateJavascript(HOOK, null); }
            @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                if ("appassets.androidplatform.net".equals(u.getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) {}
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (filePathCb != null) filePathCb.onReceiveValue(null);
                filePathCb = cb;
                try { startActivityForResult(p.createIntent(), REQ_FILE); }
                catch (Exception e) { filePathCb = null; return false; }
                return true;
            }
            @Override public boolean onJsAlert(WebView v, String u, String m, final JsResult r) {
                new AlertDialog.Builder(MainActivity.this).setMessage(m)
                    .setPositiveButton(android.R.string.ok, (d, w) -> r.confirm())
                    .setOnCancelListener(d -> r.cancel()).show();
                return true;
            }
            @Override public boolean onJsConfirm(WebView v, String u, String m, final JsResult r) {
                new AlertDialog.Builder(MainActivity.this).setMessage(m)
                    .setPositiveButton(android.R.string.ok, (d, w) -> r.confirm())
                    .setNegativeButton(android.R.string.cancel, (d, w) -> r.cancel())
                    .setOnCancelListener(d -> r.cancel()).show();
                return true;
            }
        });
        if (b != null) web.restoreState(b); else web.loadUrl(HOME);
    }

    class Bridge {
        @JavascriptInterface public void saveFile(String name, String mime, String b64) {
            try {
                byte[] data = Base64.decode(b64, Base64.DEFAULT);
                name = name.replaceAll("[\\\\/:*?\"<>|]", "_");
                boolean img = mime != null && mime.startsWith("image/");
                OutputStream os; String where;
                if (Build.VERSION.SDK_INT >= 29) {
                    ContentValues cv = new ContentValues();
                    cv.put(MediaStore.MediaColumns.DISPLAY_NAME, name);
                    cv.put(MediaStore.MediaColumns.MIME_TYPE, mime);
                    String base = img ? Environment.DIRECTORY_PICTURES : Environment.DIRECTORY_DOWNLOADS;
                    cv.put(MediaStore.MediaColumns.RELATIVE_PATH, base + "/" + DIR);
                    Uri col = img ? MediaStore.Images.Media.EXTERNAL_CONTENT_URI : MediaStore.Downloads.EXTERNAL_CONTENT_URI;
                    Uri uri = getContentResolver().insert(col, cv);
                    os = getContentResolver().openOutputStream(uri);
                    where = base + "/" + DIR;
                } else {
                    File d = new File(Environment.getExternalStoragePublicDirectory(
                        img ? Environment.DIRECTORY_PICTURES : Environment.DIRECTORY_DOWNLOADS), DIR);
                    d.mkdirs();
                    File f = new File(d, name);
                    os = new FileOutputStream(f);
                    where = d.getPath();
                    sendBroadcast(new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE, Uri.fromFile(f)));
                }
                os.write(data); os.close();
                final String w = where;
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "Saved to " + w, Toast.LENGTH_LONG).show());
            } catch (Exception e) {
                final String m = String.valueOf(e.getMessage());
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "Save failed: " + m, Toast.LENGTH_LONG).show());
            }
        }
    }

    @Override protected void onActivityResult(int req, int res, Intent data) {
        if (req == REQ_FILE && filePathCb != null) {
            filePathCb.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(res, data));
            filePathCb = null;
        } else super.onActivityResult(req, res, data);
    }
    @Override protected void onSaveInstanceState(Bundle o) { super.onSaveInstanceState(o); web.saveState(o); }
    @Override public void onBackPressed() {
        long n = System.currentTimeMillis();
        if (n - lastBack < 2000) super.onBackPressed();
        else { lastBack = n; Toast.makeText(this, "Press back again to exit", Toast.LENGTH_SHORT).show(); }
    }
    @Override protected void onPause() { super.onPause(); web.onPause(); }
    @Override protected void onResume() { super.onResume(); web.onResume(); }
}
