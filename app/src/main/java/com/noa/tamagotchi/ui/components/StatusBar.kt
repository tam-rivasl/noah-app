package com.noa.tamagotchi.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.contentColorFor
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun StatusBar(
    label: String,
    value: Int,
    color: Color = MaterialTheme.colorScheme.primary
) {
    val progress by animateFloatAsState(targetValue = value.coerceIn(0, 100) / 100f, label = "statusAnim")
    Box(modifier = Modifier.padding(vertical = 4.dp)) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(20.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(MaterialTheme.colorScheme.surfaceVariant)
        )
        Box(
            modifier = Modifier
                .fillMaxWidth(progress)
                .height(20.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(color)
        )
        Text(
            text = "$label: $value",
            modifier = Modifier
                .align(Alignment.CenterStart)
                .padding(horizontal = 12.dp),
            style = MaterialTheme.typography.labelLarge,
            color = contentColorFor(color).copy(alpha = 0.9f)
        )
    }
}
