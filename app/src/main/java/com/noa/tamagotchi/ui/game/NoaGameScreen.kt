package com.noa.tamagotchi.ui.game

import android.annotation.SuppressLint
import androidx.compose.animation.Crossfade
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.State
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.noa.tamagotchi.R
import com.noa.tamagotchi.ui.theme.NoaTamagotchiTheme
import com.noa.tamagotchi.ui.viewmodel.NoaState
import com.noa.tamagotchi.ui.viewmodel.NoaViewModel
import java.util.Calendar
import kotlin.math.roundToInt
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive

private const val BACKGROUND_REFRESH_INTERVAL_MS = 60_000L
private const val WALKING_FRAME_DURATION_MS = 120L
private const val EATING_FRAME_DURATION_MS = 250L
private const val WALKING_MOVEMENT_FRAME_MS = 16L
private val WALKING_FRAMES = listOf(
    R.drawable.noa_caminando_3,
    R.drawable.noa_caminando_4,
    R.drawable.noa_caminando_5,
    R.drawable.noa_caminando_6
)
private val EATING_FRAMES = listOf(
    R.drawable.noa_comiendo_1,
    R.drawable.noa_comiendo_2
)
private  val SLEEPING_FRAME = R.drawable.noa_durmiendo_1
private val NOA_SIZE = 176.dp

@Composable
fun NoaGameScreen(
    modifier: Modifier = Modifier,
    viewModel: NoaViewModel = viewModel()
) {
    val noaState by viewModel.state.collectAsStateWithLifecycle()
    val backgroundRes by rememberBackgroundResource()

    NoaGameScreenContent(
        noaState = noaState,
        backgroundRes = backgroundRes,
        onFeed = viewModel::feed,
        onSleep = viewModel::sleep,
        onWalk = viewModel::walk,
        modifier = modifier
    )
}

@Composable
private fun rememberBackgroundResource(): State<Int> {
    val backgroundState = remember { mutableIntStateOf(resolveBackgroundDrawable()) }
    LaunchedEffect(Unit) {
        while (isActive) {
            backgroundState.intValue = resolveBackgroundDrawable()
            delay(BACKGROUND_REFRESH_INTERVAL_MS)
        }
    }
    return backgroundState
}

