package com.noa.tamagotchi.ui.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.noa.tamagotchi.R
import com.noa.tamagotchi.domain.model.TamagotchiAction
import com.noa.tamagotchi.ui.state.NoaUiState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    uiState: NoaUiState,
    onAction: (TamagotchiAction) -> Unit,
    onRefresh: () -> Unit,
    onReward: () -> Unit
) {
    val snackbarHostState = remember { SnackbarHostState() }
    val snapshot = uiState.state

    LaunchedEffect(snapshot?.lastActionMessage) {
        val message = snapshot?.lastActionMessage
        if (!message.isNullOrBlank()) {
            snackbarHostState.showSnackbar(message)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = stringResource(id = R.string.app_name)) },
                actions = {
                    IconButton(onClick = onRefresh) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = stringResource(id = R.string.cd_refresh)
                        )
                    }
                }
            )
        },
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) }
    ) { innerPadding ->
        if (uiState.isLoading) {
            Column(
                modifier = Modifier
                    .padding(innerPadding)
                    .fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                CircularProgressIndicator()
                Spacer(modifier = Modifier.height(16.dp))
                Text(text = stringResource(id = R.string.label_loading))
            }
        } else if (snapshot != null) {
            Column(
                modifier = Modifier
                    .padding(innerPadding)
                    .verticalScroll(rememberScrollState())
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                StatsCard(snapshot)
                ActionsSection(onAction = onAction, onReward = onReward)
            }
        }
    }
}

@Composable
private fun StatsCard(state: com.noa.tamagotchi.domain.model.TamagotchiState) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = stringResource(id = R.string.label_status, state.level),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            MetricRow(label = stringResource(id = R.string.metric_hunger), value = state.hunger)
            MetricRow(label = stringResource(id = R.string.metric_energy), value = state.energy)
            MetricRow(label = stringResource(id = R.string.metric_hygiene), value = state.hygiene)
            MetricRow(label = stringResource(id = R.string.metric_happiness), value = state.happiness)
            MetricRow(label = stringResource(id = R.string.metric_coins), value = state.coins, max = null)
        }
    }
}

@Composable
private fun MetricRow(label: String, value: Int, max: Int? = 100) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = label)
        val displayText = max?.let { "$value / $it" } ?: value.toString()
        Text(
            text = displayText,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.semantics {
                contentDescription = if (max != null) {
                    "$label: $value de $max"
                } else {
                    "$label: $value"
                }
            }
        )
    }
}

@Composable
private fun ActionsSection(
    onAction: (TamagotchiAction) -> Unit,
    onReward: () -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text(
            text = stringResource(id = R.string.label_actions),
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )
        ActionGrid(onAction = onAction)
        Button(
            onClick = onReward,
            modifier = Modifier.fillMaxWidth(),
            contentPadding = PaddingValues(vertical = 12.dp)
        ) {
            Text(text = stringResource(id = R.string.action_daily_reward))
        }
    }
}

@Composable
private fun ActionGrid(onAction: (TamagotchiAction) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            ActionButton(
                text = stringResource(id = R.string.action_feed),
                color = MaterialTheme.colorScheme.primary,
                onClick = { onAction(TamagotchiAction.FEED) }
            )
            ActionButton(
                text = stringResource(id = R.string.action_play),
                color = MaterialTheme.colorScheme.secondary,
                onClick = { onAction(TamagotchiAction.PLAY) }
            )
        }
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            ActionButton(
                text = stringResource(id = R.string.action_rest),
                color = MaterialTheme.colorScheme.tertiary,
                onClick = { onAction(TamagotchiAction.REST) }
            )
            ActionButton(
                text = stringResource(id = R.string.action_clean),
                color = MaterialTheme.colorScheme.primaryContainer,
                contentColor = MaterialTheme.colorScheme.onPrimaryContainer,
                onClick = { onAction(TamagotchiAction.CLEAN) }
            )
        }
    }
}

@Composable
private fun RowScope.ActionButton(
    text: String,
    color: Color,
    contentColor: Color = MaterialTheme.colorScheme.onPrimary,
    onClick: () -> Unit
) {
    Button(
        onClick = onClick,
        modifier = Modifier.weight(1f),
        colors = androidx.compose.material3.ButtonDefaults.buttonColors(
            containerColor = color,
            contentColor = contentColor
        )
    ) {
        Text(text = text)
    }
}
