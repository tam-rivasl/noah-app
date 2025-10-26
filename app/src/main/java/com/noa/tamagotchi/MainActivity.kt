package com.noa.tamagotchi

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.noa.tamagotchi.ui.game.NoaGameScreen
import com.noa.tamagotchi.ui.theme.NoaTamagotchiTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            NoaTamagotchiTheme {
                NoaGameScreen()
            }
        }
    }
}
