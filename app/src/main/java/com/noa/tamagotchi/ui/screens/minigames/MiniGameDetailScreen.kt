package com.noa.tamagotchi.ui.screens.minigames

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.noa.tamagotchi.domain.model.MiniGame
import kotlinx.coroutines.delay

@Composable
fun MiniGameDetailScreen(
    miniGame: MiniGame,
    onBack: () -> Unit,
    onComplete: () -> Unit
) {
    var score by remember { mutableIntStateOf(0) }
    var timeLeft by remember { mutableIntStateOf(30) }
    var finished by remember { mutableStateOf(false) }
    val targetScore = if (miniGame.id == "catch_ball") 12 else 8

    LaunchedEffect(key1 = finished) {
        if (!finished) {
            while (timeLeft > 0 && !finished) {
                delay(1000)
                timeLeft -= 1
            }
            if (!finished) {
                finished = true
                if (score >= targetScore) {
                    onComplete()
                }
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = miniGame.name) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(imageVector = Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(text = miniGame.description, style = MaterialTheme.typography.bodyLarge)
            Text(text = "Tiempo restante: ${timeLeft}s", style = MaterialTheme.typography.titleMedium)
            Text(text = "Puntaje: $score", style = MaterialTheme.typography.titleMedium)
            when (miniGame.id) {
                "catch_ball" -> CatchBallGame(
                    enabled = !finished && timeLeft > 0,
                    onCatch = {
                        score += 1
                        if (score >= targetScore) {
                            finished = true
                            onComplete()
                        }
                    }
                )
                "jump_obstacles" -> JumpObstaclesGame(
                    enabled = !finished && timeLeft > 0,
                    onSuccess = {
                        score += 2
                        if (score >= targetScore) {
                            finished = true
                            onComplete()
                        }
                    }
                )
            }
            if (finished && score < targetScore) {
                Text(
                    text = "¡Sigue practicando para alcanzar la meta!",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}

@Composable
private fun CatchBallGame(enabled: Boolean, onCatch: () -> Unit) {
    Button(
        onClick = onCatch,
        enabled = enabled,
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.medium
    ) {
        Text(text = if (enabled) "Atrapar pelota" else "Fin del juego")
    }
}

@Composable
private fun JumpObstaclesGame(enabled: Boolean, onSuccess: () -> Unit) {
    var readyToJump by remember { mutableStateOf(false) }

    LaunchedEffect(key1 = enabled) {
        while (enabled) {
            readyToJump = true
            delay(1200)
            if (enabled && readyToJump) {
                readyToJump = false
            }
            delay(800)
        }
    }

    Button(
        onClick = {
            if (enabled && readyToJump) {
                onSuccess()
                readyToJump = false
            }
        },
        enabled = enabled,
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.medium
    ) {
        Text(text = if (enabled) {
            if (readyToJump) "¡Salta ahora!" else "Espera..."
        } else "Fin del juego")
    }
}