@Composable
private fun NoaGameScreenContent(
    noaState: NoaState,
    backgroundRes: Int,
    onFeed: () -> Unit,
    onSleep: () -> Unit,
    onWalk: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(modifier = modifier.fillMaxSize()) {
        Crossfade(
            targetState = backgroundRes,
            animationSpec = tween(durationMillis = 500)
        ) { drawableRes ->
            Image(
                painter = painterResource(id = drawableRes),
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .systemBarsPadding()
                .padding(horizontal = 16.dp, vertical = 24.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.BottomCenter
            ) {
                NoaCharacter(
                    state = noaState,
                    spriteSize = NOA_SIZE
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            ActionRow(
                onFeed = onFeed,
                onSleep = onSleep,
                onWalk = onWalk
            )
        }
    }
}

@SuppressLint("UnusedBoxWithConstraintsScope")
@Composable
private fun NoaCharacter(
    state: NoaState,
    spriteSize: Dp,
    modifier: Modifier = Modifier
) {
    BoxWithConstraints(modifier = modifier.fillMaxSize()) {
        val density = LocalDensity.current
        val containerWidthPx = remember(maxWidth, density) { with(density) { maxWidth.toPx() } }
        val spriteWidthPx = remember(spriteSize, density) { with(density) { spriteSize.toPx() } }
        var frameIndex by remember { mutableIntStateOf(0) }
        var offsetPx by remember(spriteWidthPx) { mutableFloatStateOf(-spriteWidthPx) }
        val walkingSpeedPxPerSecond = remember(density) { with(density) { 72.dp.toPx() } }

        LaunchedEffect(state) {
            frameIndex = 0
            when (state) {
                NoaState.WALKING -> {
                    while (isActive) {
                        delay(WALKING_FRAME_DURATION_MS)
                        frameIndex = (frameIndex + 1) % WALKING_FRAMES.size
                    }
                }

                NoaState.EATING -> {
                    while (isActive) {
                        delay(EATING_FRAME_DURATION_MS)
                        frameIndex = (frameIndex + 1) % EATING_FRAMES.size
                    }
                }

                NoaState.SLEEPING -> frameIndex = 0
            }
        }

        LaunchedEffect(state, containerWidthPx) {
            if (state == NoaState.WALKING && containerWidthPx > 0f) {
                while (isActive) {
                    offsetPx += walkingSpeedPxPerSecond * (WALKING_MOVEMENT_FRAME_MS / 1000f)
                    if (offsetPx > containerWidthPx) {
                        offsetPx = -spriteWidthPx
                    }
                    delay(WALKING_MOVEMENT_FRAME_MS)
                }
            }
        }

        val currentDrawable = when (state) {
            NoaState.WALKING -> WALKING_FRAMES[frameIndex % WALKING_FRAMES.size]
            NoaState.EATING -> EATING_FRAMES[frameIndex % EATING_FRAMES.size]
            NoaState.SLEEPING -> SLEEPING_FRAME
        }

        val spriteDescription = when (state) {
            NoaState.WALKING -> "Noa caminando"
            NoaState.EATING -> "Noa comiendo"
            NoaState.SLEEPING -> "Noa durmiendo"
        }

        val spriteModifier = when (state) {
            NoaState.WALKING -> Modifier
                .align(Alignment.BottomStart)
                .offset { IntOffset(offsetPx.roundToInt(), 0) }
            else -> Modifier.align(Alignment.BottomCenter)
        }.size(spriteSize)

        Box(modifier = spriteModifier) {
            Image(
                painter = painterResource(id = currentDrawable),
                contentDescription = spriteDescription,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.FillBounds,
            )

            if (state == NoaState.SLEEPING) {
                SleepingZs(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(end = 8.dp, top = 8.dp)
                )
            }
        }
    }
}

@Composable
private fun SleepingZs(modifier: Modifier = Modifier) {
    val transition = rememberInfiniteTransition(label = "sleepZs")
    val firstOffset by transition.animateFloat(
        initialValue = 0f,
        targetValue = -28f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 2200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "firstOffset"
    )
    val firstAlpha by transition.animateFloat(
        initialValue = 0.9f,
        targetValue = 0f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 2200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "firstAlpha"
    )
    val secondOffset by transition.animateFloat(
        initialValue = -10f,
        targetValue = -38f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 2400, easing = LinearEasing, delayMillis = 350),
            repeatMode = RepeatMode.Restart
        ),
        label = "secondOffset"
    )
    val secondAlpha by transition.animateFloat(
        initialValue = 0.8f,
        targetValue = 0f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 2400, easing = LinearEasing, delayMillis = 350),
            repeatMode = RepeatMode.Restart
        ),
        label = "secondAlpha"
    )

    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Z",
            color = MaterialTheme.colorScheme.onPrimary,
            fontWeight = FontWeight.Bold,
            fontSize = 18.sp,
            modifier = Modifier
                .offset(y = firstOffset.dp)
                .alpha(firstAlpha)
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = "Z",
            color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.85f),
            fontWeight = FontWeight.SemiBold,
            fontSize = 16.sp,
            modifier = Modifier
                .offset(y = secondOffset.dp)
                .alpha(secondAlpha)
        )
    }
}

@Composable
private fun ActionRow(
    onFeed: () -> Unit,
    onSleep: () -> Unit,
    onWalk: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        ActionButton(text = "🥣 Alimentar", onClick = onFeed)
        ActionButton(text = "🌙 Dormir", onClick = onSleep)
        ActionButton(text = "🐕 Caminar", onClick = onWalk)
    }
}

@Composable
private fun RowScope.ActionButton(
    text: String,
    onClick: () -> Unit
) {
    Button(
        onClick = onClick,
        modifier = Modifier.weight(1f)
    ) {
        Text(text = text, fontWeight = FontWeight.Medium)
    }
}

private fun resolveBackgroundDrawable(): Int {
    val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
    return if (hour in 6..18) R.drawable.tarde else R.drawable.noche
}

@Preview(showSystemUi = true)
@Composable
private fun NoaGameScreenWalkingPreview() {
    NoaTamagotchiTheme {
        NoaGameScreenContent(
            noaState = NoaState.WALKING,
            backgroundRes = R.drawable.tarde,
            onFeed = {},
            onSleep = {},
            onWalk = {}
        )
    }
}

@Preview(showSystemUi = true)
@Composable
private fun NoaGameScreenEatingPreview() {
    NoaTamagotchiTheme {
        NoaGameScreenContent(
            noaState = NoaState.EATING,
            backgroundRes = R.drawable.tarde,
            onFeed = {},
            onSleep = {},
            onWalk = {}
        )
    }
}

@Preview(showSystemUi = true)
@Composable
private fun NoaGameScreenSleepingPreview() {
    NoaTamagotchiTheme {
        NoaGameScreenContent(
            noaState = NoaState.SLEEPING,
            backgroundRes = R.drawable.noche,
            onFeed = {},
            onSleep = {},
            onWalk = {}
        )
    }
}
