package com.noa.tamagotchi.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.noa.tamagotchi.R

@Composable
fun NoaCharacter(energy: Int, happiness: Int, modifier: Modifier = Modifier) {
    val backgroundColor by animateColorAsState(
        targetValue = when {
            happiness < 30 -> MaterialTheme.colorScheme.errorContainer
            energy < 30 -> MaterialTheme.colorScheme.tertiaryContainer
            else -> MaterialTheme.colorScheme.primaryContainer
        },
        label = "noa-bg"
    )
    Box(
        modifier = modifier
            .size(220.dp)
            .clip(CircleShape)
            .background(backgroundColor),
        contentAlignment = Alignment.Center
    ) {
        Image(
            painter = painterResource(id = R.drawable.ic_noa_launcher),
            contentDescription = "Noa",
            modifier = Modifier.padding(24.dp)
        )
    }
}
