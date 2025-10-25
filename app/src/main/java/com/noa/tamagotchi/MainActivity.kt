package com.noa.tamagotchi

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import com.noa.tamagotchi.ui.home.HomeScreen
import com.noa.tamagotchi.ui.theme.NoaTamagotchiTheme
import com.noa.tamagotchi.ui.viewmodel.NoaViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: NoaViewModel by viewModels {
        NoaViewModel.factory((application as NoaTamagotchiApp).repository)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            NoaTamagotchiTheme {
                val uiState by viewModel.uiState.collectAsState()
                HomeScreen(
                    uiState = uiState,
                    onAction = viewModel::onAction,
                    onRefresh = viewModel::refresh,
                    onReward = viewModel::onDailyReward
                )
            }
        }
    }
}
