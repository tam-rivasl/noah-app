package com.noa.tamagotchi.data

import com.noa.tamagotchi.domain.model.TamagotchiAction
import com.noa.tamagotchi.domain.model.TamagotchiSnapshot
import com.noa.tamagotchi.domain.model.TamagotchiState
import kotlin.math.max
import kotlin.math.min
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class TamagotchiRepository(
    private val dataSource: TamagotchiStateDataSource,
    private val timeProvider: () -> Long = { System.currentTimeMillis() }
) {

    val state: Flow<TamagotchiState> = dataSource.snapshotFlow
        .map { snapshot -> snapshot.clamped().toDomain() }

    suspend fun refresh(): TamagotchiState {
        val now = timeProvider()
        val updated = dataSource.update { snapshot ->
            degrade(snapshot, now).copy(lastUpdatedMillis = now)
        }
        return updated.clamped().toDomain()
    }

    suspend fun applyAction(action: TamagotchiAction): TamagotchiState {
        val now = timeProvider()
        val updated = dataSource.update { snapshot ->
            val degraded = degrade(snapshot, now)
            val (withAction, message) = when (action) {
                TamagotchiAction.FEED -> degraded.adjust(
                    hungerDelta = 20,
                    hygieneDelta = -5,
                    happinessDelta = 5,
                    message = "Noa disfrutó una buena comida"
                )
                TamagotchiAction.PLAY -> degraded.adjust(
                    energyDelta = -10,
                    happinessDelta = 15,
                    hygieneDelta = -5,
                    message = "Noa se divirtió jugando"
                )
                TamagotchiAction.REST -> degraded.adjust(
                    energyDelta = 25,
                    hungerDelta = -5,
                    hygieneDelta = 5,
                    message = "Noa recuperó energía"
                )
                TamagotchiAction.CLEAN -> degraded.adjust(
                    hygieneDelta = 25,
                    happinessDelta = 8,
                    message = "Noa quedó reluciente"
                )
            }
            withAction.copy(
                lastUpdatedMillis = now,
                lastActionMessage = message
            )
        }
        return updated.clamped().toDomain()
    }

    suspend fun rewardDailyCoins(): TamagotchiState {
        val now = timeProvider()
        val updated = dataSource.update { snapshot ->
            val canReward = snapshot.lastRewardMillis == 0L ||
                now - snapshot.lastRewardMillis >= DAILY_REWARD_INTERVAL
            if (canReward) {
                snapshot.copy(
                    coins = snapshot.coins + DAILY_REWARD_COINS,
                    lastUpdatedMillis = now,
                    lastRewardMillis = now,
                    lastActionMessage = "Recibiste ${DAILY_REWARD_COINS} monedas diarias"
                )
            } else {
                snapshot
            }
        }
        return updated.clamped().toDomain()
    }

    private fun degrade(snapshot: TamagotchiSnapshot, now: Long): TamagotchiSnapshot {
        if (snapshot.lastUpdatedMillis == 0L) return snapshot
        val elapsedMinutes = max(0, ((now - snapshot.lastUpdatedMillis) / ONE_MINUTE_MILLIS).toInt())
        if (elapsedMinutes == 0) return snapshot
        val hungerLoss = elapsedMinutes / 2
        val energyLoss = elapsedMinutes / 3
        val hygieneLoss = elapsedMinutes / 4
        val happinessLoss = elapsedMinutes / 5
        return snapshot.copy(
            hunger = snapshot.hunger - hungerLoss,
            energy = snapshot.energy - energyLoss,
            hygiene = snapshot.hygiene - hygieneLoss,
            happiness = snapshot.happiness - happinessLoss
        )
    }

    private fun TamagotchiSnapshot.adjust(
        hungerDelta: Int = 0,
        energyDelta: Int = 0,
        hygieneDelta: Int = 0,
        happinessDelta: Int = 0,
        message: String
    ): Pair<TamagotchiSnapshot, String> {
        val experienceBonus = listOf(hungerDelta, energyDelta, hygieneDelta, happinessDelta)
            .map { delta -> if (delta > 0) delta else 0 }
            .sum() / EXPERIENCE_NORMALIZER
        val newExperience = experience + experienceBonus
        val levelUp = newExperience / EXPERIENCE_PER_LEVEL
        val remainingExperience = newExperience % EXPERIENCE_PER_LEVEL
        return copy(
            hunger = hunger + hungerDelta,
            energy = energy + energyDelta,
            hygiene = hygiene + hygieneDelta,
            happiness = happiness + happinessDelta,
            coins = coins + levelUp * LEVEL_UP_COINS,
            level = level + levelUp,
            experience = remainingExperience
        ) to message
    }

    private fun TamagotchiSnapshot.clamped(): TamagotchiSnapshot = copy(
        hunger = hunger.bound(),
        energy = energy.bound(),
        hygiene = hygiene.bound(),
        happiness = happiness.bound(),
        coins = max(0, coins),
        level = max(1, level),
        experience = experience.coerceIn(0, EXPERIENCE_PER_LEVEL)
    )

    private fun Int.bound(): Int = min(100, max(0, this))

    private fun TamagotchiSnapshot.toDomain(): TamagotchiState = TamagotchiState(
        hunger = hunger,
        energy = energy,
        hygiene = hygiene,
        happiness = happiness,
        coins = coins,
        level = level,
        experience = experience,
        lastActionMessage = lastActionMessage
    )

    companion object {
        private const val ONE_MINUTE_MILLIS = 60_000L
        private const val DAILY_REWARD_INTERVAL = 24 * 60 * 60 * 1000L
        private const val DAILY_REWARD_COINS = 25
        private const val EXPERIENCE_PER_LEVEL = 100
        private const val EXPERIENCE_NORMALIZER = 10
        private const val LEVEL_UP_COINS = 15
    }
}
