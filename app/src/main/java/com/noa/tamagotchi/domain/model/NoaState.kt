package com.noa.tamagotchi.domain.model

data class NoaState(
    val health: Int = 80,
    val sleep: Int = 80,
    val hunger: Int = 60,
    val happiness: Int = 75,
    val energy: Int = 70,
    val coins: Int = 50,
    val level: Int = 1,
    val experience: Int = 0,
    val lastUpdated: Long = System.currentTimeMillis(),
    val lastDailyReward: Long = 0L,
    val inventory: Map<String, Int> = emptyMap()
) {
    fun clamp(): NoaState = copy(
        health = health.coerceIn(0, 100),
        sleep = sleep.coerceIn(0, 100),
        hunger = hunger.coerceIn(0, 100),
        happiness = happiness.coerceIn(0, 100),
        energy = energy.coerceIn(0, 100)
    )
}
