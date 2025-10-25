package com.noa.tamagotchi.data

import com.noa.tamagotchi.domain.model.ActionResult
import com.noa.tamagotchi.domain.model.AttributeEffect
import com.noa.tamagotchi.domain.model.GameAction
import com.noa.tamagotchi.domain.model.MiniGame
import com.noa.tamagotchi.domain.model.NoaState
import com.noa.tamagotchi.domain.model.ShopItem
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlin.math.max

class NoaRepository(private val dataSource: NoaPreferencesDataSource) {

    val noaState: Flow<NoaState> = dataSource.noaState.map { it.clamp() }

    suspend fun refreshState(): NoaState {
        val now = System.currentTimeMillis()
        val current = dataSource.getCurrentState()
        val degraded = degradeStats(current, now)
        val normalized = evaluateDerivedStats(degraded).copy(lastUpdated = now).clamp()
        dataSource.updateState(normalized)
        return normalized
    }

    suspend fun performAction(action: GameAction): ActionResult {
        val now = System.currentTimeMillis()
        val current = dataSource.getCurrentState()
        val degraded = degradeStats(current, now)
        val (updated, message) = when (action) {
            GameAction.FEED -> applyFeed(degraded)
            GameAction.SLEEP -> applySleep(degraded)
            GameAction.PLAY -> applyPlay(degraded)
            GameAction.BATHE -> applyBathe(degraded)
            GameAction.PET -> applyPet(degraded)
        }
        val normalized = evaluateDerivedStats(updated).copy(lastUpdated = now).clamp()
        dataSource.updateState(normalized)
        return ActionResult(normalized, message)
    }

    suspend fun purchase(item: ShopItem): ActionResult {
        val current = dataSource.getCurrentState()
        if (current.coins < item.price) {
            return ActionResult(current, "No tienes suficientes monedas")
        }
        val updatedInventory = current.inventory.toMutableMap().apply {
            val currentQty = getOrDefault(item.id, 0)
            put(item.id, currentQty + 1)
        }
        val newState = current.copy(
            coins = current.coins - item.price,
            inventory = updatedInventory
        )
        dataSource.updateState(newState)
        return ActionResult(newState, "Compraste ${item.name}")
    }

    suspend fun useItem(item: ShopItem): ActionResult {
        val current = dataSource.getCurrentState()
        val quantity = current.inventory[item.id] ?: 0
        if (quantity <= 0) {
            return ActionResult(current, "No tienes ${item.name}")
        }
        val updatedInventory = current.inventory.toMutableMap().apply {
            if (quantity == 1) {
                remove(item.id)
            } else {
                put(item.id, quantity - 1)
            }
        }
        val updated = applyItemEffect(current.copy(inventory = updatedInventory), item)
        dataSource.updateState(updated)
        return ActionResult(updated, "Usaste ${item.name}")
    }

    suspend fun rewardFromMiniGame(miniGame: MiniGame): ActionResult {
        val current = dataSource.getCurrentState()
        val updated = addExperience(
            current.copy(
                coins = current.coins + miniGame.rewardCoins
            ),
            miniGame.rewardExperience
        )
        dataSource.updateState(updated)
        return ActionResult(updated, "Ganaste ${miniGame.rewardCoins} monedas")
    }

    suspend fun claimDailyReward(): ActionResult {
        val now = System.currentTimeMillis()
        val current = dataSource.getCurrentState()
        val dayMillis = 24 * 60 * 60 * 1000L
        return if (now - current.lastDailyReward >= dayMillis) {
            val updated = current.copy(
                coins = current.coins + DAILY_REWARD_COINS,
                lastDailyReward = now
            )
            dataSource.updateState(updated)
            ActionResult(updated, "Recompensa diaria reclamada")
        } else {
            ActionResult(current, "Ya reclamaste la recompensa diaria")
        }
    }

    private fun applyFeed(state: NoaState): Pair<NoaState, String?> {
        val inventory = state.inventory
        return if ((inventory[FOOD_ID] ?: 0) > 0) {
            val newInventory = inventory.toMutableMap().apply {
                val remaining = getValue(FOOD_ID) - 1
                if (remaining <= 0) remove(FOOD_ID) else put(FOOD_ID, remaining)
            }
            val updated = state.copy(
                hunger = state.hunger + 25,
                happiness = state.happiness + 10,
                health = state.health + 5,
                inventory = newInventory
            )
            updated to "Noa disfrutó la comida"
        } else {
            state.copy(hunger = state.hunger + 10, happiness = state.happiness + 3) to "Compra comida en la tienda"
        }
    }

