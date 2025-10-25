package com.noa.tamagotchi

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import com.noa.tamagotchi.ui.navigation.NoaNavHost
import com.noa.tamagotchi.ui.theme.NoaTamagotchiTheme
import com.noa.tamagotchi.ui.viewmodel.NoaViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: NoaViewModel by viewModels {
        NoaViewModel.factory((application as NoaTamagotchiApp).repository)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            NoaApp(viewModel)
        }
    }
}

@Composable
fun NoaApp(viewModel: NoaViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    NoaTamagotchiTheme {
        Surface(color = MaterialTheme.colorScheme.background) {
            NoaNavHost(uiState = uiState, viewModel = viewModel)
        }
    }
}
