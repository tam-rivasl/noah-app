package com.noa.tamagotchi.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColors = lightColorScheme(
    primary = PastelPurple,
    onPrimary = TextPrimary,
    primaryContainer = PastelPink,
    onPrimaryContainer = TextPrimary,
    secondary = PastelBlue,
    onSecondary = TextPrimary,
    secondaryContainer = PastelGreen,
    onSecondaryContainer = TextPrimary,
    tertiary = PastelGreen,
    onTertiary = TextPrimary,
    background = ColorPalette.background,
    onBackground = TextPrimary,
    surface = ColorPalette.surface,
    onSurface = TextPrimary
)

private val DarkColors = darkColorScheme(
    primary = PastelPink,
    onPrimary = ColorPalette.darkText,
    secondary = PastelPurple,
    onSecondary = ColorPalette.darkText,
    tertiary = PastelBlue,
    onTertiary = Color.Black,
    background = ColorPalette.darkBackground,
    onBackground = ColorPalette.darkText,
    surface = ColorPalette.darkSurface,
    onSurface = ColorPalette.darkText
)

@Composable
fun NoaTamagotchiTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColors
        else -> LightColors
    }

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.primary.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        shapes = Shapes,
        content = content
    )
}

private object ColorPalette {
    val background = PastelYellow
    val surface = PastelBlue
    val darkBackground = PastelPurple.copy(alpha = 0.6f)
    val darkSurface = PastelPurple.copy(alpha = 0.8f)
    val darkText = Color.White
}
