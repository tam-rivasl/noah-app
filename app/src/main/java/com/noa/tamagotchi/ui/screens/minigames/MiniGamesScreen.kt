package com.noa.tamagotchi.ui.screens.minigames

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.noa.tamagotchi.domain.model.MiniGame
import com.noa.tamagotchi.ui.state.NoaUiState

@Composable
fun MiniGamesScreen(
    uiState: NoaUiState,
    onBack: () -> Unit,
    onOpenMiniGame: (MiniGame) -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = "Mini juegos") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(imageVector = Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(uiState.miniGames) { miniGame ->
                MiniGameCard(miniGame = miniGame, onClick = { onOpenMiniGame(miniGame) })
            }
        }
    }
}

@Composable
fun MiniGameCard(miniGame: MiniGame, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        onClick = onClick
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(text = miniGame.name, style = MaterialTheme.typography.titleMedium)
            Text(text = miniGame.description, style = MaterialTheme.typography.bodyMedium)
            Text(
                text = "Recompensas: ${miniGame.rewardCoins} monedas • ${miniGame.rewardExperience} XP",
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}
