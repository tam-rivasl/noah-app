package com.noa.tamagotchi.ui.screens.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bathtub
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Hotel
import androidx.compose.material.icons.filled.Pets
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material.icons.filled.SportsEsports
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.noa.tamagotchi.domain.model.GameAction
import com.noa.tamagotchi.ui.components.ActionButton
import com.noa.tamagotchi.ui.components.AlertCard
import com.noa.tamagotchi.ui.components.NoaCharacter
import com.noa.tamagotchi.ui.components.StatusBar
import com.noa.tamagotchi.ui.state.NoaUiState

@Composable
fun HomeScreen(
    uiState: NoaUiState,
    onAction: (GameAction) -> Unit,
    onNavigateToShop: () -> Unit,
    onNavigateToMiniGames: () -> Unit,
    onClaimDailyReward: () -> Unit
) {
    val stats = uiState.noaState
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Hola, soy Noa",
                    style = MaterialTheme.typography.headlineMedium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(12.dp))
                NoaCharacter(energy = stats.energy, happiness = stats.happiness)
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Nivel ${stats.level} • ${stats.coins} monedas",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
        }

        AlertCard(messages = uiState.alerts)

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                StatusBar(label = "Salud", value = stats.health, color = MaterialTheme.colorScheme.primary)
                StatusBar(label = "Sueño", value = stats.sleep, color = MaterialTheme.colorScheme.secondary)
                StatusBar(label = "Hambre", value = stats.hunger, color = MaterialTheme.colorScheme.tertiary)
                StatusBar(label = "Felicidad", value = stats.happiness, color = MaterialTheme.colorScheme.primaryContainer)
                StatusBar(label = "Energía", value = stats.energy, color = MaterialTheme.colorScheme.secondaryContainer)
            }
        }

        Text(text = "Acciones", style = MaterialTheme.typography.titleMedium)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                ActionButton(label = "Alimentar", icon = Icons.Default.Restaurant) {
                    onAction(GameAction.FEED)
                }
                ActionButton(label = "Dormir", icon = Icons.Default.Hotel) {
                    onAction(GameAction.SLEEP)
                }
                ActionButton(label = "Acariciar", icon = Icons.Default.Pets) {
                    onAction(GameAction.PET)
                }
            }
            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                ActionButton(label = "Jugar", icon = Icons.Default.SportsEsports) {
                    onAction(GameAction.PLAY)
                }
                ActionButton(label = "Bañar", icon = Icons.Default.Bathtub) {
                    onAction(GameAction.BATHE)
                }
                ActionButton(label = "Mimos", icon = Icons.Default.Favorite) {
                    onAction(GameAction.PET)
                }
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Button(
                onClick = onNavigateToShop,
                modifier = Modifier.weight(1f),
                shape = MaterialTheme.shapes.medium
            ) { Text(text = "Ir a la tienda") }
            Button(
                onClick = onNavigateToMiniGames,
                modifier = Modifier.weight(1f),
                shape = MaterialTheme.shapes.medium
            ) { Text(text = "Mini juegos") }
        }

        Button(
            onClick = onClaimDailyReward,
            enabled = uiState.dailyRewardAvailable,
            modifier = Modifier.fillMaxWidth(),
            shape = MaterialTheme.shapes.medium
        ) {
            Text(text = if (uiState.dailyRewardAvailable) "Reclamar recompensa diaria" else "Vuelve más tarde")
        }
    }
}
