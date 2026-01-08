package com.app

import android.app.Activity
import android.content.Intent
import android.content.IntentSender
import com.facebook.react.bridge.*
import com.google.android.gms.common.api.ResolvableApiException
import com.google.android.gms.location.*
import android.app.Activity.RESULT_OK

class LocationEnablerModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext),
    ActivityEventListener {

    private var promise: Promise? = null

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = "LocationEnabler"

    @ReactMethod
    fun isLocationEnabled(promise: Promise) {
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "No foreground activity")
            return
        }

        val locationRequest = LocationRequest.Builder(
            Priority.PRIORITY_HIGH_ACCURACY,
            10_000
        ).build()

        val builder = LocationSettingsRequest.Builder()
            .addLocationRequest(locationRequest)

        LocationServices
            .getSettingsClient(activity)
            .checkLocationSettings(builder.build())
            .addOnSuccessListener {
                promise.resolve(true)
            }
            .addOnFailureListener {
                promise.resolve(false)
            }
    }

    @ReactMethod
    fun promptForEnableLocation(promise: Promise) {
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "No foreground activity")
            return
        }

        this.promise = promise

        val locationRequest = LocationRequest.Builder(
            Priority.PRIORITY_HIGH_ACCURACY,
            10_000
        ).build()

        val builder = LocationSettingsRequest.Builder()
            .addLocationRequest(locationRequest)
            .setAlwaysShow(true)

        LocationServices
            .getSettingsClient(activity)
            .checkLocationSettings(builder.build())
            .addOnSuccessListener {
                promise.resolve("already-enabled")
            }
            .addOnFailureListener { ex ->
                if (ex is ResolvableApiException) {
                    try {
                        ex.startResolutionForResult(activity, REQUEST_CHECK_SETTINGS)
                    } catch (e: IntentSender.SendIntentException) {
                        promise.reject("INTENT_ERROR", e)
                    }
                } else {
                    promise.reject("UNRESOLVABLE", ex)
                }
            }
    }

    // ✅ REQUIRED by ActivityEventListener (NON-NULL TYPES!)
    override fun onActivityResult(
        activity: Activity,
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {
        if (requestCode == REQUEST_CHECK_SETTINGS) {
            if (resultCode == RESULT_OK) {
                promise?.resolve("enabled")
            } else {
                promise?.reject("CANCELLED", "User cancelled")
            }
            promise = null
        }
    }

    // ✅ REQUIRED by ActivityEventListener
    override fun onNewIntent(intent: Intent) {
        // no-op
    }

    companion object {
        const val REQUEST_CHECK_SETTINGS = 999
    }
}