    private fun applySleep(state: NoaState): Pair<NoaState, String?> =
        state.copy(
            sleep = state.sleep + 30,
            energy = state.energy + 25,
            happiness = state.happiness + 5
        ) to "Noa tuvo una buena siesta"

    private fun applyPlay(state: NoaState): Pair<NoaState, String?> =
        state.copy(
            happiness = state.happiness + 20,
            energy = state.energy - 10,
            health = state.health + 2
        ) to "Noa se divirtió jugando"

    private fun applyBathe(state: NoaState): Pair<NoaState, String?> =
        state.copy(
            health = state.health + 15,
            happiness = state.happiness + 8
        ) to "Noa está limpio y contento"

    private fun applyPet(state: NoaState): Pair<NoaState, String?> =
        state.copy(
            happiness = state.happiness + 12,
            energy = state.energy + 5
        ) to "Noa se siente amado"

    private fun degradeStats(state: NoaState, now: Long): NoaState {
        val elapsedMinutes = max(0, ((now - state.lastUpdated) / 60000L).toInt())
        if (elapsedMinutes == 0) return state
        val hungerLoss = elapsedMinutes * 2
        val sleepLoss = elapsedMinutes
        val energyLoss = (elapsedMinutes * 1.5).toInt()
        val happinessLoss = elapsedMinutes
        val healthLoss = max(0, elapsedMinutes / 2)
        return state.copy(
            hunger = state.hunger - hungerLoss,
            sleep = state.sleep - sleepLoss,
            energy = state.energy - energyLoss,
            happiness = state.happiness - happinessLoss,
            health = state.health - healthLoss
        )
    }

    private fun evaluateDerivedStats(state: NoaState): NoaState {
        var health = state.health
        if (state.hunger < 20) health -= 10
        if (state.sleep < 20) health -= 8
        if (state.energy < 15) health -= 5
        if (state.happiness < 15) health -= 6
        if (state.hunger > 80 && state.happiness > 80) health += 5
        val coins = state.coins + if (state.happiness > 90) 1 else 0
        return state.copy(health = health, coins = coins).clamp()
    }

    private fun addExperience(state: NoaState, amount: Int): NoaState {
        var experience = state.experience + amount
        var level = state.level
        var coins = state.coins
        while (experience >= EXP_PER_LEVEL) {
            experience -= EXP_PER_LEVEL
            level += 1
            coins += LEVEL_UP_REWARD
        }
        return state.copy(level = level, experience = experience, coins = coins)
    }

    fun availableShopItems(): List<ShopItem> = listOf(
        ShopItem(
            id = FOOD_ID,
            name = "Croqueta deliciosa",
            description = "Rellena la pancita de Noa",
            price = 15,
            effect = AttributeEffect(hungerDelta = 30, happinessDelta = 5)
        ),
        ShopItem(
            id = "toy_ball",
            name = "Pelota suave",
            description = "Para jugar en el parque virtual",
            price = 25,
            effect = AttributeEffect(happinessDelta = 20, energyDelta = -5)
        ),
        ShopItem(
            id = "spa_pass",
            name = "Spa relajante",
            description = "Recupera energía y felicidad",
            price = 40,
            effect = AttributeEffect(energyDelta = 25, happinessDelta = 15)
        )
    )

    fun miniGames(): List<MiniGame> = listOf(
        MiniGame(
            id = "catch_ball",
            name = "Atrapa la pelota",
            description = "Toca las pelotas que caen para que Noa las atrape",
            rewardCoins = 20,
            rewardExperience = 30
        ),
        MiniGame(
            id = "jump_obstacles",
            name = "Salta los obstáculos",
            description = "Salta al ritmo correcto para esquivar obstáculos",
            rewardCoins = 25,
            rewardExperience = 35
        )
    )

    fun applyItemEffect(state: NoaState, item: ShopItem): NoaState =
        state.copy(
            health = state.health + item.effect.healthDelta,
            sleep = state.sleep + item.effect.sleepDelta,
            hunger = state.hunger + item.effect.hungerDelta,
            happiness = state.happiness + item.effect.happinessDelta,
            energy = state.energy + item.effect.energyDelta
        ).clamp()

    companion object {
        private const val EXP_PER_LEVEL = 100
        private const val LEVEL_UP_REWARD = 15
        private const val DAILY_REWARD_COINS = 50
        private const val FOOD_ID = "premium_food"
    }
}
