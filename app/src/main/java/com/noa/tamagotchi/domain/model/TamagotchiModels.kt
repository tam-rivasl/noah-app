package com.noa.tamagotchi.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class TamagotchiSnapshot(
    @SerialName("hunger") val hunger: Int = 70,
    @SerialName("energy") val energy: Int = 65,
    @SerialName("hygiene") val hygiene: Int = 80,
    @SerialName("happiness") val happiness: Int = 75,
    @SerialName("coins") val coins: Int = 40,
    @SerialName("level") val level: Int = 1,
    @SerialName("experience") val experience: Int = 0,
    @SerialName("lastUpdatedMillis") val lastUpdatedMillis: Long = 0L,
    @SerialName("lastRewardMillis") val lastRewardMillis: Long = 0L,
    @SerialName("lastActionMessage") val lastActionMessage: String? = null
)

data class TamagotchiState(
    val hunger: Int,
    val energy: Int,
    val hygiene: Int,
    val happiness: Int,
    val coins: Int,
    val level: Int,
    val experience: Int,
    val lastActionMessage: String?
)

enum class TamagotchiAction {
    FEED,
    PLAY,
    REST,
    CLEAN
}
